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
    },
    {
        "src": "../data/methaneemissions_ktOfCO2equivalent.csv",
        "title": "Methane Emissions in tonnes",
        "units": " Kilotonnes",
        "id": "methane-kt"
    },
    {
        "src": "../data/cumulative_co2_emissions_tonnes.csv",
        "title": "Cumulative CO2 emissions (from fossil fuel) in tonnes",
        "units": " Kilotonnes",
        "id": "cum-co2-kt"
    },
    {
        "src": "../data/en_atm_co2e_pp_gd.csv",
        "title": "CO2 emissions in comparison to the GDP",
        "units": " kg per PPP $ of GDP",
        "id": "gdp"
    },

    //worldmap is not displayed
    {
        "src": "../data/en_atm_ghgo_kt_ce.csv",
        "title": "Other geenhouse gas emissions, HFC, PFC and SF6",
        "units": " Kilotonnes",
        "id": "ghgo_kt_ce"
    },
    {
        "src": "../data/en_atm_greenhhousegt_kt_ce.csv",
        "title": "Total greenhouse gas emissions",
        "units": " Kilotonnes",
        "id": "greenhhousegt_kt_ce"
    },

    //does not scale - worldmap disappears
    {
        "src": "../data/en_atm_hfcg_kt_ce.csv",
        "title": "HFC gas emissions",
        "units": " Kilotonnes",
        "id": "hfcg-kt-ce"
    },
    {
        "src": "../data/en_atm_noxe_kt_ce.csv",
        "title": "Nitrous oxide emissions",
        "units": " Kilotonnes",
        "id": "noxe_kt_ce"
    },

    //does not skale - worldmap disappears
    {
        "src": "../data/en_atm_pfcg_kt_ce.csv",
        "title": "PFC gas emissions",
        "units": " Kilotonnes",
        "id": "pfcg_kt_ce"
    },

    //worldmap is not displayed
    {
        "src": "../data/en_clc_ghgr_mt_ce.csv",
        "title": "GHG net emissions/ removals by LUCF",
        "units": " Megatonnes",
        "id": "ghgr_mt_ce"
    },

    //worldmap disappears
    {
        "src": "../data/en_atm_co2e_gasf_kt.csv",
        "title": "CO2 emissions from gaseous fuel consumption",
        "units": " Kilotonnes",
        "id": "gasf_k"
    },
    //does not scale - worldmap disappears
    {
        "src": "../data/en_atm_co2e_liquidf_kt.csv",
        "title": "CO2 emissions from liquid fuel consumption",
        "units": " Kilotonnes",
        "id": "liquidf_kt"
    },

    //does not scale
    {
        "src": "../data/en_atm_co2e_solidf_kt.csv",
        "title": "CO2 emissions from solid fuel consumption",
        "units": " Kilotonnes",
        "id": "solidf_kt"
    },

    {
        "src": "../data/residential_electricity_use_per_person.csv",
        "title": "Residential electricity consumption in kWh per person",
        "units": " kWh",
        "id": "res-e-pp"
    },
    {
        "src": "../data/residential_electricity_use_total.csv",
        "title": "Electricity consumption in kWh in total",
        "units": " kWh",
        "id": "res-e-total"
    },
    {
        "src": "../data/energy_use_per_person.csv",
        "title": "Energy consumption in kWh per person",
        "units": " kWh",
        "id": "e-use-pp"
    },

    {
        "src": "../data/energy_production_per_person.csv",
        "title": "Energy production in tonnes oil equivalent per person",
        "units": " tonnes oil equivalent",
        "id": "e-prod-pp"
    },
    {
        "src": "../data/energy_production_total.csv",
        "title": "Energy production in tonnes oil equivalent in total",
        "units": " tonnes oil equivalent",
        "id": "e-prod-total"
    },

    {
        "src": "../data/electricity_generation_per_person.csv",
        "title": "Electricity production in kWh per person",
        "units": " kWh",
        "id": "elec-gen-pp"
    },
    {
        "src": "../data/electricity_generation_total.csv",
        "title": "Electricity production in kWh in total",
        "units": " kWh",
        "id": "elec-gen-total"
    },

    {
        "src": "../data/wood_removal_cubic_meters.csv",
        "title": "Wood removal in cubic meters",
        "units": "Cubic meters",
        "id": "cubem"
    },

    {
        "src": "../data/oil_production_total.csv",
        "title": "Oil production in tonnes oil equivalent in total",
        "units": "tonnes oil equivalent",
        "id": "oil-prod-total"
    },
    {
        "src": "../data/oil_production_per_person.csv",
        "title": "Oil production in tonnes oil equivalent per person",
        "units": "tonnes oil equivalent",
        "id": "oil-prod-pp"
    },
    {
        "src": "../data/oil_consumption_total.csv",
        "title": "Oil consumption in tonnes oil equivalent in total",
        "units": "tonnes oil equivalent",
        "id": "oil-cons-total"
    },

    //error
    //{"src":"../data/oil_consumption_per_person.csv", "title":"Oil consumption in XYZ per person", "units" : "XYZ", "id": "oil-cons-pp"},

    //error
    //{"src":"../data/coal_consumption_per_person.csv", "title":"Coal consumption in tonnes oil equivalent per person", "units" : " tonnes oil equivalent", "id": "coal-cons-pp"},

    //does not scale
    {
        "src": "../data/coal_consumption_total.csv",
        "title": "Coal consumption in tonnes oil equivalent in total",
        "units": " tonnes oil equivalent",
        "id": "coal-cons-total"
    },

    {
        "src": "../data/hydro_power_generation_per_person.csv",
        "title": "Hydro power generation per person",
        "units": " tonnes oil equivalent",
        "id": "hydro-pp"
    },
    {
        "src": "../data/hydro_power_generation_total.csv",
        "title": "Hydro power generation in total",
        "units": " tonnes oil equivalent",
        "id": "hydro-total"
    },
    {
        "src": "../data/nuclear_power_generation_per_person.csv",
        "title": "Nuclear power generation per person",
        "units": " tonnes oil equivalent",
        "id": "nuc-pp"
    },

    //does not scale
    {
        "src": "../data/nuclear_power_generation_total.csv",
        "title": "Nuclear power generation in total",
        "units": " tonnes oil equivalent",
        "id": "nuc-total"
    },

]

let idToDataPoints = new Map();
let idToData = new Map();
let world;

let sameCountryMap = {
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

async function matchCountry(country, data) {
    let datasetId = data.information.id;
    let dataPoints = getDataPoints(data);

    data.forEach(dataOfACountry => {
        if (country.properties[datasetId] === undefined) country.properties[datasetId] = {};
        if (isTheSameCountry(dataOfACountry["country"], country.properties.NAME)) {
            dataPoints.forEach((dataPoint) => {
                if (dataOfACountry[dataPoint] != "") {
                    country.properties[datasetId][dataPoint] = {
                        data: dataOfACountry[dataPoint],
                        isFillValue: false
                    };
                }
            })
        }
    });
    fillEmptyValues(data);
    dataPoints.forEach((dataPoint)=> {
        let mean = data.information[dataPoint].get('mean');
        if (country.properties[datasetId][dataPoint] === undefined) {
            country.properties[datasetId][dataPoint] = {
                data: mean,
                isFillValue: true
            };
        }
    })
}

function fillEmptyValues(data) {

}

function isTheSameCountry(dataName, jsonName) {
    if (dataName == jsonName) return true;
    if (sameCountryMap[dataName] == jsonName) return true;
    if (dataName == sameCountryMap[jsonName]) return true;

    return false;
}

function addDataInformationToDataset(data, i) {
    //Current dataset information
    let dataset = datasetsInformation[i];
    data.information = dataset;

    idToData.set(data.information.id, data);

    //Get each year there is data for
    let dataPoints = getDataPoints(data);

    dataPoints.forEach((dataPoint) => {
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

    });
}

async function prepareData(nextCallback, error, world, ...readData) {
    StateHandler.setState('Preparing Data', 'Preparing the data...');

    if (error) {
        StateHandler.setState('An Error occured', error);
        throw error;
    };

    let promises = [];
    let countries = world.objects.countries;
    // For each read file
    for (let i = 0; i < readData.length; i++) {
        //Current file
        let data = readData[i];
        addDataInformationToDataset(data, i)
        countries.geometries.forEach((element) => {
            promises.push(matchCountry(element, data));
        });
    }

    Promise.all(promises).then(() => {
        // exclude antarctica
        world.objects.countries.geometries.splice(
            world.objects.countries.geometries.findIndex(d => d.properties.ISO_A2 === 'AQ'),
            1
        );
        let identifier = readData.map(e => e.information.id);
        calculateRanking(world, ...identifier);
        nextCallback(error, world, ...readData);
    });
}

export {
    createQueue,
    loadEmptyMap,
    getDataById,
    getDataPoints
}