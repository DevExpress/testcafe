import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../../get-element';
import * as selectUtils from './utils';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';
import { DRAG_ACTION_STEP_DELAY } from '../../settings';
import AUTOMATION_ERROR_TYPES from '../../errors';

var Promise          = hammerhead.Promise;
var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var eventUtils      = testCafeCore.eventUtils;
var delay           = testCafeCore.delay;


export default class SelectBaseAutomation {
    constructor (element) {
        this.element = element;

        this.absoluteStartPoint = null;
        this.absoluteEndPoint   = null;
        this.clientPoint        = null;

        this.downEvent = browserUtils.hasTouchEvents ? 'touchstart' : 'mousedown';
        this.upEvent   = browserUtils.hasTouchEvents ? 'touchend' : 'mouseup';

        this.eventArgs = {
            options: null,
            element: null
        };

        this.eventState = {
            mousedownPrevented:      false,
            simulateDefaultBehavior: true
        };
    }

    static _calculateEventArguments (point) {
        var clientPoint = positionUtils.offsetToClientCoords(point);

        return getElementFromPoint(clientPoint.x, clientPoint.y)
            .then(topElement => {
                if (!topElement)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return {
                    element: topElement,
                    options: {
                        clientX: clientPoint.x,
                        clientY: clientPoint.y
                    }
                };
            });
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions({ offsetX, offsetY }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(DRAG_ACTION_STEP_DELAY));
    }

    _bindMousedownHandler () {
        var onmousedown = e => {
            this.eventState.mousedownPrevented = e.defaultPrevented;
            eventUtils.preventDefault(e);
            eventUtils.unbind(this.element, 'mousedown', onmousedown);
        };

        eventUtils.bind(this.element, 'mousedown', onmousedown);
    }

    _calculateAbsoluteStartPoint () {
        throw new Error('Not implemented');
    }

    _calculateAbsoluteEndPoint () {
        throw new Error('Not implemented');
    }

    _moveToPoint (point) {
        selectUtils.scrollEditableElementByPoint(this.element, point);

        this.clientPoint = selectUtils.excludeElementScroll(this.element, point);

        var moveArguments = {
            element: document.documentElement,
            offsetX: this.clientPoint.x,
            offsetY: this.clientPoint.y
        };

        return this._move(moveArguments);
    }

    _mousedown () {
        return cursor
            .leftButtonDown()
            .then(() => SelectBaseAutomation._calculateEventArguments(this.clientPoint))
            .then(args => {
                this.eventArgs = args;

                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                var needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
                                              domUtils.isSelectElement(this.element);

                if (needCloseSelectDropDown)
                    this._bindMousedownHandler();

                this.eventState.simulateDefaultBehavior = eventSimulator[this.downEvent](this.eventArgs.element,
                    this.eventArgs.options);

                if (this.eventState.simulateDefaultBehavior === false) {
                    this.eventState.simulateDefaultBehavior = needCloseSelectDropDown &&
                                                              !this.eventState.mousedownPrevented;
                }

                return this._focus();
            });
    }

    _focus () {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            var elementForFocus = domUtils.isContentEditableElement(this.element) ?
                                  contentEditable.findContentEditableParent(this.element) : this.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _setSelection () {
        throw new Error('Not implemented');
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                this._setSelection();

                return SelectBaseAutomation._calculateEventArguments(this.clientPoint);
            })
            .then(args => {
                this.eventArgs = args;

                eventSimulator[this.upEvent](this.eventArgs.element, this.eventArgs.options);
            });
    }

    run () {
        this.absoluteStartPoint = this._calculateAbsoluteStartPoint();
        this.absoluteEndPoint   = this._calculateAbsoluteEndPoint();

        return this
            ._moveToPoint(this.absoluteStartPoint)
            .then(() => this._mousedown())
            .then(() => this._moveToPoint(this.absoluteEndPoint))
            .then(() => this._mouseup());
    }

}
