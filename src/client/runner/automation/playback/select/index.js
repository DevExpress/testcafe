import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../../get-element';
import * as automationSettings from '../../settings';
import * as selectUtils from './utils';
import MoveAutomation from '../move';
import MoveOptions from '../../options/move';
import cursor from '../../cursor';
import delay from '../../../utils/delay';

var Promise          = hammerhead.Promise;
var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var eventUtils      = testCafeCore.eventUtils;


export default class SelectAutomation {
    constructor (element, selectOptions) {
        this.element = element;

        this.startPos = selectOptions.startPos;
        this.endPos   = selectOptions.endPos;

        this.absoluteStartPoint = this._calculateAbsoluteStartPoint();
        this.absoluteEndPoint   = this._calculateAbsoluteEndPoint();
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

        return {
            element: getElementFromPoint(clientPoint.x, clientPoint.y),
            options: {
                clientX: clientPoint.x,
                clientY: clientPoint.y
            }
        };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions();

        moveOptions.offsetX = offsetX;
        moveOptions.offsetY = offsetY;

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(automationSettings.DRAG_ACTION_STEP_DELAY));
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
        var point = null;

        if (!this.startPos.node)
            point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.startPos);
        else
            point = selectUtils.getSelectionCoordinatesByNodeAndOffset(this.element, this.startPos);

        return point || positionUtils.findCenter(this.element);
    }

    _calculateAbsoluteEndPoint () {
        var point = null;

        if (!this.startPos.node)
            point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.endPos);
        else
            point = selectUtils.getSelectionCoordinatesByNodeAndOffset(this.element, this.endPos);

        if (point)
            return point;

        // NOTE: if selection ends on an invisible symbol, we should try to find the last visible selection position
        if (domUtils.isContentEditableElement(this.element) && !this.startPos.node)
            return selectUtils.getLastVisibleSelectionPosition(this.element, this.startPos, this.endPos);

        return positionUtils.findCenter(this.element);
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
            .then(() => {
                this.eventArgs = SelectAutomation._calculateEventArguments(this.clientPoint);

                // NOTE: in WebKit and IE, the mousedown event opens the select element's dropdown.
                // Therefore, we should prevent mousedown and hide the dropdown (B236416)
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
        var isTextEditable    = domUtils.isTextEditableElement(this.element);
        var isContentEditable = domUtils.isContentEditableElement(this.element);

        if (!(isTextEditable || isContentEditable) || this.eventState.simulateDefaultBehavior === false)
            return;

        // NOTE: The same cursor position may correspond to different nodes, so, if we
        // know which nodes should be selected eventually, we should select them directly.
        if (this.startPos.node)
            textSelection.selectByNodesAndOffsets(this.startPos, this.endPos, true);
        else
            textSelection.select(this.element, this.startPos, this.endPos);
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                this._setSelection();

                this.eventArgs = SelectAutomation._calculateEventArguments(this.clientPoint);

                eventSimulator[this.upEvent](this.eventArgs.element, this.eventArgs.options);
            });
    }

    run () {
        return this.
            _moveToPoint(this.absoluteStartPoint)
            .then(() => this._mousedown())
            .then(() => this._moveToPoint(this.absoluteEndPoint))
            .then(() => this._mouseup());
    }

}
