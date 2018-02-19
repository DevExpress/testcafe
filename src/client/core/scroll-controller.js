import { eventSandbox, Promise } from './deps/hammerhead';
import { EventEmitter } from './utils/service';


const listeners = eventSandbox.listeners;

class ScrollController {
    constructor () {
        this.initialized         = false;
        this.stopPropagationFlag = false;

        this.events = new EventEmitter();
    }

    _internalListener (event, dispatched, preventEvent, cancelHandlers, stopPropagation) {
        this.events.emit('scroll', event);

        if (this.stopPropagationFlag) {
            cancelHandlers();
            stopPropagation();
        }
    }

    init () {
        if (this.initialized)
            return;

        this.initialized = true;

        listeners.initElementListening(window, ['scroll']);
        listeners.addFirstInternalHandler(window, ['scroll'], (...args) => this._internalListener(...args));
    }

    waitForScroll () {
        var promiseResolver = null;

        var promise = new Promise(resolve => {
            promiseResolver = resolve;
        });

        promise.cancel = () => this.events.off('scroll', promiseResolver);

        if (this.initialized)
            this.events.once('scroll', promiseResolver);
        else
            promiseResolver();

        return promise;
    }

    stopPropagation () {
        this.stopPropagationFlag = true;
    }

    enablePropagation () {
        this.stopPropagationFlag = false;
    }
}

export default new ScrollController();
