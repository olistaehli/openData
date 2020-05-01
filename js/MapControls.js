import { StateHandler } from './StateHandler.js';
class MapControls {
    
    constructor(element, stateHandlerIdentifier) {
        this.element = element
        this.animationDelay = 2000;

        this.stateHandler = StateHandler.getStateHandler(stateHandlerIdentifier);

        this.sliderSVG = this.createSliderSVG(this.element)
        this.statehandlerCallback = this.stateHandler.addDisplayInformationCallback(()=>{
            if (this.slider !== undefined && this.dataPoints !== undefined) {
                let newDataPoint = this.stateHandler.getCurrentDisplayedDatapoint();
                let index = this.dataPoints.indexOf(newDataPoint);
                if (index >= 0) this.slider.silentValue(index)
            }
        });
    }

    createSliderSVG(element) {
        return d3.select(element)
            .append('svg')
            .attr('width', "100%")
            .attr('height', 100);
    }

    createSlider(parent) {
        return d3.sliderHorizontal()
        .step(1)
        .width(parent.node().getBoundingClientRect().width - 60)
        .fill(getComputedStyle(document.documentElement)
        .getPropertyValue('--darkblue-color'))
        .handle(
            d3
            .symbol()
            .type(d3.symbolCircle)
            .size(200)()
        );
    }

    newSlider(columns, callback) {
        d3.select(this.element).selectAll('.slider').remove();
        this.slider = this.createSlider(this.sliderSVG)
        this.dataPoints = columns;
        
        let sliderGroup = this.sliderSVG.append('g')
            .classed('slider', true)
            .attr('transform', 'translate(30,30)')
        this.slider
            .domain([0, columns.length -1])
            .ticks(Math.min(columns.length, 10))
            .displayFormat((n) => columns[n])
            .tickFormat((n) => columns[n])
            .on('end', index => {
                callback(columns[index]);
            });
        sliderGroup.call(this.slider);
    }

    newAnimationControlButtons({start: callbackStart, stop: callbackStop, step: callbackStep, iterationsChange: iterationsChange}) {
        this.callbackStart = callbackStart;
        this.callbackStop = callbackStop;
        this.callbackStep = callbackStep;
        this.iterationsChange = iterationsChange;
        if (this.animationControlButton === undefined) {
            this.animationControlButton = this.createButton()
            d3.select(this.element).node().appendChild((this.animationControlButton));
            d3.select(this.element).node().appendChild(this.createAnimationSettingsMenu());
        }
    }

    createButton() {
        let button = document.createElement('button');
        button.classList.add('animation-control', 'stopped');
        button.onclick = () => {this.toggleAnimationState()};
        return button;
    }

    toggleAnimationState() {
        let button = this.animationControlButton;
        if (this.isAnimating === undefined || !this.isAnimating) {
            this.start.bind(this)();
            button.classList.add('playing');
            button.classList.remove('stopped');
            this.isAnimating = true;
        } else {
            this.stop.bind(this)();
            button.classList.add('stopped');
            button.classList.remove('playing');
            this.isAnimating = false;
        }
    }

    start() {
        if (this.animationInterval === undefined) {
            clearInterval(this.animationInterval);
            this.animationInterval = setInterval(() => {this.animationStep()}, this.animationDelay);
            if (this.callbackStart !== undefined && typeof this.callbackStart === "function") this.callbackStart();
        }
    }

    stop() {
        clearInterval(this.animationInterval);
        this.animationInterval = undefined;
        if (this.callbackStop !== undefined && typeof this.callbackStop === "function") this.callbackStop();
    }

    animationStep() {
        if (this.callbackStep !== undefined && typeof this.callbackStep === "function") this.callbackStep();
    }

    changeAnimationDelay(newDelay) {
        this.animationDelay = newDelay;
        this.stop();
        this.start();
    }

    createAnimationSettingsMenu() {
        let container = document.createElement('span');
        let button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-dark');
        button.setAttribute('data-toggle', "popover");
        button.type = 'button';
        button.innerHTML = `<svg class="bi bi-gear-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="${getComputedStyle(document.documentElement)
            .getPropertyValue('--darkblue-color')}" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 01-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 01.872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 012.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 012.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 01.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 01-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 01-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 100-5.86 2.929 2.929 0 000 5.858z" clip-rule="evenodd"/>
      </svg>`;
        container.appendChild(button);
        
        $(button).popover({title: "Settings", content: $(createSpeedControl().outerHTML + ` <div class="dropdown-divider"></div>` + createQualityControl().outerHTML), html: true});
        return container;
    }

}

function createQualityControl() {
    let qualityControl = createButtonGroup();
    qualityControl.appendChild(createQualityControlButton('fast', 10, 'Fast'));
    qualityControl.appendChild(createQualityControlButton('medium', 30, 'Medium'));
    qualityControl.appendChild(createQualityControlButton('accurate', 60, 'Accurate'));
    
    return qualityControl;
}

function createSpeedControl() {
   let speedControl = createButtonGroup();
    speedControl.appendChild(createSpeedControlButton('slow', 4000, 'Slow'));
    speedControl.appendChild(createSpeedControlButton('medium', 2000, 'Medium'));
    speedControl.appendChild(createSpeedControlButton('fast', 1000, 'Fast'));
    return speedControl;
}

function createButtonGroup() {
    let control = document.createElement('div');
    control.classList.add('btn-group', 'btn-group-toggle', 'w-100');
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'The settings for the speed Control');
    control.setAttribute('data-toggle', 'buttons');
    return control;
}

function createSpeedControlButton(id, value, text) {
    let {label, button} = createControlLabelAndButton(id, text, 'speedControl');

    label.setAttribute('title', `${value}ms`)
    button.onclick = () => {this.changeAnimationDelay(value)};
    label.appendChild(button);
    return label;
}

function createQualityControlButton(id, value, text) {
    let {label, button} = createControlLabelAndButton(id, text, 'qualityControl');

    label.setAttribute('title', `${value} iterations`)
    button.onclick = () => {this.changeNumberOfIterations(value)};
    label.appendChild(button);
    return label;
}

function createControlLabelAndButton(id, text, name) {
    let label = document.createElement('label');
    label.classList.add('btn', 'btn-secondary', 'btn-sm', 'w-100');
    label.innerText = text;
    
    let button = document.createElement('input');
    button.type = 'radio';
    button.name = name;
    button.id = id;
    return {label, button}
}

function changeNumberOfIterations(value) {
    if (this.iterationsChange !== undefined && typeof this.iterationsChange === "function") this.iterationsChange(value);
}

export {MapControls}