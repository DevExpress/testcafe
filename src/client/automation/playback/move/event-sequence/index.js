import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';
import MoveEventSequenceBase from './base';

var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var extend         = hammerhead.utils.extend;

class MoveEventSequence extends MoveEventSequenceBase {
    leaveElement (currentElement, prevElement, commonAncestor, options) {
        eventSimulator.mouseout(prevElement, extend({ relatedTarget: currentElement }, options));

        var currentParent = prevElement;

        while (currentParent && currentParent !== commonAncestor) {
            eventSimulator.mouseleave(currentParent, extend({ relatedTarget: currentElement }, options));
            currentParent = currentParent.parentNode;
        }
    }

    move (element, options, moveEvent) {
        eventSimulator[moveEvent](element, options);
    }

    enterElement (currentElement, prevElement, commonAncestor, options) {
        eventSimulator.mouseover(currentElement, extend({ relatedTarget: prevElement }, options));

        var currentParent      = currentElement;
        var mouseenterElements = [];

        while (currentParent && currentParent !== commonAncestor) {
            mouseenterElements.push(currentParent);
            currentParent = currentParent.parentNode;
        }

        mouseenterElements.reverse();

        for (var i = 0; i < mouseenterElements.length; i++)
            eventSimulator.mouseenter(mouseenterElements[i], extend({ relatedTarget: prevElement }, options));
    }

    teardown (currentElement, eventOptions, prevElement, moveEvent) {
        // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
        // the client script requires several 'mousemove' events for an element (T246904)
        if (domUtils.isElementInDocument(currentElement) && currentElement !== prevElement)
            eventSimulator[moveEvent](currentElement, eventOptions);
    }
}

export default new MoveEventSequence();
