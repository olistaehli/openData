class StateHandler {

    constructor() {}

    static setState(state, stateDescription) {
        StateHandler.state = state;
        StateHandler.stateDescription = stateDescription;
        StateHandler.stateChangedCallbacks.forEach((callback) => {
            callback();
        });
    }

    static getState() {
        return StateHandler.state;
    }

    static getStateDescription() {
        return StateHandler.stateDescription;
    }

    static changeDisplayedDataset({dataset, datapoint}) {
        console.log(dataset, datapoint);
        let changed = false;
        if (dataset !== undefined) {
            StateHandler.currentDataset = dataset;
            changed = true
        }
        if (datapoint !== undefined) {
            StateHandler.currentDatapoint = datapoint;
            changed = true 
        }
        if (changed && this.displayInformationCallbacks.length > 0) {
            StateHandler.displayInformationCallbacks.forEach((callback) => {
                callback();
            });
        }
    }

    static addStateCallback(callback) {
        StateHandler.stateChangedCallbacks.push(callback);
    }

    static removeStateCallback(callback) {
        StateHandler.stateChangedCallbacks.filter((element) => {return callback != element});
    }

    static addDisplayInformationCallback(callback) {
        StateHandler.displayInformationCallbacks.push(callback);
    }

    static removeDisplayInformationCallback(callback) {
        StateHandler.displayInformationCallbacks.filter((element) => {return callback != element});
    }

    static getCurrentDisplayedDataset() {
        return StateHandler.currentDataset;
    }

    static getCurrentDisplayedDatapoint() {
        return StateHandler.currentDatapoint;
    }
}

StateHandler.state = "";
StateHandler.stateDescription = "";
StateHandler.stateChangedCallbacks = [];
StateHandler.displayInformationCallbacks = [];
StateHandler.currentDataset;
StateHandler.currentDatapoint;

export {StateHandler}