import {
    StateHandler
} from "./StateHandler.js";
import {
    calculateRanking
} from "./Ranking.js";


let datasetsInformation = [{
        "src": "../data/co2_emissions_tonnes_per_person.csv",
        "title": "CO2 Emissions in tonnes per person",
        "units": " tonnes per capita",
        "id": "co2-t-per-capita"
    },
    {
        "src": "../data/co2_emissionsInKt.csv",
        "title": "CO2 Emissions in Kilotonnes",
        "units": " Kilotonnes",
        "id": "co2-kt"
    }
]

let idToDataPoints = new Map();
let idToData = new Map();
let world;


function loadEmptyMap(nextCallback) {
    StateHandler.setState('Loading Data', `Loading the map`);
    let queue = d3.queue();
    queue.defer(d3.json, "../map.json")
    queue.await((error, worldLoaded) => {
        world = worldLoaded
        prepareData(nextCallback, error, world);
    });
}

function createQueue(nextCallback) {
    StateHandler.setState('Loading Data', `Loading ${datasetsInformation.length} Datasets`);
    let queue = d3.queue();
    datasetsInformation.forEach((dataset) => {
        queue.defer(d3.csv, dataset.src)
    });
    queue.await((error, ...data) => {
        prepareData(nextCallback, error, world, ...data);
    });
}

function getDataById(id) {
    return idToData.get(id)
}

function getDataPoints(readData) {
    let id = readData.id;
    if (idToDataPoints[id]) return idToDataPoints[id];
    let dataPoints = readData['columns'];
    let index = dataPoints.indexOf('country');
    dataPoints.splice(index, 1);
    idToDataPoints.set(id, dataPoints);
    return dataPoints;
}

function calculateMinMaxMean(dataPoint, data) {
    let min = Infinity;
    let max = -Infinity;
    let total = 0;
    let numberOfElementsWithData = 0;
    data.forEach((line) => {
        if (line[dataPoint] == "") return;
        min = (+line[dataPoint] < min) ? +line[dataPoint] : min;
        max = (+line[dataPoint] > max) ? +line[dataPoint] : max;
        total += +line[dataPoint];
        numberOfElementsWithData++
    });

    let mean = total / numberOfElementsWithData;

    return {
        min,
        max,
        mean
    }
}

function matchCountry(country, data, dataPoint) {
    let datasetId = data.information.id;
    let mean = data.information[dataPoint].get('mean');
    data.forEach(data => {
        if (country.properties[datasetId] === undefined) country.properties[datasetId] = {};
        if (isTheSameCountry(data["country"], country.properties.NAME)) {
            if (data[dataPoint] != "") {
                country.properties[datasetId][dataPoint] = {
                    data: data[dataPoint],
                    isFillValue: false
                };
            }
        }
    });
    if (country.properties[datasetId][dataPoint] === undefined) {
        country.properties[datasetId][dataPoint] = {
            data: mean,
            isFillValue: true
        };
    }
}

function isTheSameCountry(dataName, jsonName) {
    let map = {
        "United States": "United States of America",
        "Bosnia and Herzegovina": "Bosnia and Herz.",
        "Central African Republic": "Central African Rep.",
        "Congo, Dem. Rep.": "Dem. Rep. Congo",
        "Congo, Rep.": "Congo",
        "Czech Republic": "Czechia",
        "Dominican Republic": "Dominican Rep.",
        "Equatorial Guinea": "Eq. Guinea",
        "Kyrgyz Republic": "Kyrgyzstan",
        "Lao": "Laos",
        "Solomon Islands": "Solomon Is.",
        "Slovak Republic": "Slovakia",
        "South Sudan": "S. Sudan",
        "Cote d'Ivoire": "Côte d'Ivoire",
    };

    if (dataName == jsonName) return true;
    if (map[dataName] == jsonName) return true;
    if (dataName == map[jsonName]) return true;

    return false;
}

async function prepareData(nextCallback, error, world, ...readData) {
    StateHandler.setState('Preparing Data', 'Preparing the data...');

    if (error) {
        StateHandler.setState('An Error occured', error);
        throw error;
    };


    let countries = world.objects.countries;
    // For each read file
    for (let i = 0; i < readData.length; i++) {
        //Current file
        let data = readData[i];

        //Current dataset information
        let dataset = datasetsInformation[i];
        data.information = dataset;

        idToData.set(data.information.id, data);

        //Get each year there is data for
        let dataPoints = getDataPoints(data);

        dataPoints.forEach(dataPoint => {
            let {
                min,
                max,
                mean
            } = calculateMinMaxMean(dataPoint, data);
            data.information[dataPoint] = new Map([
                ["min", min],
                ["max", max],
                ["mean", mean]
            ]);
            countries.geometries.forEach((element) => {
                matchCountry(element, data, dataPoint);
            });
        });

    }


    // exclude antarctica
    world.objects.countries.geometries.splice(
        world.objects.countries.geometries.findIndex(d => d.properties.ISO_A2 === 'AQ'),
        1
    );
   let identifier = readData.map(e => e.information.id);
    calculateRanking(world, ...identifier);
    nextCallback(error, world, ...readData);
}

export {
    createQueue,
    loadEmptyMap,
    getDataById,
    getDataPoints
}