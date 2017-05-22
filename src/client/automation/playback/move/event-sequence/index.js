import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';
import MoveEventSequenceBase from './base';

var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var extend         = hammerhead.utils.extend;

class MoveEventSequence extends MoveEventSequenceBase {
    leaveElement (currentElement, prevElement, options) {
        eventSimulator.mouseout(prevElement, extend({ relatedTarget: currentElement }, options));
    }

    move (element, options, moveEvent) {
        eventSimulator[moveEvent](element, options);
    }

    enterElement (currentElement, prevElement, options) {
        eventSimulator.mouseover(currentElement, extend({ relatedTarget: prevElement }, options));
    }

    teardown (currentElement, eventOptions, prevElement, moveEvent) {
        // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
        // the client script requires several 'mousemove' events for an element (T246904)
        if (domUtils.isElementInDocument(currentElement) && currentElement !== prevElement)
            eventSimulator[moveEvent](currentElement, eventOptions);
    }
}

export default new MoveEventSequence();
