import {
    createQueue,
    getDataById,
    getTitleById,
    loadEmptyMap
} from './loadData.js'; 
import {
    MapControls
} from './MapControls.js';
import { StateHandler } from './StateHandler.js';
import { Logger } from './Logger.js';
import { getBestCaseOfCountry, getWorstCaseOfCountry, getRankingTable} from './Ranking.js';


let cartograms = {};
let world;
let width = d3.select("#worldOne").node().getBoundingClientRect().width;
let height = d3.select("#worldOne").node().getBoundingClientRect().height;

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
});

$( window ).resize(function() {
    width = d3.select("#worldOne").node().getBoundingClientRect().width;
    height = d3.select("#worldOne").node().getBoundingClientRect().height;
    for (let propertyName in cartograms) {
        try {
            cartograms[propertyName]
                .width(width)
                .height(height);  
        } catch { console.warn('Tried to resize an object that is not a cartogram'); }
    }
    debounce(resizeProjection, 100);
});

function resizeProjection() {
    for (let propertyName in cartograms) {
            cartograms[propertyName]
                .projection()
                .fitSize([width, height], topojson.feature(world, world.objects.countries));
            d3.select(`#${propertyName}`).select('svg').call(d3.zoom().transform, d3.zoomIdentity);
            d3.select(`#${propertyName}`).select('svg').selectAll('path').attr('transform', '');
    }
}

function debounce(fun, mil){
    var timer; 
    clearTimeout(timer); 
    timer = setTimeout(function(){
        fun(); 
    }, mil); 
}

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
    StateHandler2.setState("Ranking made", "The ranking of the countries has been made for all the Datasets");
    $('#select-state-loading-overlay').hide();
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
    let datasetId, dataPointTitle;
    switch (+$("#sliderRange").val()) {
        case 0:
        case 1:
            //{dataset: dataId, dataPoint, rankingScore: rankingScore}
            let worstCase = getWorstCaseOfCountry(iso_code);
            changeDataSetTo(worstCase.dataset, "worldTwo");
            changeDatapointTo(worstCase.dataPoint, StateHandler2);
            datasetId = worstCase.dataset;
            dataPointTitle = worstCase.dataPoint;
            break;
        case 2:
        case 3:
        case 4:
            //{dataset: dataId, dataPoint, rankingScore: rankingScore}
            let bestCase = getBestCaseOfCountry(iso_code);
            changeDataSetTo(bestCase.dataset, "worldTwo");
            changeDatapointTo(bestCase.dataPoint, StateHandler2);
            datasetId = bestCase.dataset;
            dataPointTitle = bestCase.dataPoint;
        default:
            break;
    }

    let informationContainer = createStatusTable(datasetId, dataPointTitle, selectedCountry);

    $('#worldTwoStatus').empty();
    $('#worldTwoStatus').append(informationContainer);
}

function createStatusTable(datasetId, dataPointTitle, selectedCountry) {
    let informationContainer = document.createElement('div');
    let titleLabel = document.createElement('p');
    titleLabel.classList.add('text-center');
    titleLabel.innerText = `Currently displaying: ${getTitleById(datasetId)} in ${dataPointTitle}`;
    let tableContainer = document.createElement('div');
    tableContainer.style.maxHeight = "300px";
    tableContainer.style.overflowY = "auto";
    let table = document.createElement('table');
    table.classList.add('table', 'table-hover');
    let countries = getRankingTable(datasetId, dataPointTitle);
    countries.forEach((country, key) => {
        let countryObj = world.objects.countries.geometries.find((e)=> {return e.properties.ADM0_A3 == key})
        let row = table.insertRow(-1);
        row.insertCell(0).innerText = country.rank;
        row.insertCell(1).innerText = countryObj.properties.NAME;
        row.insertCell(2).innerText = getDataOfCountry(countryObj, StateHandler2);

        if (selectedCountry.properties.ADM0_A3 == countryObj.properties.ADM0_A3) {
            row.style.backgroundColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--darkbeige-color');
        }
    });
    
    let head = table.createTHead();
    let headerRow = head.insertRow(0);
    headerRow.insertCell(0).innerText = 'Rank';
    headerRow.insertCell(1).innerText = 'Country Name';
    headerRow.insertCell(2).innerText = 'Raw Value';
    head.style.position = "sticky";
    head.style.backgroundColor = "white";
    head.style.top = 0;

    tableContainer.appendChild(table);


    informationContainer.appendChild(titleLabel);
    informationContainer.appendChild(tableContainer);
    return informationContainer;

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
    console.log(d3.topoJson);
    cartograms[htmlId].projection().fitSize([width, height], topojson.feature(world, world.objects.countries));

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
    var scale = d3.scaleLinear()
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')])
        .range([1,  1000]);
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
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

    stateHandler.setState('Displaying the map', `Displaying the map for ${dataInformation.title} in the year ${currentDatapoint}`);
    
    updateYearPicker(stateHandler);
}

function changeDatapointTo(col, stateHandler) {
    stateHandler.changeDisplayedDataset({datapoint: col});
    let currentData = getDataById(stateHandler.getCurrentDisplayedDataset());
    let dataInformation = currentData.information;
    let currentDatapoint = stateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    var scale = d3.scaleLinear()
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')])
        .range([1,  1000]);
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    let cartogram = cartograms[stateHandler === StateHandler1 ? "worldOne" : "worldTwo"];
    cartogram
        .value((feature) => scale(getDataOfCountry(feature, stateHandler)))
        .color((f) => {
        if (f.properties[stateHandler.getCurrentDisplayedDataset()][stateHandler.getCurrentDisplayedDatapoint()].isFillValue) {return "lightgrey"}
        return colorScale(getDataOfCountry(f, stateHandler))})
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(60);
    stateHandler.setState('Displaying the map', `Displaying the map for ${dataInformation.title} in the year ${currentDatapoint}`)
}
