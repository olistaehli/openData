import { getDataPoints, getDataById } from "./loadData.js";

let allRankingTables = new Map();
let edgeCasesRankingTables = new Map();

function getStageOfCountry(iso_code, state) {
    // {dataset: dataId, dataPoint, rankingScore: rankingScore}
    return edgeCasesRankingTables.get(iso_code)[state];
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
    let iso_codeToRankingTable = new Map();
    let iso_codeToLastRankingTable = new Map();
    allRankingTables.forEach((dataPointToRankingTable, dataId) => {
       let lastDataPointRankingTable = Array.from(dataPointToRankingTable)[dataPointToRankingTable.size -1];
        lastDataPointRankingTable[1].forEach(({rankingScore}, iso_code)=> {
            let dataPoint = lastDataPointRankingTable[0];
            if (iso_codeToLastRankingTable.get(iso_code) === undefined) {
                iso_codeToLastRankingTable.set(iso_code, [{score: rankingScore, dataset: dataId, dataPoint: dataPoint}]);
            } else {
                iso_codeToLastRankingTable.get(iso_code).push({score: rankingScore, dataset: dataId, dataPoint: dataPoint});
            }
        });
       dataPointToRankingTable.forEach((rankTable, dataPoint)=> {
           rankTable.forEach(({rankingScore}, iso_code)=> {
               if (iso_codeToRankingTable.get(iso_code) === undefined) {
                   iso_codeToRankingTable.set(iso_code, [{score: rankingScore, dataset: dataId, dataPoint: dataPoint}]);
               } else {
                   iso_codeToRankingTable.get(iso_code).push({score: rankingScore, dataset: dataId, dataPoint: dataPoint});
               }
           });
       }); 
    });
    iso_codeToLastRankingTable.forEach(e => {e.sort((a,b) => {return b.score - a.score;})});
    iso_codeToRankingTable.forEach(e => {e.sort((a,b) => {return b.score - a.score;})});
    iso_codeToRankingTable.forEach((value, key) => {
        let mid = value.length > 0 ? (value.length -1) / 2 : 0;
        edgeCasesRankingTables.set(key, {unicorn: value[0], like: iso_codeToLastRankingTable.get(key)[0], average: (mid % 1 === 0) ? value[mid] : value[mid - 0.5], dislike: iso_codeToLastRankingTable.get(key)[iso_codeToLastRankingTable.get(key).length -1 ], devil: value[value.length -1]});

    })
    calculatedRankingCallback()
}

function getRankingTable(id, datapoint) {
    return allRankingTables.get(id).get(datapoint);
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
        let i = (datasetInformation.moreIsBetter) ? sortedTable.size : 1;
        let normalizedArray = Array.from(sortedTable).map(e => +e[1]);
        let arrayMinMax = {min : Math.min(...normalizedArray), max : Math.max(...normalizedArray)}
        sortedTable.forEach((value, key) => {
            let rank =  (datasetInformation.moreIsBetter) ? i-- : i++;
            let score = getRankingScore(value, rank, mean, sortedTable, arrayMinMax, datasetInformation.moreIsBetter);
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


function getRankingScore(value, rank, mean, sortedTable, arrayMinMax, moreIsBetter) {
    let numberOfCountries = sortedTable.size;
    let rankPart = ((numberOfCountries*0.5)/rank)*10;
    let numberOfCountriesPart = Math.log(numberOfCountries)/Math.log(50);
    let valueDifference = normalizeArray(mean, undefined, arrayMinMax) / normalizeArray(value, undefined, arrayMinMax);
    if (Number.isNaN(valueDifference)) {
        valueDifference = 1;
    }
    if (moreIsBetter) {valueDifference = 1 / valueDifference;}
    let rankScore = rankPart * numberOfCountriesPart * valueDifference;
    return rankScore;
}

export {calculateRanking, getStageOfCountry, getRankingTable}