import { StateHandler } from "./StateHandler.js";

class Logger {
    stateHandler = {}

    constructor(stateIdentifier) {
        this.stateHandler = StateHandler.getStateHandler(stateIdentifier)
        this.stateHandler.addStateCallback(()=>{
            console.log(`New State: ${this.stateHandler.getStateDescription()}`);
        });
    }
}

export {Logger}