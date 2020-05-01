import {
    createQueue,
    getDataById,
    getDataPoints,
    loadEmptyMap
} from './loadData.js'; 
import {
    MapControls
} from './MapControls.js';
import { StateHandler } from './StateHandler.js';
import { Logger } from './Logger.js';


let cartograms = {};
let world;
let width = d3.select("#worldOne").node().getBoundingClientRect().width;
let height = d3.select("#worldTwo").node().getBoundingClientRect().height;

// Create two instances of the Statehandler
let StateHandler1 = StateHandler.getNewStateHandler("map1");
let StateHandler2 = StateHandler.getNewStateHandler("map2");


let MapControlOne = new MapControls('#year-slider-one', "map1");
let MapControlTwo = new MapControls('#year-slider-two', "map2");


//Initialize Logger
new Logger("map1");
new Logger("map2");


StateHandler1.addDisplayInformationCallback(() => {
    d3.select('#datasetDropdownMapOne').text(getDataById(StateHandler1.getCurrentDisplayedDataset()).information.title);
    //d3.select('#dropdown-text-year').text(StateHandler.getCurrentDisplayedDatapoint());
});
StateHandler2.addDisplayInformationCallback(() => {
    d3.select('#datasetDropdownMapTwo').text(getDataById(StateHandler2.getCurrentDisplayedDataset()).information.title);
    //d3.select('#dropdown-text-year').text(StateHandler.getCurrentDisplayedDatapoint());
});

/**
 * Load the map and all data files
 */
loadEmptyMap(showMap);

function showMap(error, worldTopo, ...data) {
    StateHandler.setState('Displaying the map', 'Displaing a map without any data');
    world = worldTopo;
    
    if (data.length > 0) {
        initializeDropDown("worldOne", data);
        initializeDropDown("worldTwo", data);
    } else {
        mapWithoutData();
        createQueue(showMap)
    }
}

function mapWithoutData() {
    createEmptyMapOn('worldOne');
    createEmptyMapOn('worldTwo');
}

function createEmptyMapOn(htmlId) {
    cartograms[htmlId] = Cartogram()
    .topoJson(world)
    .topoObjectName('countries')
    .value(1)
    .units('')
    .valFormatter((n) => '')
    .label(({properties: p}) => `${p.NAME}`)
    .iterations(1)
    .width(width)
    .height(height)
    (document.getElementById(htmlId));

    d3.select(`#${htmlId}`).select('svg').call(d3.zoom().scaleExtent([0.25,8]).on("zoom", function() {
        d3.select(`#${htmlId}`).select('svg').selectAll('path').attr("transform", d3.event.transform);
    }));
}

function initializeDropDown(map, data) {
    let dropdownIdentifier = map == "worldOne" ? "dropdown-menuOne" : "dropdown-menuTwo";
    let datasets = data.map((data)=> {return data.information});
    let dropdownMenu = document.getElementById(dropdownIdentifier);
    dropdownMenu.innerHTML = '';
    datasets.forEach((dataset) => {
        let element = document.createElement('button');
        element.innerText = dataset.title;
        element.type = 'button';
        element.classList.add('dropdown-item');
        element.onclick = () => {
            changeDataSetTo(dataset.id, map);
        };
        dropdownMenu.appendChild(element);
    })
}

function updateYearPicker(stateHandler) {
    let columns = getDataById(stateHandler.getCurrentDisplayedDataset()).columns;
    let MapControl = stateHandler === StateHandler1 ? MapControlOne : MapControlTwo;
    let cartogram = cartograms[stateHandler === StateHandler1 ? "worldOne" : "worldTwo"];
    MapControl.newSlider(columns,(col) =>  changeDatapointTo(col, stateHandler));
    MapControl.newAnimationControlButtons({step: () => {
        let currentDatapoint = stateHandler.getCurrentDisplayedDatapoint();
        let index = columns.indexOf(currentDatapoint);
        let nextIndex = (++index) < (columns.length) ? index : 0;
        changeDatapointTo(columns[nextIndex], stateHandler);
    }, iterationsChange: (iterations) => {
        cartogram.iterations(iterations);
    }});
}

function getDataOfCountry({properties: p}, stateHandler) {
    let selectedID = stateHandler.getCurrentDisplayedDataset();
    let selectedDataPoint = stateHandler.getCurrentDisplayedDatapoint();
    return +p[selectedID][selectedDataPoint].data;
}

function changeDataSetTo(id, map) {
    let stateHandler = map === "worldOne" ? StateHandler1 : StateHandler2;
    let selectedData = getDataById(id);
    let dataInformation = selectedData.information;
    if (selectedData.columns.indexOf(stateHandler.getCurrentDisplayedDatapoint()) == -1) {
        stateHandler.changeDisplayedDataset({dataset: dataInformation.id, datapoint: selectedData.columns[0]});
    }else {
        stateHandler.changeDisplayedDataset({dataset: dataInformation.id});
    }

    let currentDatapoint = stateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    cartograms[map]
        .value((feature) => getDataOfCountry(feature, stateHandler))
        .color((f) => colorScale(getDataOfCountry(f, stateHandler)))
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(60);

    stateHandler.setState('Displaying the map', `Displaying the map for ${dataInformation.title} in the year ${currentDatapoint}`)
    
    updateYearPicker(stateHandler);
}

function changeDatapointTo(col, stateHandler) {
    stateHandler.changeDisplayedDataset({datapoint: col});
    let currentData = getDataById(stateHandler.getCurrentDisplayedDataset());
    let dataInformation = currentData.information;
    let currentDatapoint = stateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    let cartogram = cartograms[stateHandler === StateHandler1 ? "worldOne" : "worldTwo"];
    cartogram
        .value((feature) => getDataOfCountry(feature, stateHandler))
        .color((f) => colorScale(getDataOfCountry(f, stateHandler)))
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(40, 800);
}
