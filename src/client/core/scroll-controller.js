import { eventSandbox } from './deps/hammerhead';
import { EventEmitter } from './utils/service';


const listeners = eventSandbox.listeners;

class ScrollController extends EventEmitter {
    constructor () {
        super();

        this.stopPropagationFlag = false;
    }

    _internalListener (event, dispatched, preventEvent, cancelHandlers, stopPropagation) {
        this.emit('scroll', event);

        if (this.stopPropagationFlag) {
            cancelHandlers();
            stopPropagation();
        }
    }

    init () {
        listeners.initElementListening(window, ['scroll']);
        listeners.addFirstInternalHandler(window, ['scroll'], (...args) => this._internalListener(...args));
    }

    stopPropagation () {
        this.stopPropagationFlag = true;
    }

    enablePropagation () {
        this.stopPropagationFlag = false;
    }
}

export default new ScrollController();
