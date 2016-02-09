import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import MoveAutomation from '../playback/move';
import MoveOptions from '../options/move';
import cursor from '../cursor';
import * as mouseUtils from '../../utils/mouse';
import delay from '../../utils/delay';

const DRAGGING_SPEED = 4; // pixels/ms
const MIN_MOVING_TIME = 25;

var Promise          = hammerhead.Promise;
var browserUtils     = hammerhead.utils.browser;
var extend           = hammerhead.utils.extend;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var positionUtils   = testCafeCore.positionUtils;
var domUtils        = testCafeCore.domUtils;
var styleUtils      = testCafeCore.styleUtils;


export default class DragAutomation {
    constructor (element, dragOptions) {
        this.element = element;

        this.modifiers = dragOptions.modifiers;
        this.offsetX   = dragOptions.offsetX;
        this.offsetY   = dragOptions.offsetY;

        this.destinationElement = dragOptions.destinationElement;
        this.dragOffsetX        = dragOptions.dragOffsetX;
        this.dragOffsetY        = dragOptions.dragOffsetY;

        this.endPoint  = null;
        this.downEvent = browserUtils.hasTouchEvents ? 'touchstart' : 'mousedown';
        this.upEvent   = browserUtils.hasTouchEvents ? 'touchend' : 'mouseup';

        this.eventArgs = {
            point:   null,
            options: null,
            element: null
        };
    }

    _getMoveArguments () {
        var containsOffset    = positionUtils.isContainOffset(this.element, this.offsetX, this.offsetY);
        var moveActionOffsets = mouseUtils.getMoveAutomationOffsets(this.element, this.offsetX, this.offsetY);

        return {
            element: containsOffset ? this.element : document.documentElement,
            offsetX: moveActionOffsets.offsetX,
            offsetY: moveActionOffsets.offsetY
        };
    }

    _calculateEventArguments () {
        var screenPoint     = mouseUtils.getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var point           = mouseUtils.convertToClient(this.element, screenPoint);
        var expectedElement = positionUtils.isContainOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var options = extend({
            clientX: point.x,
            clientY: point.y
        }, this.modifiers);


        var topElement = getElementFromPoint(point.x, point.y, expectedElement);

        return {
            point:   point,
            options: options,
            element: topElement
        };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions();

        moveOptions.offsetX   = offsetX;
        moveOptions.offsetY   = offsetY;
        moveOptions.modifiers = this.modifiers;

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(automationSettings.DRAG_ACTION_STEP_DELAY));
    }

    _getEndPoint () {
        if (this.destinationElement)
            return positionUtils.findCenter(this.destinationElement);

        var startPoint = mouseUtils.getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var maxX       = styleUtils.getWidth(document);
        var maxY       = styleUtils.getHeight(document);
        var endPoint   = {
            x: startPoint.x + this.dragOffsetX,
            y: startPoint.y + this.dragOffsetY
        };

        return {
            x: Math.min(Math.max(0, endPoint.x), maxX),
            y: Math.min(Math.max(0, endPoint.y), maxY)
        };
    }

    _mousedown () {
        return cursor
            .leftButtonDown()
            .then(() => {
                this.eventArgs = this._calculateEventArguments();

                eventSimulator[this.downEvent](this.eventArgs.element, this.eventArgs.options);

                return this._focus();
            })
            .then(() => delay(automationSettings.DRAG_ACTION_STEP_DELAY));
    }

    _focus () {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            var elementForFocus = domUtils.isContentEditableElement(this.element) ?
                                  contentEditable.findContentEditableParent(this.element) : this.eventArgs.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _drag () {
        this.endPoint = this._getEndPoint();

        var element = this.destinationElement || document.documentElement;
        var offsets = this.destinationElement ? automationUtil.getDefaultAutomationOffsets(this.destinationElement) : {
            offsetX: this.endPoint.x,
            offsetY: this.endPoint.y
        };

        var dragOptions = new MoveOptions();

        dragOptions.offsetX       = offsets.offsetX;
        dragOptions.offsetY       = offsets.offsetY;
        dragOptions.modifiers     = this.modifiers;
        dragOptions.speed         = DRAGGING_SPEED;
        dragOptions.minMovingTime = MIN_MOVING_TIME;
        dragOptions.dragMode      = true;

        var moveAutomation = new MoveAutomation(element, dragOptions);

        return moveAutomation
            .run()
            .then(() => delay(automationSettings.DRAG_ACTION_STEP_DELAY));
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                var point      = positionUtils.offsetToClientCoords(this.endPoint);
                var topElement = getElementFromPoint(point.x, point.y);
                var options    = extend({
                    clientX: point.x,
                    clientY: point.y
                }, this.modifiers);

                if (!topElement)
                    return;

                eventSimulator[this.upEvent](topElement, options);

                //B231323
                if (getElementFromPoint(point.x, point.y) === topElement)
                    eventSimulator.click(topElement, options);
            });
    }

    run () {
        var moveArguments = this._getMoveArguments();

        return this.
            _move(moveArguments)
            .then(() => this._mousedown())
            .then(() => this._drag())
            .then(() => this._mouseup());
    }
}
