import {
    createQueue,
    getDataById,
    getDataPoints
} from './loadData.js'; 
import { StateHandler } from './StateHandler.js';


let cartogram;
let world;
let interval;
let width = d3.select("#world").node().getBoundingClientRect().width;
let height = d3.select("#world").node().getBoundingClientRect().height;

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
    .width(width)
    .height(height)
    (document.getElementById('world'));

    d3.select('#world').select('svg').call(d3.zoom().scaleExtent([0.25,8]).on("zoom", function() {
        d3.select('#world').select('svg').selectAll('path').attr("transform", d3.event.transform);
    }));
}
function initializeDropDown(data) {
    let datasets = data.map((data)=> {return data.information});
    let dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.innerHTML = '';
    datasets.forEach((dataset) => {
        let element = document.createElement('button');
        element.innerText = dataset.title;
        element.type = 'button';
        element.classList.add('dropdown-item');
        element.onclick = () => {
            changeDataSetTo(dataset.id);
        };
        dropdownMenu.appendChild(element);
    })
}

function updateYearPicker() {
    
    let columns = getDataById(StateHandler.getCurrentDisplayedDataset()).columns;
    d3.select('#year-slider').selectAll('*').remove();
    let yearSlider = d3.select("#year-slider")
        .append('svg')
        .attr('width', "100%")
        .attr('height', 100);
    let sliderGroup = yearSlider.append('g')
        .attr('transform', 'translate(30,30)')
    let slider = d3.sliderHorizontal()
        .domain([0, columns.length -1])
        .step(1)
        .width(yearSlider.node().getBoundingClientRect().width - 60)
        .ticks(Math.min(columns.length, 10))
        .displayFormat((n) => columns[n])
        .tickFormat((n) => columns[n])
        .fill(getComputedStyle(document.documentElement)
        .getPropertyValue('--darkblue-color'))
        .handle(
            d3
              .symbol()
              .type(d3.symbolCircle)
              .size(200)()
          )
        .on('onchange', index => {
            throttle(changeDatapointTo(columns[index]), 1);
          })
    sliderGroup.call(slider);
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
        StateHandler.changeDisplayedDataset({dataset: dataInformation.id, datapoint: selectedData.columns[0]});
    }else {
        StateHandler.changeDisplayedDataset({dataset: dataInformation.id});
    }

    let currentDatapoint = StateHandler.getCurrentDisplayedDatapoint();
    let selectedDatapointInformation = dataInformation[currentDatapoint];
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([selectedDatapointInformation.get('min'), selectedDatapointInformation.get('max')]);
    cartogram
        .value((feature) => getDataOfCountry(feature))
        .color((f) => colorScale(getDataOfCountry(f)))
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(40);

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
        cartogram
        .value((feature) => getDataOfCountry(feature))
        .color((f) => colorScale(getDataOfCountry(f)))
        .units(selectedDatapointInformation.units)
        .label(({properties: p}) => `${p.NAME}`)
        .valFormatter(n => n)
        .iterations(40);
        
}

function play() {
    if (interval !== undefined) clearInterval(interval);
    interval = setInterval(showNextDatapoint, 2000)
}

function showNextDatapoint() {
    let currentDatapoint = StateHandler.getCurrentDisplayedDatapoint();
    let currentData = StateHandler.getCurrentDisplayedDataset();
    let allDatapoints = getDataPoints(getDataById(currentData));
    let currentIndex = allDatapoints.indexOf(currentDatapoint);
    console.log(currentIndex);
    if (currentIndex + 1 < allDatapoints.length) {
        changeDatapointTo(allDatapoints[currentIndex + 1]);
    } else {
        changeDatapointTo(allDatapoints[0]);
    }
}

function stop() {
    clearInterval(interval);
}

const throttle = (func, limit) => {
    let lastFunc
    let lastRan
    return function() {
      const context = this
      const args = arguments
      if (!lastRan) {
        func.apply(context, args)
        lastRan = Date.now()
      } else {
        clearTimeout(lastFunc)
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
          }
        }, limit - (Date.now() - lastRan))
      }
    }
  }