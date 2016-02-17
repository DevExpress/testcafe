import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import testCafeUI from '../../../deps/testcafe-ui';
import MoveAutomation from '../move';
import { MoveOptions } from '../../options';
import delay from '../../../utils/delay';
import * as mouseUtils from '../../../utils/mouse';
import { ACTION_STEP_DELAY } from '../../settings';

var Promise = hammerhead.Promise;

var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var domUtils   = testCafeCore.domUtils;
var styleUtils = testCafeCore.styleUtils;

var selectElementUI = testCafeUI.selectElement;


const FOCUS_DELAY = browserUtils.hasTouchEvents ? 0 : 160;

export default class SelectChildClickAutomation {
    constructor (element, clickOptions) {
        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;

        this.parentSelect       = domUtils.getSelectParent(this.element);
        this.optionListExpanded = this.parentSelect ? selectElementUI.isOptionListExpanded(this.parentSelect) : false;
        this.childIndex         = null;
        this.clickCausesChange  = false;

        if (this.parentSelect) {
            var isOption      = domUtils.isOptionElement(this.element);
            var selectedIndex = this.parentSelect.selectedIndex;

            this.childIndex = isOption ? domUtils.getOptionIndex(this.parentSelect, this.element) :
                              domUtils.getOptionGroupIndex(this.parentSelect, this.element);

            this.clickCausesChange = isOption && !this.element.disabled && this.childIndex !== selectedIndex;
        }

        this.eventsArgs = {
            options: this.modifiers,
            element: this.element
        };
    }

    _calculateEventArguments () {
        var childElement     = this.optionListExpanded ? selectElementUI.getEmulatedChildElement(this.element) : this.element;
        var parentSelectSize = styleUtils.getSelectElementSize(this.parentSelect) > 1;

        return {
            options: this.modifiers,
            element: browserUtils.isIE && parentSelectSize ? this.parentSelect : childElement
        };
    }

    _getMoveArguments () {
        var element = null;
        var offsetX = null;
        var offsetY = null;

        if (this.optionListExpanded) {
            element = selectElementUI.getEmulatedChildElement(this.element);

            var moveActionOffsets = mouseUtils.getDefaultAutomationOffsets(element);

            offsetX = moveActionOffsets.offsetX;
            offsetY = moveActionOffsets.offsetY;
        }
        else {
            element = document.documentElement;

            var elementCenter = selectElementUI.getSelectChildCenter(this.element);

            offsetX = elementCenter.x;
            offsetY = elementCenter.y;
        }

        return { element, offsetX, offsetY };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions({
            offsetX,
            offsetY,

            modifiers: this.modifiers
        }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(ACTION_STEP_DELAY));
    }

    _mousedown () {
        if (browserUtils.isFirefox) {
            eventSimulator.mousedown(this.eventsArgs.element, this.eventsArgs.options);

            if (this.clickCausesChange)
                this.parentSelect.selectedIndex = this.childIndex;

            return this._focus();
        }

        if (browserUtils.isIE) {
            eventSimulator.mousedown(this.eventsArgs.element, this.eventsArgs.options);

            return this._focus();
        }

        // NOTE: In Chrome, document.activeElement is 'select' after mousedown. But we need to
        // raise blur and change the event for a previously active element during focus raising.
        // That's why we should change the event order and raise focus before mousedown.
        return this
            ._focus()
            .then(() => delay(FOCUS_DELAY))
            .then(() => {
                eventSimulator.mousedown(this.eventsArgs.element, this.eventsArgs.options);

                if (this.clickCausesChange)
                    this.parentSelect.selectedIndex = this.childIndex;
            });
    }

    _focus () {
        return new Promise(resolve => {
            focusBlurSandbox.focus(this.parentSelect, resolve, false, true);
        });
    }

    _mouseup () {
        if (browserUtils.isFirefox) {
            eventSimulator.mouseup(this.eventsArgs.element, this.eventsArgs.options);

            if (this.clickCausesChange)
                eventSimulator.change(this.parentSelect);
        }
        else if (browserUtils.isIE) {
            eventSimulator.mouseup(this.parentSelect, this.eventsArgs.options);

            if (this.clickCausesChange) {
                this.parentSelect.selectedIndex = this.childIndex;

                eventSimulator.change(this.parentSelect);
            }

        }
        else {
            eventSimulator.mouseup(this.eventsArgs.element, this.eventsArgs.options);

            if (browserUtils.isSafari && this.clickCausesChange)
                eventSimulator.change(this.parentSelect);
        }

        return Promise.resolve();
    }

    _click () {
        eventSimulator.click(this.eventsArgs.element, this.eventsArgs.options);
    }


    run () {
        if (!this.parentSelect) {
            eventSimulator.click(this.eventsArgs.element, this.eventsArgs.options);

            return Promise.resolve();
        }

        if (!this.optionListExpanded)
            selectElementUI.scrollOptionListByChild(this.element);

        var moveArguments = this._getMoveArguments();

        this.eventsArgs = this._calculateEventArguments();

        if (styleUtils.getSelectElementSize(this.parentSelect) <= 1) {
            return this
                ._move(moveArguments)
                .then(() => {
                    eventSimulator.click(this.eventsArgs.element, this.eventsArgs.options);
                });
        }

        return this
            ._move(moveArguments)
            .then(() => this._mousedown())
            .then(() => this._mouseup())
            .then(() => this._click());
    }
}
