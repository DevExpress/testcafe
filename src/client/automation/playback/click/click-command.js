import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import { focusByRelatedElement, getElementBoundToLabel } from '../../utils/utils';

const browserUtils   = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners      = hammerhead.eventSandbox.listeners;
const nativeMethods  = hammerhead.nativeMethods;

const domUtils         = testCafeCore.domUtils;
const styleUtils       = testCafeCore.styleUtils;
const selectController = testCafeCore.selectController;

const selectElementUI = testCafeUI.selectElement;

class ElementClickCommand {
    constructor (eventState, eventArgs) {
        this.eventState = eventState;
        this.eventArgs  = eventArgs;
    }

    run () {
        if (this.eventState.clickElement)
            eventSimulator.click(this.eventState.clickElement, this.eventArgs.options);

        if (!domUtils.isElementFocusable(this.eventArgs.element))
            focusByRelatedElement(this.eventArgs.element);
    }
}

class LabelElementClickCommand extends ElementClickCommand {
    constructor (eventState, eventArgs) {
        super(eventState, eventArgs);

        this.targetElement = this.eventArgs.element;
        this.input         = getElementBoundToLabel(this.eventArgs.element);
    }

    run () {
        let focusRaised = false;

        const ensureFocusRaised = e => {
            focusRaised = nativeMethods.eventTargetGetter.call(e) === this.input;
        };

        listeners.addInternalEventBeforeListener(window, ['focus'], ensureFocusRaised);

        super.run();

        listeners.removeInternalEventBeforeListener(window, ['focus'], ensureFocusRaised);

        if (domUtils.isElementFocusable(this.targetElement) && !focusRaised)
            this._ensureBoundElementFocusRaised();
    }

    _ensureBoundElementFocusRaised () {
        eventSimulator.focus(this.input);
    }
}

class SelectElementClickCommand extends ElementClickCommand {
    constructor (eventState, eventArgs) {
        super(eventState, eventArgs);
    }

    run () {
        super.run();

        this._toggleSelectOptionList();
    }

    _toggleSelectOptionList () {
        // NOTE: Emulating the click event on the 'select' element doesn't expand the
        // dropdown with options (except chrome), therefore we should emulate it.
        const element              = this.eventArgs.element;
        const isSelectWithDropDown = styleUtils.getSelectElementSize(element) === 1;

        if (isSelectWithDropDown && this.eventState.simulateDefaultBehavior !== false) {
            if (selectController.isOptionListExpanded(element))
                selectElementUI.collapseOptionList();
            else
                selectElementUI.expandOptionList(element);
        }
    }
}

class OptionElementClickCommand extends ElementClickCommand {
    constructor (eventState, eventArgs) {
        super(eventState, eventArgs);
    }

    run () {
        return this.eventArgs.element;
    }
}

class LabelledCheckboxElementClickCommand extends LabelElementClickCommand {
    constructor (eventState, eventArgs) {
        super(eventState, eventArgs);

        this.checkbox = this.input;
    }

    run () {
        let changed = false;

        const onChange = () => {
            changed = true;
        };

        listeners.addInternalEventBeforeListener(window, ['change'], onChange);

        super.run();

        listeners.removeInternalEventBeforeListener(window, ['change'], onChange);

        // NOTE: Two overlapping issues: https://github.com/DevExpress/testcafe/issues/3348 and https://github.com/DevExpress/testcafe/issues/6949
        // When label contains <a href=any> or <button> element, clicking these elements should prevent checkbox from changing checked state.
        // Also, checkbox state should not be changed if it is disabled.
        // We should to leave the code for fixing .focus issue and add additional check for the clickable elements inside the label:
        if (browserUtils.isChrome && !changed && !this.checkbox.disabled && !this._isClickableElementInsideLabel(this.targetElement))
            this._ensureCheckboxStateChanged();
    }

    _ensureCheckboxStateChanged () {
        this.checkbox.checked = !this.checkbox.checked;

        eventSimulator.change(this.checkbox);
    }

    _isClickableElementInsideLabel (element) {
        const isClickableLink = domUtils.isAnchorElement(element) && element.getAttribute('href');
        const isButton        = domUtils.isButtonElement(element);

        return isClickableLink || isButton;
    }
}

export default function (eventState, eventArgs) {
    const elementBoundToLabel = getElementBoundToLabel(eventArgs.element);
    const isSelectElement     = domUtils.isSelectElement(eventArgs.element);
    const isOptionElement     = domUtils.isOptionElement(eventArgs.element);
    const isLabelElement      = domUtils.isLabelElement(eventArgs.element) && elementBoundToLabel;
    const isLabelledCheckbox  = elementBoundToLabel && domUtils.isCheckboxElement(elementBoundToLabel);

    if (isSelectElement)
        return new SelectElementClickCommand(eventState, eventArgs);

    if (isOptionElement)
        return new OptionElementClickCommand(eventState, eventArgs);

    if (isLabelledCheckbox)
        return new LabelledCheckboxElementClickCommand(eventState, eventArgs);

    if (isLabelElement)
        return new LabelElementClickCommand(eventState, eventArgs);

    return new ElementClickCommand(eventState, eventArgs);
}
