import MoveEventSequenceBase from './base';
import { DragAndDropBehavior } from './event-behaviors';

export default class DragAndDropMoveEventSequence extends MoveEventSequenceBase {
    setup () {
        super.setup();

        this.dragAndDropMode = true;
    }

    dragAndDrop (dragElement, currentElement, prevElement, options) {
        this.dropAllowed = DragAndDropBehavior.dragAndDrop(dragElement, currentElement, prevElement, options);
    }
}
