import { getDataPoints, getDataById } from "./loadData.js";

let allRankingTables = new Map();
let bestCaseRankingTable = new Map();
let worstCaseRankingTable = new Map();

async function calculateRanking(world, ...dataIds) {
    if (dataIds === undefined || dataIds.length == 0) { return }
    let callback = calculateWorstAndBestRanks;
    let counter = 0;
    dataIds.forEach((dataId) => {
        calculateRankingOverDataset(world, dataId).then(table => {
            allRankingTables.set(dataId, table);
            counter++;
            if (counter === dataIds.length) {callback()}
        })
    }); 
}

async function calculateWorstAndBestRanks(){
    allRankingTables.forEach((dataPointToRankingTable, dataId) => {
       dataPointToRankingTable.forEach((rankTable, dataPoint)=> {
           rankTable.forEach((rank, iso_code)=> {
            if (bestCaseRankingTable.get(iso_code) === undefined || rank < bestCaseRankingTable.get(iso_code).rank) {
                bestCaseRankingTable.delete(iso_code);
                bestCaseRankingTable.set(iso_code, {rank: rank, dataset: dataId, dataPoint});
            }
           });
       }); 
    });
    console.log(bestCaseRankingTable);
    console.log(worstCaseRankingTable);
}

async function calculateRankingOverDataset(world, datasetIdentifier) {
    let countries = world.objects.countries.geometries;
    let dataPointToRankingTable = new Map();
    let dataPoints = getDataPoints(getDataById(datasetIdentifier)); 
    dataPoints.forEach((dataPoint) => {
        let valueTable = new Map();
        countries.forEach(element => {
            let iso_code = element.properties.ISO_A3;
            let value = element.properties[datasetIdentifier][dataPoint];
            if (!value.isFillValue) {
                valueTable.set(iso_code, value.data);
            }
        });
        let sortedTable = new Map([...valueTable].sort((a, b) => (a[1] > b[1] && 1) || (a[1] === b[1] ? 0 : -1)));
        let rankTable = new Map()
        let i = 1;
        sortedTable.forEach((value, key) => {
            rankTable.set(key, i++);
        });
        dataPointToRankingTable.set(dataPoint, rankTable)
    });
    
    return dataPointToRankingTable;
}


export {calculateRanking}