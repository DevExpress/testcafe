import MoveEventSequence from './move-event-sequence';
import DragAndDropMoveEventSequence from './drag-and-drop-move';
import DragAndDropFirstMoveEventSequence from './drag-and-drop-first-move';

export default function createEventSequence (dragAndDropEnabled, firstMovingStepOccured, options) {
    if (!dragAndDropEnabled)
        return new MoveEventSequence(options);

    if (firstMovingStepOccured)
        return new DragAndDropMoveEventSequence(options);

    return new DragAndDropFirstMoveEventSequence(options);
}
