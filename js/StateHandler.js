class StateHandler {
    constructor() {
        this.state = "";
        this.stateDescription = "";
        this.stateChangedCallbacks = [];
        this.displayInformationCallbacks = [];
        this.currentDataset;
        this.currentDatapoint;
    }

    static getNewStateHandler(identifier) {
        StateHandler.identifiers.push(identifier);
        let stateHandler = new StateHandler();
        StateHandler.stateHandlers[identifier] = stateHandler;
        return stateHandler;
    }

    static getStateHandler(identifier) {
        return StateHandler.stateHandlers[identifier];
    }

    static setState(state, stateDescription) {
        StateHandler.identifiers.forEach(identifier => {
            StateHandler.stateHandlers[identifier].setState(state, stateDescription);
        });
    }

    setState(state, stateDescription) {
        this,state = state;
        this.stateDescription = stateDescription;
        this.stateChangedCallbacks.forEach((callback) => {
            callback();
        });
    }

    getState() {
        return this.state;
    }

    getStateDescription() {
        return this.stateDescription;
    }

    changeDisplayedDataset({dataset, datapoint}) {
        let changed = false;
        if (dataset !== undefined) {
            this.currentDataset = dataset;
            changed = true
        }
        if (datapoint !== undefined) {
            this.currentDatapoint = datapoint;
            changed = true 
        }
        if (changed && this.displayInformationCallbacks.length > 0) {
            this.displayInformationCallbacks.forEach((callback) => {
                callback();
            });
        }
    }

    addStateCallback(callback) {
        this.stateChangedCallbacks.push(callback);
        return callback
    }

    removeStateCallback(callback) {
        this.stateChangedCallbacks.filter((element) => {return callback != element});
    }

    addDisplayInformationCallback(callback) {
        this.displayInformationCallbacks.push(callback);
        return callback
    }

    removeDisplayInformationCallback(callback) {
        this.displayInformationCallbacks.filter((element) => {return callback != element});
    }

    getCurrentDisplayedDataset() {
        return this.currentDataset;
    }

    getCurrentDisplayedDatapoint() {
        return this.currentDatapoint;
    }
}

StateHandler.stateHandlers = {};
StateHandler.identifiers = [];


export {StateHandler}