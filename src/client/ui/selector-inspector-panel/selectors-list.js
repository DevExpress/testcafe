/* eslint-disable no-restricted-properties */
import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { addToUiRoot, removeFromUiRoot } from './utils/ui-root';
import { setStyles } from './utils/set-styles';

import * as descriptors from './descriptors';
import { elementPicker, ELEMENT_PICKED } from './element-picker';

const listeners = hammerhead.eventSandbox.listeners;

const serviceUtils = testCafeCore.serviceUtils;

export const LIST_CHANGED      = 'list-changed';
export const SELECTOR_SELECTED = 'selector-selected';

class SelectorsList extends serviceUtils.EventEmitter {
    _pickedSelectors = [];
    renderedSelectors;
    element;

    constructor () {
        super();

        this.element = createElementFromDescriptor(descriptors.selectorsList);

        elementPicker.on(ELEMENT_PICKED, selectors => {
            this.pickedSelectors = selectors;
        });
    }

    get pickedSelectors () {
        return this._pickedSelectors;
    }

    set pickedSelectors (selectors = []) {
        if (this._pickedSelectors === selectors)
            return;

        this._pickedSelectors = selectors;

        this.emit(LIST_CHANGED, selectors);
    }

    _renderSelectors () {
        this.pickedSelectors.forEach(selector => {
            const el = createElementFromDescriptor({
                text:  selector.value,
                class: 'selector-value',
            });

            this.element.appendChild(el);
        });

        this.renderedSelectors = this.pickedSelectors;
    }

    _clear () {
        while (this.element.firstChild)
            this.element.removeChild(this.element.firstChild);

        this.renderedSelectors = null;
    }

    _addClickListener () {
        const onClick = event => {
            removeFromUiRoot(this.element);

            if (event.target.parentElement === this.element)
                this.emit(SELECTOR_SELECTED, event.target.innerText);

            listeners.removeInternalEventBeforeListener(window, ['click'], onClick);
        };

        listeners.addFirstInternalEventBeforeListener(window, ['click'], onClick);
    }

    show ({ left, bottom, width }) {
        if (!this.pickedSelectors || this.pickedSelectors.length === 0)
            return;

        if (this.pickedSelectors !== this.renderedSelectors) {
            this._clear();
            this._renderSelectors();
        }

        const styles = {
            left:   left + 'px',
            bottom: bottom + 'px',
            width:  width + 'px',
        };

        addToUiRoot(this.element);
        setStyles(this.element, styles);

        this._addClickListener();
    }

    clear () {
        this.pickedSelectors = null;
    }
}

export const selectorsList = new SelectorsList();
