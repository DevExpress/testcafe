import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import { getDefaultAutomationOffsets } from '../../utils/offsets';
import AutomationSettings from '../../settings';

const Promise = hammerhead.Promise;

const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;
const nativeMethods    = hammerhead.nativeMethods;

const domUtils   = testCafeCore.domUtils;
const styleUtils = testCafeCore.styleUtils;
const delay      = testCafeCore.delay;

const selectElementUI = testCafeUI.selectElement;

const FOCUS_DELAY = featureDetection.isTouchDevice ? 0 : 160;


export default class SelectChildClickAutomation {
    constructor (element, clickOptions) {
        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;
        this.speed   = clickOptions.speed;

        this.automationSettings = new AutomationSettings(clickOptions.speed);

        this.parentSelect       = domUtils.getSelectParent(this.element);
        this.optionListExpanded = this.parentSelect ? selectElementUI.isOptionListExpanded(this.parentSelect) : false;
        this.childIndex         = null;
        this.clickCausesChange  = false;

        if (this.parentSelect) {
            const isOption      = domUtils.isOptionElement(this.element);
            const selectedIndex = this.parentSelect.selectedIndex;

            this.childIndex = isOption ? domUtils.getElementIndexInParent(this.parentSelect, this.element) :
                domUtils.getElementIndexInParent(this.parentSelect, this.element);

            const parent         = nativeMethods.nodeParentNodeGetter.call(this.element);
            const parentOptGroup = domUtils.isOptionGroupElement(parent) ? parent : null;
            const isDisabled     = this.element.disabled || parentOptGroup && parentOptGroup.disabled;

            this.clickCausesChange = isOption && !isDisabled && this.childIndex !== selectedIndex;
        }

        this.eventsArgs = {
            options: this.modifiers,
            element: this.element
        };
    }

    _calculateEventArguments () {
        const childElement     = this.optionListExpanded ? selectElementUI.getEmulatedChildElement(this.element) : this.element;
        const parentSelectSize = styleUtils.getSelectElementSize(this.parentSelect) > 1;

        return {
            options: this.modifiers,
            element: browserUtils.isIE && parentSelectSize ? this.parentSelect : childElement
        };
    }

    _getMoveArguments () {
        let element = null;
        let offsetX = null;
        let offsetY = null;

        if (this.optionListExpanded) {
            element = selectElementUI.getEmulatedChildElement(this.element);

            const moveActionOffsets = getDefaultAutomationOffsets(element);

            offsetX = moveActionOffsets.offsetX;
            offsetY = moveActionOffsets.offsetY;
        }
        else {
            element = document.documentElement;

            const elementCenter = selectElementUI.getSelectChildCenter(this.element);

            offsetX = elementCenter.x;
            offsetY = elementCenter.y;
        }

        return { element, offsetX, offsetY, speed: this.speed };
    }

    _move ({ element, offsetX, offsetY, speed }) {
        const moveOptions = new MoveOptions({
            offsetX,
            offsetY,
            speed,

            modifiers: this.modifiers
        }, false);

        const moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
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
        const elementForMouseupEvent = browserUtils.isIE ? this.parentSelect : this.eventsArgs.element;

        eventSimulator.mouseup(elementForMouseupEvent, this.eventsArgs.options);

        if (browserUtils.isIE && this.clickCausesChange)
            this.parentSelect.selectedIndex = this.childIndex;

        const simulateInputEventOnValueChange = browserUtils.isFirefox || browserUtils.isSafari ||
                                               browserUtils.isChrome && browserUtils.version >= 53;

        const simulateChangeEventOnValueChange = simulateInputEventOnValueChange || browserUtils.isIE;

        if (simulateInputEventOnValueChange && this.clickCausesChange)
            eventSimulator.input(this.parentSelect);

        if (simulateChangeEventOnValueChange && this.clickCausesChange)
            eventSimulator.change(this.parentSelect);

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

        const moveArguments = this._getMoveArguments();

        this.eventsArgs = this._calculateEventArguments();

        if (styleUtils.getSelectElementSize(this.parentSelect) <= 1) {
            return this
                ._move(moveArguments)
                .then(() => this._click());
        }

        return this
            ._move(moveArguments)
            .then(() => this._mousedown())
            .then(() => this._mouseup())
            .then(() => this._click());
    }
}
