import { getDataPoints, getDataById } from "./loadData.js";

let allRankingTables = new Map();
let bestCaseRankingTable = new Map();
let worstCaseRankingTable = new Map();

function getBestCaseOfCountry(iso_code) {
    // {dataset: dataId, dataPoint, rankingScore: rankingScore}
    return bestCaseRankingTable.get(iso_code);
}

function getWorstCaseOfCountry(iso_code) {
    // {dataset: dataId, dataPoint, rankingScore: rankingScore}
    return worstCaseRankingTable.get(iso_code);
}

async function calculateRanking(world, calculatedRankingCallback, ...dataIds) {
    if (dataIds === undefined || dataIds.length == 0) { return }
    let callback = calculateWorstAndBestRanks;
    let counter = 0;
    dataIds.forEach((dataId) => {
        calculateRankingOverDataset(world, dataId).then(table => {
            allRankingTables.set(dataId, table);
            counter++;
            if (counter === dataIds.length) {callback(calculatedRankingCallback)}
        })
    }); 
}

async function calculateWorstAndBestRanks(calculatedRankingCallback){
    allRankingTables.forEach((dataPointToRankingTable, dataId) => {
       dataPointToRankingTable.forEach((rankTable, dataPoint)=> {
           rankTable.forEach(({rankingScore}, iso_code)=> {
            if (bestCaseRankingTable.get(iso_code) === undefined || rankingScore > bestCaseRankingTable.get(iso_code).rankingScore) {
                bestCaseRankingTable.delete(iso_code);
                bestCaseRankingTable.set(iso_code, {dataset: dataId, dataPoint, rankingScore: rankingScore});
            }
            if (worstCaseRankingTable.get(iso_code) === undefined || rankingScore < worstCaseRankingTable.get(iso_code).rankingScore) {
                worstCaseRankingTable.delete(iso_code);
                worstCaseRankingTable.set(iso_code, {dataset: dataId, dataPoint, rankingScore: rankingScore});
            }
           });
       }); 
    });
    calculatedRankingCallback()
}


async function calculateRankingOverDataset(world, datasetIdentifier) {
    let countries = world.objects.countries.geometries;
    if (countries.map(e=>e.properties.ADM0_A3).length != new Set(countries.map(e=>e.properties.ADM0_A3)).size) {
        console.error(`Error calculating rank of ${datasetIdentifier} due to invalid ADM0_A3 codes`);
        return;
    }
    let dataPointToRankingTable = new Map();
    let dataPoints = getDataPoints(getDataById(datasetIdentifier)); 
    let datasetInformation = getDataById(datasetIdentifier).information;
    dataPoints.forEach((dataPoint) => {
        let valueTable = new Map();
        let mean = datasetInformation[dataPoint].get("mean");
        countries.forEach(element => {
            let iso_code = element.properties.ADM0_A3;
            let value = element.properties[datasetIdentifier][dataPoint];
            if (!value.isFillValue) {
                valueTable.set(iso_code, value.data);
            }
        });
        let sortedTable = new Map([...valueTable].sort((a, b) => (a[1] - b[1])));
        let rankTable = new Map()
        let i = 1;
        let normalizedArray = Array.from(sortedTable).map(e => +e[1]);
        let arrayMinMax = {min : Math.min(...normalizedArray), max : Math.max(...normalizedArray)}
        sortedTable.forEach((value, key) => {
            let rank = i++;
            let score = getRankingScore(value, rank, mean, sortedTable, normalizedArray, arrayMinMax);
            rankTable.set(key, {rank: rank, numberOfValues: sortedTable.size, rankingScore: score});
        });
        dataPointToRankingTable.set(dataPoint, rankTable)
    });
    return dataPointToRankingTable;
}

function normalizeArray(value, array, arrayMinMax) {
    if (arrayMinMax === undefined) {
        let min = Math.min(...array);
        let max = Math.max(...array);
        return (value - min)/(max-min) * (2 - 0.5) + 0.5
    } else {
        return (value - arrayMinMax.min)/(arrayMinMax.max - arrayMinMax.min) * (2 - 0.5) + 0.5
    }
    
}


function getRankingScore(value, rank, mean, sortedTable, normalizedArray, arrayMinMax) {
    let numberOfCountries = sortedTable.size;
    let rankPart = ((numberOfCountries*0.5)/rank)*10;
    let numberOfCountriesPart = Math.log(numberOfCountries)/Math.log(50);
    let valueDifference = normalizeArray(mean, undefined, arrayMinMax) / normalizeArray(value, undefined, arrayMinMax);
    let rankScore = rankPart * numberOfCountriesPart * valueDifference;
    return rankScore;
}

export {calculateRanking, getBestCaseOfCountry, getWorstCaseOfCountry}