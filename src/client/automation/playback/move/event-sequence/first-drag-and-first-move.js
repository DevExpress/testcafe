import hammerhead from '../../../deps/hammerhead';
import MoveEventSequenceBase from './base';
import moveEventSequence from './index';
import dragAndDropMoveEventSequence from './drag-and-drop-move';

var eventSimulator = hammerhead.eventSandbox.eventSimulator;

class DragAndDropFirstMoveEventSequence extends MoveEventSequenceBase {
    setup () {
        super.setup();

        this.dragAndDropMode = true;
    }

    leaveElement () {
        moveEventSequence.leaveElement.apply(this, arguments);
    }

    move () {
        moveEventSequence.move.apply(this, arguments);
    }

    enterElement () {
        moveEventSequence.enterElement.apply(this, arguments);
    }

    dragAndDrop (dragElement, currentElement, prevElement, options) {
        var dragAllowed = eventSimulator.dragstart(dragElement, options);

        if (!dragAllowed) {
            this.dragAndDropMode = false;
            return;
        }

        dragAndDropMoveEventSequence.dragAndDrop.apply(this, arguments);
    }

    run (currentElement, prevElement, options, moveEvent, dragElement) {
        return super.run(currentElement, null, options, moveEvent, dragElement);
    }
}

export default new DragAndDropFirstMoveEventSequence();
