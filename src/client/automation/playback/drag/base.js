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
var browserUtils     = hammerhead.utils.browser;
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

        this.endPoint        = null;
        this.downEvent       = browserUtils.isTouchDevice ? 'touchstart' : 'mousedown';
        this.upEvent         = browserUtils.isTouchDevice ? 'touchend' : 'mouseup';
        this.dragAndDropMode = false;
        this.dragElement     = null;
        this.dropAllowed     = false;
        this.dataTransfer    = null;

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
                this.eventArgs       = args;
                this.dragAndDropMode = this.eventArgs.element.draggable;

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
            offsetX:         offsets.offsetX,
            offsetY:         offsets.offsetY,
            modifiers:       this.modifiers,
            speed:           this.speed,
            minMovingTime:   MIN_MOVING_TIME,
            dragMode:        !this.dragAndDropMode,
            dragAndDropMode: this.dragAndDropMode
        }, false);

        var moveAutomation = new MoveAutomation(element, dragOptions);

        return moveAutomation
            .run()
            .then(() => {
                // NOTE: dragAndDropMode can be cancelled during moved by event handlers
                this.dragAndDropMode = moveAutomation.dragAndDropMode;
                this.dragElement     = moveAutomation.dragElement;
                this.dataTransfer    = moveAutomation.dataTransfer;
                this.dropAllowed     = moveAutomation.dropAllowed;

                return delay(this.automationSettings.mouseActionStepDelay)
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

                        if (this.dragAndDropMode) {
                            options.dataTransfer = this.dataTransfer;

                            if (this.dropAllowed)
                                eventSimulator.drop(topElement, options);

                            eventSimulator.dragend(this.dragElement, options);
                        }
                        else
                            eventSimulator[this.upEvent](topElement, options);

                        return getElementFromPoint(point.x, point.y);
                    })
                    .then(element => {
                        //B231323
                        if (topElement && element === topElement)
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
