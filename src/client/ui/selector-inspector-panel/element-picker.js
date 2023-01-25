import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';

import { getChildren } from './utils/ui-root';

import { selectorGenerator } from './selector-generator';
import { highlighter } from './highlighter';
import { tooltip } from './tooltip';

const listeners = hammerhead.eventSandbox.listeners;

const styleUtils   = testCafeCore.styleUtils;
const serviceUtils = testCafeCore.serviceUtils;

export const ELEMENT_PICKED = 'element-piked';

class ElementPicker extends serviceUtils.EventEmitter {
    actualSelectors;
    actualTarget;
    hiddenTestCafeElements = new Map();
    handlers;

    constructor () {
        super();

        this.handlers = {
            onClick:     this._getClickHandler(),
            onMouseMove: this._getMouseMoveHandler(),
        };
    }

    _hideTestCafeElements () {
        const children = getChildren();

        for (const element of children) {
            const visibilityValue = styleUtils.get(element, 'visibility');

            this.hiddenTestCafeElements.set(element, visibilityValue);

            styleUtils.set(element, 'visibility', 'hidden');
        }
    }

    _showTestCafeElements () {
        this.hiddenTestCafeElements.forEach((visibilityValue, element) => {
            styleUtils.set(element, 'visibility', visibilityValue);
        });

        this.hiddenTestCafeElements.clear();
    }

    _getClickHandler () {
        return () => {
            this._showTestCafeElements();

            listeners.removeInternalEventBeforeListener(window, ['mousemove'], this.handlers.onMouseMove);
            listeners.removeInternalEventBeforeListener(window, ['click'], this.handlers.onClick);

            this.emit(ELEMENT_PICKED, this.actualSelectors);

            tooltip.hide();
        };
    }

    _getMouseMoveHandler () {
        return event => {
            const x = event.clientX;
            const y = event.clientY;

            const target = document.elementFromPoint(x, y);

            if (!target || target === this.actualTarget)
                return;

            this.actualTarget    = target;
            this.actualSelectors = selectorGenerator.generate(target);

            highlighter.stopHighlighting();
            highlighter.highlight(target);

            // eslint-disable-next-line no-restricted-properties
            tooltip.show(this.actualSelectors[0].value, target);
        };
    }

    start (startEvent) {
        this._hideTestCafeElements();

        listeners.initElementListening(window, ['mousemove', 'click']);
        listeners.addFirstInternalEventBeforeListener(window, ['mousemove'], this.handlers.onMouseMove);
        listeners.addFirstInternalEventBeforeListener(window, ['click'], this.handlers.onClick);

        this.handlers.onMouseMove(startEvent);
    }
}

export const elementPicker = new ElementPicker();
