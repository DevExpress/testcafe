import hammerhead from '../../deps/hammerhead';
import {
    contentEditable,
    positionUtils,
    domUtils,
    delay,
} from '../../deps/testcafe-core';
import getElementFromPoint from '../../get-element';
import VisibleElementAutomation from '../../visible-element-automation';
import DragMoveAutomation from '../move/drag-move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';

const MIN_MOVING_TIME = 25;

const Promise          = hammerhead.Promise;
const extend           = hammerhead.utils.extend;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;


export default class DragAutomationBase extends VisibleElementAutomation {
    constructor (element, mouseOptions) {
        super(element, mouseOptions, window, cursor);

        this.modifiers = mouseOptions.modifiers;
        this.speed     = mouseOptions.speed;
        this.offsetX   = mouseOptions.offsetX;
        this.offsetY   = mouseOptions.offsetY;

        this.endPoint                = null;
        this.simulateDefaultBehavior = true;

        this.downEvent = featureDetection.isTouchDevice ? 'touchstart' : 'mousedown';
        this.upEvent   = featureDetection.isTouchDevice ? 'touchend' : 'mouseup';

        this.dragAndDropState = null;
    }

    _getEndPoint () {
        throw new Error('Not implemented');
    }

    _mousedown (eventArgs) {
        return cursor
            .leftButtonDown()
            .then(() => {
                this.simulateDefaultBehavior = eventSimulator[this.downEvent](eventArgs.element, eventArgs.options);

                return this._focus(eventArgs);
            });
    }

    _focus (eventArgs) {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            const elementForFocus = domUtils.isContentEditableElement(this.element) ?
                contentEditable.findContentEditableParent(this.element) : eventArgs.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _getDestination () {
        throw new Error('Not implemented');
    }

    _drag () {
        return this._getDestination()
            .then(({ element, offsets, endPoint }) => {
                this.endPoint = endPoint;

                const dragOptions = new MoveOptions({
                    offsetX:                 offsets.offsetX,
                    offsetY:                 offsets.offsetY,
                    modifiers:               this.modifiers,
                    speed:                   this.speed,
                    minMovingTime:           MIN_MOVING_TIME,
                    skipDefaultDragBehavior: this.simulateDefaultBehavior === false,
                }, false);

                return DragMoveAutomation.create(element, dragOptions, window, cursor);
            })
            .then(moveAutomation => {
                return moveAutomation.run();
            })
            .then(dragAndDropState => {
                this.dragAndDropState = dragAndDropState;

                return delay(this.automationSettings.mouseActionStepDelay);
            });
    }

    _mouseup (draggedElement) {
        return cursor
            .buttonUp()
            .then(() => {
                const point    = positionUtils.offsetToClientCoords(this.endPoint);
                let topElement = null;
                const options  = extend({
                    clientX: point.x,
                    clientY: point.y,
                }, this.modifiers);

                return getElementFromPoint(point)
                    .then(element => {
                        topElement = element;

                        if (!topElement)
                            return topElement;

                        if (this.dragAndDropState.enabled) {
                            options.dataTransfer = this.dragAndDropState.dataTransfer;

                            if (this.dragAndDropState.dropAllowed)
                                eventSimulator.drop(topElement, options);

                            eventSimulator.dragend(this.dragAndDropState.element, options);
                            this.dragAndDropState.dataStore.setProtectedMode();
                        }
                        else
                            eventSimulator[this.upEvent](topElement, options);

                        return getElementFromPoint(point);
                    })
                    .then(element => {
                        //B231323
                        if (topElement && element === topElement && !this.dragAndDropState.enabled && element === draggedElement)
                            eventSimulator.click(topElement, options);
                    });
            });
    }

    run (useStrictElementCheck) {
        let eventArgs = null;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint }) => {
                eventArgs = {
                    point:   clientPoint,
                    element: element,
                    options: extend({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                    }, this.modifiers),
                };

                // NOTE: we should raise start drag with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown(eventArgs)]);
            })
            .then(() => this._drag())
            .then(() => this._mouseup(eventArgs.element));
    }
}
