/* eslint-disable no-restricted-properties */
import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { getElementsBySelector } from './utils/get-elements-by-selector';

import * as descriptors from './descriptors';
import { elementPicker, ELEMENT_PICKED } from './element-picker';
import { highlighter } from './highlighter';
import {
    selectorsList,
    SELECTOR_SELECTED,
    LIST_CHANGED,
} from './selectors-list';

const nativeMethods = hammerhead.nativeMethods;
const shadowUI      = hammerhead.shadowUI;

const eventUtils = testCafeCore.eventUtils;

const ENABLED_CLASS = 'enabled';

const MATCH_INDICATOR_CLASSES = {
    notFound: 'not-found',
    invalid:  'invalid',
    ok:       'ok',
};

export class SelectorInputContainer {
    element;
    input;
    indicator;
    expandButton;

    constructor () {
        this._createElements();
        this._addEventListeners();
    }

    get value () {
        return nativeMethods.inputValueGetter.call(this.input);
    }

    set value (value) {
        nativeMethods.inputValueSetter.call(this.input, value);
    }

    _createElements () {
        this.element      = createElementFromDescriptor(descriptors.selectorInputContainer);
        this.input        = createElementFromDescriptor(descriptors.selectorInput);
        this.indicator    = createElementFromDescriptor(descriptors.matchIndicator);
        this.expandButton = createElementFromDescriptor(descriptors.expandSelectorsList);

        this.element.appendChild(this.input);
        this.element.appendChild(this.indicator);
        this.element.appendChild(this.expandButton);
    }

    _addEventListeners () {
        eventUtils.bind(this.expandButton, 'click', () => this._expandSelectorsList());
        eventUtils.bind(this.input, 'input', () => this._onSelectorTyped());
        eventUtils.bind(this.input, 'focus', () => this._onFocusInput());
        eventUtils.bind(this.input, 'blur', () => highlighter.stopHighlighting());

        selectorsList.on(LIST_CHANGED, selectors => {
            this._updateExpandButton(selectors);
        });

        selectorsList.on(SELECTOR_SELECTED, value => {
            this._setSelectorInputValue({ value });
        });

        elementPicker.on(ELEMENT_PICKED, selectors => {
            this._setSelectorInputValue(selectors[0]);
        });
    }

    _setMatchIndicatorText (text) {
        nativeMethods.nodeTextContentSetter.call(this.indicator, text);
    }

    _setMatchIndicatorClass (value) {
        for (const key in MATCH_INDICATOR_CLASSES)
            shadowUI.removeClass(this.indicator, MATCH_INDICATOR_CLASSES[key]);

        shadowUI.addClass(this.indicator, value);
    }

    _indicateMatches (elements) {
        if (elements === null) {
            this._setMatchIndicatorText('Invalid Selector');
            this._setMatchIndicatorClass(MATCH_INDICATOR_CLASSES.invalid);

            return;
        }

        if (elements.length === 0) {
            this._setMatchIndicatorText('No Matching Elements');
            this._setMatchIndicatorClass(MATCH_INDICATOR_CLASSES.notFound);

            return;
        }

        this._setMatchIndicatorText(`Found: ${elements.length}`);
        this._setMatchIndicatorClass(MATCH_INDICATOR_CLASSES.ok);
    }

    _highlightElements (elements) {
        for (const element of elements)
            highlighter.highlight(element);
    }

    _setSelectorInputValue (selector) {
        this.value = selector.value;

        this.input.focus();
    }

    _expandSelectorsList () {
        const { left, top, width } = this.element.getBoundingClientRect();
        const { clientHeight }     = document.documentElement;


        const result = {
            left,
            width,

            bottom: clientHeight - top + 1,
        };

        selectorsList.show(result);
    }

    _updateExpandButton (selectors) {
        if (selectors && selectors.length)
            shadowUI.addClass(this.expandButton, ENABLED_CLASS);
        else
            shadowUI.removeClass(this.expandButton, ENABLED_CLASS);
    }

    _onSelectorTyped () {
        selectorsList.clear();

        this._onFocusInput();
    }

    async _onFocusInput () {
        highlighter.stopHighlighting();

        if (!this.value) {
            this._indicateMatches([]);

            return;
        }

        const elements = await getElementsBySelector(this.value);

        this._indicateMatches(elements);
        this._highlightElements(elements);
    }
}
