import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import { focusByRelatedElement, getElementBoundToLabel } from '../../utils/utils';

const browserUtils   = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners      = hammerhead.eventSandbox.listeners;

const domUtils   = testCafeCore.domUtils;
const styleUtils = testCafeCore.styleUtils;

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

        this.label = this.eventArgs.element;
        this.input = getElementBoundToLabel(this.eventArgs.element);
    }

    run () {
        let focusRaised = false;

        const ensureFocusRaised = e => {
            focusRaised = e.target === this.input;
        };

        listeners.addInternalEventListener(window, ['focus'], ensureFocusRaised);

        super.run();

        listeners.removeInternalEventListener(window, ['focus'], ensureFocusRaised);

        if (domUtils.isElementFocusable(this.label) && !focusRaised)
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
            if (selectElementUI.isOptionListExpanded(element))
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

        listeners.addInternalEventListener(window, ['change'], onChange);

        super.run();

        listeners.removeInternalEventListener(window, ['change'], onChange);

        if (browserUtils.isChrome && !changed)
            this._ensureCheckboxStateChanged();
    }

    _ensureCheckboxStateChanged () {
        this.checkbox.checked = !this.checkbox.checked;

        eventSimulator.change(this.checkbox);
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


