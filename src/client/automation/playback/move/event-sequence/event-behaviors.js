import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';

const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const extend         = hammerhead.utils.extend;
const nativeMethods  = hammerhead.nativeMethods;

export class MoveBehaviour {
    static leaveElement (currentElement, prevElement, commonAncestor, options) {
        eventSimulator.mouseout(prevElement, extend({ relatedTarget: currentElement }, options));

        let currentParent = prevElement;

        while (currentParent && currentParent !== commonAncestor) {
            eventSimulator.mouseleave(currentParent, extend({ relatedTarget: currentElement }, options));

            currentParent = nativeMethods.nodeParentNodeGetter.call(currentParent);
        }
    }

    static enterElement (currentElement, prevElement, commonAncestor, options) {
        eventSimulator.mouseover(currentElement, extend({ relatedTarget: prevElement }, options));

        let currentParent        = currentElement;
        const mouseenterElements = [];

        while (currentParent && currentParent !== commonAncestor) {
            mouseenterElements.push(currentParent);

            currentParent = nativeMethods.nodeParentNodeGetter.call(currentParent);
        }

        mouseenterElements.reverse();

        for (let i = 0; i < mouseenterElements.length; i++)
            eventSimulator.mouseenter(mouseenterElements[i], extend({ relatedTarget: prevElement }, options));
    }

    static move (moveEvent, element, options) {
        eventSimulator[moveEvent](element, options);
    }
}

export class DragAndDropBehavior {
    static dragAndDrop (dragElement, currentElement, prevElement, options) {
        eventSimulator.drag(dragElement, options);

        const currentElementChanged = currentElement !== prevElement;

        if (currentElementChanged) {
            if (domUtils.isElementInDocument(currentElement)) {
                options.relatedTarget = prevElement;

                eventSimulator.dragenter(currentElement, options);
            }

            if (prevElement) {
                options.relatedTarget = currentElement;

                eventSimulator.dragleave(prevElement, options);
            }
        }

        return !eventSimulator.dragover(currentElement, options);
    }
}
