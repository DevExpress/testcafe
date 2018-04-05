import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';
import MoveEventSequenceBase from './base';

var eventSimulator = hammerhead.eventSandbox.eventSimulator;

class DragAndDropMoveEventSequence extends MoveEventSequenceBase {
    setup () {
        super.setup();

        this.dragAndDropMode = true;
    }

    dragAndDrop (dragElement, currentElement, prevElement, options) {
        eventSimulator.drag(dragElement, options);

        var currentElementChanged = currentElement !== prevElement;

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

        this.dropAllowed = !eventSimulator.dragover(currentElement, options);
    }
}

export default new DragAndDropMoveEventSequence();
