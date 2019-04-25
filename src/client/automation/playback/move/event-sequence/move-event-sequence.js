import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';
import MoveEventSequenceBase from './base';
import { MoveBehaviour } from './event-behaviors';

const eventSimulator = hammerhead.eventSandbox.eventSimulator;

const TOUCH_MOVE_EVENT_NAME = 'touchmove';

export default class MoveEventSequence extends MoveEventSequenceBase {
    constructor (options) {
        super(options);

        this.holdLeftButton = options.holdLeftButton;
    }
    leaveElement (currentElement, prevElement, commonAncestor, options) {
        MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
    }

    enterElement (currentElement, prevElement, commonAncestor, options) {
        MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);
    }

    move (element, options) {
        if (this._needEmulateMoveEvent())
            MoveBehaviour.move(this.moveEvent, element, options);
    }

    teardown (currentElement, eventOptions, prevElement) {
        // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
        // the client script requires several 'mousemove' events for an element (T246904)
        if (this._needEmulateMoveEvent() && domUtils.isElementInDocument(currentElement) && currentElement !== prevElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);
    }

    _needEmulateMoveEvent () {
        return this.moveEvent !== TOUCH_MOVE_EVENT_NAME || this.holdLeftButton;
    }
}

