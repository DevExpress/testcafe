import hammerhead from '../../deps/hammerhead';
import {
    contentEditable,
    positionUtils,
    domUtils,
    delay
} from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../../get-element';
import VisibleElementAutomation from '../visible-element-automation';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';

const MIN_MOVING_TIME = 25;

var Promise          = hammerhead.Promise;
var extend           = hammerhead.utils.extend;
var featureDetection = hammerhead.utils.featureDetection;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;


export default class DragAutomationBase extends VisibleElementAutomation {
    constructor (element, mouseOptions) {
        super(element, mouseOptions);

        this.modifiers = mouseOptions.modifiers;
        this.speed     = mouseOptions.speed;
        this.offsetX   = mouseOptions.offsetX;
        this.offsetY   = mouseOptions.offsetY;

        this.endPoint  = null;
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
                eventSimulator[this.downEvent](eventArgs.element, eventArgs.options);

                return this._focus(eventArgs);
            });
    }

    _focus (eventArgs) {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            var elementForFocus = domUtils.isContentEditableElement(this.element) ?
                contentEditable.findContentEditableParent(this.element) : eventArgs.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _getDestination () {
        throw new Error('Not implemented');
    }

    _drag () {
        var { element, offsets, endPoint } = this._getDestination();

        this.endPoint = endPoint;

        var dragOptions = new MoveOptions({
            offsetX:        offsets.offsetX,
            offsetY:        offsets.offsetY,
            modifiers:      this.modifiers,
            speed:          this.speed,
            minMovingTime:  MIN_MOVING_TIME,
            holdLeftButton: true
        }, false);

        var moveAutomation = new MoveAutomation(element, dragOptions);

        return moveAutomation
            .run()
            .then(dragAndDropState => {
                this.dragAndDropState = dragAndDropState;

                return delay(this.automationSettings.mouseActionStepDelay);
            });
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                var point      = positionUtils.offsetToClientCoords(this.endPoint);
                var topElement = null;
                var options    = extend({
                    clientX: point.x,
                    clientY: point.y
                }, this.modifiers);

                return getElementFromPoint(point.x, point.y)
                    .then(({ element }) => {
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

                        return getElementFromPoint(point.x, point.y);
                    })
                    .then(({ element }) => {
                        //B231323
                        if (topElement && element === topElement && !this.dragAndDropState.enabled)
                            eventSimulator.click(topElement, options);
                    });
            });
    }

    run (useStrictElementCheck) {
        var eventArgs = null;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint }) => {
                eventArgs = {
                    point:   clientPoint,
                    element: element,
                    options: extend({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y
                    }, this.modifiers)
                };

                // NOTE: we should raise start drag with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown(eventArgs)]);
            })
            .then(() => this._drag())
            .then(() => this._mouseup());
    }
}
