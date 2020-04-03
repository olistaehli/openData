import {
    createQueue,
    getDataset,
    getDatasetById
} from './loadData.js'
/**
 * Load the map and all data files
 */
createQueue(makeMap);
let cartogram;
let datasets;
let selectedID;


function makeMap(error, world, ...datas) {
    datasets = getDataset();
    selectedID = datasets[0].id
    initializeDropDown();
    if (error) throw error;
    
    let countries = world.objects.countries;
    console.log(countries);

    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let dataset = datasets[i];
        let min = Infinity;
        let max = -Infinity;
        let total = 0;
        data.forEach((data) => {
            min = (+data["2013"] < min) ? +data["2013"] : min;
            max = (+data["2013"] > max) ? +data["2013"] : max;
            total += +data["2013"];
        });

        let mean = total / data.length;
        console.warn(`Dataset ${dataset.id} min: ${min}, mean: ${mean}, max: ${max}`);
        dataset.mean = mean;
        dataset.min = min;
        dataset.max = max;

        countries.geometries.forEach((element) => {
            data.forEach(data => {
                if (isTheSameCountry(data["country"], element.properties.NAME)) {
                    element.properties[dataset.id] = data["2013"];
                }
            });
            if (element.properties[dataset.id] === undefined) {
                element.properties[dataset.id] = mean;
            }
        });
    }


    // exclude antarctica
    world.objects.countries.geometries.splice(
        world.objects.countries.geometries.findIndex(d => d.properties.ISO_A2 === 'AQ'),
        1
    );

    const colorScale = d3.scaleSequential(d3.interpolateTurbo)
        .domain([0, Math.max(...world.objects.countries.geometries.map(getGDPPerCapita))]);

    cartogram = Cartogram()
        .topoJson(world)
        .topoObjectName('countries')
        .value(getDataOfCountry)
        .color(f => colorScale(getDataOfCountry(f)))
        .units(' per capita')
        .valFormatter(d3.format(''))
        .iterations(1)
        (document.getElementById('world'));

    function getGDPPerCapita({ properties: p }) {
        return p[selectedID];
    }
}


function initializeDropDown() {
    let dropdownMenu = document.getElementById('dropdown-menu');
    console.table(datasets);
    dropdownMenu.innerHTML = '';
    datasets.forEach((dataset) => {
        // <a class="dropdown-item" href="#">Action</a>
        let element = document.createElement('a');
        element.innerText = dataset.title;
        element.href = "#"
        element.classList.add('dropdown-item');
        element.onclick = () => {
            changeDataSetTo(dataset.id);
        };
        dropdownMenu.appendChild(element);
    })
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

function getDataOfCountry({properties: p}) {
    return +p[selectedID];
}

function changeDataSetTo(id) {
    selectedID = id;
    let selectedDataset = getDatasetById(selectedID);
    d3.select('dropdown-text').text(selectedDataset.title);
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([selectedDataset.min, selectedDataset.max]);
    cartogram.value(getDataOfCountry)
        .color((f) => colorScale(getDataOfCountry(f)))
        .units(selectedDataset.units)
        .iterations(20);
}