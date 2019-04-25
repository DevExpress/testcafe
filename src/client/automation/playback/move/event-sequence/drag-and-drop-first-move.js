import hammerhead from '../../../deps/hammerhead';
import MoveEventSequenceBase from './base';
import { DragAndDropBehavior, MoveBehaviour } from './event-behaviors';

const eventSimulator = hammerhead.eventSandbox.eventSimulator;

export default class DragAndDropFirstMoveEventSequence extends MoveEventSequenceBase {
    setup () {
        super.setup();

        this.dragAndDropMode = true;
    }

    leaveElement (currentElement, prevElement, commonAncestor, options) {
        MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
    }

    move (element, option) {
        MoveBehaviour.move(this.moveEvent, element, option);
    }

    enterElement (currentElement, prevElement, commonAncestor, options) {
        MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);
    }

    dragAndDrop (dragElement, currentElement, prevElement, options, dragDataStore) {
        const dragAllowed = eventSimulator.dragstart(dragElement, options);

        dragDataStore.setReadOnlyMode();

        if (!dragAllowed) {
            this.dragAndDropMode = false;
            return;
        }

        this.dropAllowed = DragAndDropBehavior.dragAndDrop(dragElement, currentElement, prevElement, options);
    }

    run (currentElement, prevElement, options, dragElement, dragDataStore) {
        return super.run(currentElement, null, options, dragElement, dragDataStore);
    }
}
