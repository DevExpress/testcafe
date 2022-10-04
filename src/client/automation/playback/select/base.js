import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import VisibleElementAutomation from '../../visible-element-automation';
import getElementFromPoint from '../../get-element';
import * as selectUtils from './utils';
import MoveAutomation from '../move/move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';
import { ActionElementIsInvisibleError } from '../../../../shared/errors';

const Promise          = hammerhead.Promise;
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

const contentEditable = testCafeCore.contentEditable;
const domUtils        = testCafeCore.domUtils;
const positionUtils   = testCafeCore.positionUtils;
const eventUtils      = testCafeCore.eventUtils;
const delay           = testCafeCore.delay;


export default class SelectBaseAutomation extends VisibleElementAutomation {
    constructor (element, actionOptions) {
        super(element, actionOptions, window, cursor);

        this.absoluteStartPoint = null;
        this.absoluteEndPoint   = null;
        this.clientPoint        = null;

        this.speed = actionOptions.speed;

        this.downEvent = featureDetection.isTouchDevice ? 'touchstart' : 'mousedown';
        this.upEvent   = featureDetection.isTouchDevice ? 'touchend' : 'mouseup';

        this.eventArgs = {
            options: null,
            element: null,
        };

        this.eventState = {
            mousedownPrevented:      false,
            simulateDefaultBehavior: true,
        };
    }

    _calculateEventArguments () {
        const clientPoint = positionUtils.offsetToClientCoords(this.clientPoint);

        return getElementFromPoint(clientPoint)
            .then(element => {
                if (!element) {
                    throw new ActionElementIsInvisibleError(null, {
                        reason: positionUtils.getElOutsideBoundsReason(this.element),
                    });
                }

                return {
                    element: element,
                    options: {
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                    },
                };
            });
    }

    _move ({ element, offsetX, offsetY, speed }) {
        const moveOptions = new MoveOptions({ offsetX, offsetY, speed }, false);

        return MoveAutomation.create(element, moveOptions, window, cursor)
            .then(moveAutomation => {
                return moveAutomation.run();
            })
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _bindMousedownHandler () {
        const onmousedown = e => {
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

        const moveArguments = {
            element: document.documentElement,
            offsetX: this.clientPoint.x,
            offsetY: this.clientPoint.y,
            speed:   this.speed,
        };

        return this._move(moveArguments);
    }

    _mousedown () {
        return cursor
            .leftButtonDown()
            .then(() => this._calculateEventArguments())
            .then(args => {
                this.eventArgs = args;

                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                const needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
                                              domUtils.isSelectElement(this.element);

                if (needCloseSelectDropDown)
                    this._bindMousedownHandler();

                this.eventState.simulateDefaultBehavior = eventSimulator[this.downEvent](this.eventArgs.element,
                    this.eventArgs.options);

                if (this.eventState.simulateDefaultBehavior === false)
                    this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !this.eventState.mousedownPrevented;

                return this._focus();
            });
    }

    _focus () {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            const elementForFocus = domUtils.isContentEditableElement(this.element) ?
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

                return this._calculateEventArguments();
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
