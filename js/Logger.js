import { StateHandler } from "./StateHandler.js";

class Logger {
    stateHandler = {}

    constructor(stateIdentifier) {
        this.stateHandler = StateHandler.getStateHandler(stateIdentifier)
        this.stateHandler.addStateCallback(()=>{
            console.log(`New State: ${this.stateHandler.getStateDescription()}`);
        });
    }

    static logWarning(exception) {
        console.warn(exception.toString());
    }
}

export {Logger}