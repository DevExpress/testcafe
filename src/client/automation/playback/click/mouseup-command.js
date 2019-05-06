import hammerhead from '../../deps/hammerhead';

const browserUtils   = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners      = hammerhead.eventSandbox.listeners;

class ElementMouseUpCommand {
    constructor (eventArgs) {
        this.eventArgs  = eventArgs;
    }

    run () {
        let timeStamp = {};

        const getTimeStamp = e => {
            timeStamp = e.timeStamp;

            listeners.removeInternalEventListener(window, ['mouseup'], getTimeStamp);
        };

        if (!browserUtils.isIE)
            listeners.addInternalEventListener(window, ['mouseup'], getTimeStamp);

        eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);

        return { timeStamp };
    }
}

export default function (eventArgs) {
    return new ElementMouseUpCommand(eventArgs);
}


