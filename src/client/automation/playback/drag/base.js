import hammerhead from '../../deps/hammerhead';
import {
    contentEditable,
    positionUtils,
    domUtils,
    delay
} from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../../get-element';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';
import getAutomationPoint from '../../utils/get-automation-point';
import screenPointToClient from '../../utils/screen-point-to-client';
import AutomationSettings from '../../settings';
import AUTOMATION_ERROR_TYPES from '../../errors';


const MIN_MOVING_TIME = 25;

var Promise          = hammerhead.Promise;
var extend           = hammerhead.utils.extend;
var featureDetection = hammerhead.utils.featureDetection;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;


export default class DragAutomationBase {
    constructor (element, mouseOptions) {
        this.element = element;
        this.options = mouseOptions;

        this.modifiers = mouseOptions.modifiers;
        this.offsetX   = mouseOptions.offsetX;
        this.offsetY   = mouseOptions.offsetY;
        this.speed     = mouseOptions.speed;

        this.automationSettings = new AutomationSettings(this.speed);

        this.endPoint  = null;
        this.downEvent = featureDetection.isTouchDevice ? 'touchstart' : 'mousedown';
        this.upEvent   = featureDetection.isTouchDevice ? 'touchend' : 'mouseup';

        this.dragAndDropState = null;

        this.eventArgs = {
            point:   null,
            options: null,
            element: null
        };
    }

    _calculateEventArguments () {
        var screenPoint     = getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var point           = screenPointToClient(this.element, screenPoint);
        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var options = extend({
            clientX: point.x,
            clientY: point.y
        }, this.modifiers);

        return getElementFromPoint(point.x, point.y, expectedElement)
            .then(topElement => {
                if (!topElement)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return {
                    point:   point,
                    options: options,
                    element: topElement
                };
            });
    }

    _move () {
        var moveOptions    = new MoveOptions(this.options, false);
        var moveAutomation = new MoveAutomation(this.element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _getEndPoint () {
        throw new Error('Not implemented');
    }

    _mousedown () {
        return cursor
            .leftButtonDown()
            .then(() => this._calculateEventArguments())
            .then(args => {
                this.eventArgs = args;

                eventSimulator[this.downEvent](this.eventArgs.element, this.eventArgs.options);

                return this._focus();
            })
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _focus () {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            var elementForFocus = domUtils.isContentEditableElement(this.element) ?
                                  contentEditable.findContentEditableParent(this.element) : this.eventArgs.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _getDestination () {
        throw new Error('Not implemented');
    }

    _drag () {
        this.endPoint = this._getEndPoint();

        var { element, offsets } = this._getDestination();

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

                        return getElementFromPoint(point.x, point.y);
                    })
                    .then(element => {
                        //B231323
                        if (topElement && element === topElement && !this.dragAndDropState.enabled)
                            eventSimulator.click(topElement, options);
                    });
            });
    }

    run () {
        return this._move()
            .then(() => this._mousedown())
            .then(() => this._drag())
            .then(() => this._mouseup());
    }
}
