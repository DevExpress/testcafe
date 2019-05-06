import hammerhead from '../../deps/hammerhead';

const browserUtils   = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners      = hammerhead.eventSandbox.listeners;
const Promise        = hammerhead.Promise;

class ElementMouseUpCommand {
    constructor (eventArgs) {
        this.eventArgs  = eventArgs;
    }

    run () {
        const mouseUpStatePromise = browserUtils.isIE ? Promise.resolve({}) : this._getMouseUpState();

        eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);

        return mouseUpStatePromise;
    }

    _getMouseUpState () {
        return new Promise(resolve => {
            const getTimeStamp = e => {
                listeners.removeInternalEventListener(window, ['mouseup'], getTimeStamp);

                resolve({ timeStamp: e.timeStamp });
            };

            listeners.addInternalEventListener(window, ['mouseup'], getTimeStamp);
        });
    }
}

export default function (eventArgs) {
    return new ElementMouseUpCommand(eventArgs);
}


