import {
    createQueue,
    getDataById
} from './loadData.js'; 
import { StateHandler } from './StateHandler.js';


let cartogram;
let world;
let statePopover = document.getElementById('statePopover');

//Register self as a delegate
StateHandler.addStateCallback(()=>{
    console.log(`New State: ${StateHandler.getStateDescription()}`);
});

StateHandler.addDisplayInformationCallback(() => {
    d3.select('#dropdown-text').text(getDataById(StateHandler.getCurrentDisplayedDataset()).information.title);
    d3.select('#dropdown-text-year').text(StateHandler.getCurrentDisplayedDatapoint());
});

/**
 * Load the map and all data files
 */
createQueue(showMap);


function showMap(error, worldTopo, ...data) {
    StateHandler.setState('Displaying the map', 'Displaing a map without any data');
    world = worldTopo;
    mapWithoutData();
    
    initializeDropDown(data);
}

function mapWithoutData() {
    const colorScale = d3.scaleSequential(d3.interpolateTurbo)
    .domain([0, 1]);

cartogram = Cartogram()
    .topoJson(world)
    .topoObjectName('countries')
    .value(1)
    .units('')
    .valFormatter((n) => '')
    .label(({properties: p}) => `${p.NAME}`)
    .iterations(1)
    (document.getElementById('world'));
}


function initializeDropDown(data) {
    let datasets = data.map((data)=> {return data.information});
    let dropdownMenu = document.getElementById('dropdown-menu');
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

function updateYearPicker() {
    console.log(getDataById(StateHandler.getCurrentDisplayedDataset()).columns);
    let columns = getDataById(StateHandler.getCurrentDisplayedDataset()).columns;
    let dropdownMenu = document.getElementById('dropdown-menu-year');
    dropdownMenu.innerHTML = '';
    columns.forEach((col) => {
        // <a class="dropdown-item" href="#">Action</a>
        let element = document.createElement('a');
        element.innerText = ''+col;
        element.href = "#"
        element.classList.add('dropdown-item');
        element.onclick = () => {
            changeDatapointTo(col);
        };
        dropdownMenu.appendChild(element);
    })
}

function getDataOfCountry({properties: p}) {
    let selectedID = StateHandler.getCurrentDisplayedDataset();
    let selectedDataPoint = StateHandler.getCurrentDisplayedDatapoint();
    return +p[selectedID][selectedDataPoint].data;
}

function changeDataSetTo(id) {
    let selectedData = getDataById(id);
    let dataInformation = selectedData.information;
    if (selectedData.columns.indexOf(StateHandler.getCurrentDisplayedDatapoint()) == -1) {  
        StateHandler.changeDisplayedDataset({dataset: dataInformation.id, datapoint: selectedData.columns[selectedData.columns.length -1]});
    }else {
        StateHandler.changeDisplayedDataset({dataset: dataInformation.id});
    }

    let currentDatapoint = StateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    cartogram.value(getDataOfCountry)
    .color((f) => colorScale(getDataOfCountry(f)))
    .units(selectedDatapointInformation.units)
    .valFormatter(d3.format(''))
    .iterations(50);

    StateHandler.setState('Displaying the map', `Displaying the map for ${dataInformation.title} in the year ${currentDatapoint}`)
    
    updateYearPicker();
}

function changeDatapointTo(col) {
    StateHandler.changeDisplayedDataset({datapoint: col});
    let currentData = getDataById(StateHandler.getCurrentDisplayedDataset());
    let dataInformation = currentData.information;
    let currentDatapoint = StateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    cartogram.value(getDataOfCountry)
        .color((f) => colorScale(getDataOfCountry(f)))
        .units(selectedDatapointInformation.units);
}