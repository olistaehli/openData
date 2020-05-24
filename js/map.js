import {
    createQueue,
    getDataById,
    loadEmptyMap
} from './loadData.js'; 
import {
    MapControls
} from './MapControls.js';
import { StateHandler } from './StateHandler.js';
import { Logger } from './Logger.js';
import { getBestCaseOfCountry, getWorstCaseOfCountry} from './Ranking.js';


let cartograms = {};
let world;
let width = d3.select("#worldOne").node().getBoundingClientRect().width;
let height = d3.select("#worldTwo").node().getBoundingClientRect().height;

// Create two instances of the Statehandler
let StateHandler1 = StateHandler.getNewStateHandler("map1");
let StateHandler2 = StateHandler.getNewStateHandler("map2");

let MapControl = new MapControls('#year-slider-one', "map1");


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

$('#datasetDropdownMapTwo').on('input', function() {
    let allSelections = $('#dropdown-menuTwo')[0].childNodes;
    let text = this.value.toLowerCase();
    allSelections.forEach((selection)=> {
        if (!(selection.innerText.toLowerCase().includes(text))) {
            selection.classList.add('d-none');
        } else {
            selection.classList.remove('d-none');
        }
    });
});
$('#dropdownTwoParent').on('hidden.bs.dropdown', function () {
    let allSelections = $('#dropdown-menuTwo')[0].childNodes;
    allSelections.forEach((selection) => {
        selection.classList.remove('d-none');
    });
  })

function showMap(error, worldTopo, ...data) {
    StateHandler.setState('Displaying the map', 'Displaing a map without any data');
    world = worldTopo;
    
    if (data.length > 0) {
        initializeDropDown("worldOne", data);
        initializeDropDown("worldTwo", data);
    } else {
        mapWithoutData();
        createQueue(showMap, calculatedRanking)
    }
}

function calculatedRanking() {
    $('#sliderRange').on("change", mapTwoValueChanged);
    $('#sliderRangeImages').children().each((index, element)=> {
        element.onclick = ()=> {changeSliderValueTo(index)}
    });
}

function changeSliderValueTo(number) {
    $("#sliderRange").val(number);
    mapTwoValueChanged();
}

function mapTwoValueChanged() {
    let country = $("#datasetDropdownMapTwo").val().toLowerCase();
    let allCountries = world.objects.countries.geometries;
    let selectedCountry = allCountries.find(e => {return e.properties.NAME.toLowerCase() == country});
    if (selectedCountry === undefined) { return }
    let iso_code = selectedCountry.properties.ADM0_A3;
    switch (+$("#sliderRange").val()) {
        case 0:
        case 1:
            //{dataset: dataId, dataPoint, rankingScore: rankingScore}
            let worstCase = getWorstCaseOfCountry(iso_code);
            changeDataSetTo(worstCase.dataset, "worldTwo");
            changeDatapointTo(worstCase.dataPoint, StateHandler2)
            break;
        case 2:
        case 3:
        case 4:
            //{dataset: dataId, dataPoint, rankingScore: rankingScore}
            let bestCase = getBestCaseOfCountry(iso_code);
            changeDataSetTo(bestCase.dataset, "worldTwo");
            changeDatapointTo(bestCase.dataPoint, StateHandler2)
        default:
            break;
    }
    //0 worst, 1 bad, 2 neutral, 3 good, 4 best
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
    if (map == "worldOne") {
        let datasets = data.map((data)=> {return data.information});
        let dropdownMenu = document.getElementById("dropdown-menuOne");
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
        });
    } else {
        let countries = world.objects.countries.geometries.map(data => data.properties.NAME);
        let dropdownMenu = document.getElementById("dropdown-menuTwo");
        dropdownMenu.innerHTML = '';
        countries.forEach((country) => {
            let element = document.createElement('button');
            element.innerText = country;
            element.type = 'button';
            element.classList.add('dropdown-item');
            element.onclick = () => {
                $("#datasetDropdownMapTwo").val(`${country}`)
                mapTwoValueChanged();
            };
        dropdownMenu.appendChild(element);   
        });
    } 
}




function updateYearPicker(stateHandler) {
    if (stateHandler !== StateHandler1) return
    let columns = getDataById(stateHandler.getCurrentDisplayedDataset()).columns;
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
    return (+p[selectedID][selectedDataPoint].data > 0) ? +p[selectedID][selectedDataPoint].data : 1;
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
    var scale = d3.scaleLinear()
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')])
        .range([0,  selectedDatapointInformation.get('max')]);
    cartograms[map]
        .value((feature) => scale(getDataOfCountry(feature, stateHandler)))
        .color((f) => {
        if (f.properties[stateHandler.getCurrentDisplayedDataset()][stateHandler.getCurrentDisplayedDatapoint()].isFillValue) {return "lightgrey"}
        return colorScale(getDataOfCountry(f, stateHandler))})
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => {
            console.log(n);
            return n;
        }).tooltipContent((e)=>{
            return e.properties[stateHandler.getCurrentDisplayedDataset()][stateHandler.getCurrentDisplayedDatapoint()].data;
        })
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
    var scale = d3.scaleLinear()
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')])
        .range([0,  selectedDatapointInformation.get('max')]);
    let cartogram = cartograms[stateHandler === StateHandler1 ? "worldOne" : "worldTwo"];
    cartogram
        .value((feature) => scale(getDataOfCountry(feature, stateHandler)))
        .color((f) => {
        if (f.properties[stateHandler.getCurrentDisplayedDataset()][stateHandler.getCurrentDisplayedDatapoint()].isFillValue) {return "lightgrey"}
        return colorScale(getDataOfCountry(f, stateHandler))})
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(40, 800);
}
