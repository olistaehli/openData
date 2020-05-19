/**
 * Structure:   allRankingTables : [ Map<dataSetId, [ dataPoint: Map<Rank, ISO_A3> ]> ]
 *              bestRank : Map<ISO_A3, {datasetId, dataPoint}>
 *              worstRank : Map<ISO_A3, {datasetId, dataPoint}>
 */

let allRankingTables = [];

async function calculateRanking(world, ...dataIds) {
    if (dataIds === undefined || dataIds.length < 0) { return }
    console.log(dataIds);
    calculateRankingOverDataset(world, dataIds[0]);
}

function calculateRankingOverDataset(world, datasetIdentifier) {
    let rankingTable = new Map();
    let valueTable = new Map();
    let countries = world.objects.countries.geometries; // : [Object]
    countries.forEach(element => {
        let iso_code = element.properties.ISO_A3;
        let value = element.properties[datasetIdentifier];
        valueTable.set(iso_code, value);
    });
    return rankingTable
}


export {calculateRanking}