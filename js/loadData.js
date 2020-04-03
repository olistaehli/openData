let datasets = [
    {"src":"../data/co2_emissions_tonnes_per_person.csv", "title":"CO2 Emissions in tonnes per person", "units":" tonnes per capita", "id": "co2-t-per-capita"},
    {"src":"../data/co2_emissionsInKt.csv", "title":"CO2 Emissions in Kilotonnes", "units" : " Kilotonnes", "id": "co2-kt"}
]

let idToDataset = new Map();
datasets.forEach((dataset) => {
    idToDataset.set(dataset.id, dataset)
});

function createQueue(callback) {
    let queue = d3.queue();
    queue.defer(d3.json, "../map.json")
    datasets.forEach((dataset) => {
        queue.defer(d3.csv, dataset.src)
    });
    queue.await(callback)
}

function getDatasetById(id) {
    return idToDataset.get(id)
}

function getDataset() {
    return datasets
}

export {createQueue, getDataset, getDatasetById}

