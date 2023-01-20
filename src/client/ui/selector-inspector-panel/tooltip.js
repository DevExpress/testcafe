/* eslint-disable no-restricted-properties */
import hammerhead from './../deps/hammerhead';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { addToUiRoot, removeFromUiRoot } from './utils/ui-root';
import { setStyles } from './utils/set-styles';

import * as descriptors from './descriptors';

const nativeMethods = hammerhead.nativeMethods;

const ARROW_OFFSET_LEFT = 12;

function getViewportRect () {
    return {
        width:  document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
    };
}

class Tooltip {
    tooltip;
    arrow;

    constructor () {
        this._createElements();
    }

    _createElements () {
        this.tooltip = createElementFromDescriptor(descriptors.tooltip);
        this.arrow   = createElementFromDescriptor(descriptors.arrow);
    }

    _setTooltipText (selector) {
        nativeMethods.nodeTextContentSetter.call(this.tooltip, selector);
    }

    _getTooltipLeft (tooltipWidth, targetLeft, viewportWidth, scrollLeft) {
        if (tooltipWidth >= viewportWidth)
            return scrollLeft;

        if (tooltipWidth >= viewportWidth - targetLeft)
            return viewportWidth + scrollLeft - tooltipWidth;

        return targetLeft + scrollLeft;
    }

    _getArrowLeft (arrowWidth, targetLeft, viewportWidth, scrollLeft) {
        if (arrowWidth + ARROW_OFFSET_LEFT >= viewportWidth - targetLeft)
            return viewportWidth + scrollLeft - arrowWidth;

        return targetLeft + scrollLeft + ARROW_OFFSET_LEFT;
    }

    _getVerticalPostionStyles (tooltipRect, arrowRect, targetRect, viewportRect) {
        const tooltip = {};
        const arrow   = {};

        const scrollTop      = document.documentElement.scrollTop;
        const elementsHeight = tooltipRect.height + arrowRect.height;

        if (targetRect.top >= elementsHeight) {
            tooltip.top      = targetRect.top + scrollTop - elementsHeight + 'px';
            arrow.top        = targetRect.top + scrollTop - arrowRect.height + 'px';
            arrow.transform  = 'none';
            arrow.visibility = 'visible';
        }
        else if (viewportRect.height - targetRect.bottom >= elementsHeight) {
            tooltip.top      = targetRect.bottom + scrollTop + arrowRect.height + 'px';
            arrow.top        = targetRect.bottom + scrollTop + 'px';
            arrow.transform  = 'rotate(180deg)';
            arrow.visibility = 'visible';
        }
        else {
            tooltip.top      = viewportRect.height + scrollTop - tooltipRect.height + 'px';
            arrow.top        = scrollTop + 'px';
            arrow.transform  = 'node';
            arrow.visibility = 'hidden';
        }

        return { tooltip, arrow };
    }

    _getElementsStyles (target) {
        const tooltipRect  = this.tooltip.getBoundingClientRect();
        const arrowRect    = this.arrow.getBoundingClientRect();
        const targetRect   = target.getBoundingClientRect();
        const viewportRect = getViewportRect();

        const styles = this._getVerticalPostionStyles(tooltipRect, arrowRect, targetRect, viewportRect);

        const scrollLeft = document.documentElement.scrollLeft;

        styles.tooltip.left = this._getTooltipLeft(tooltipRect.width, targetRect.left, viewportRect.width, scrollLeft) + 'px';
        styles.arrow.left   = this._getArrowLeft(arrowRect.width, targetRect.left, viewportRect.width, scrollLeft) + 'px';

        return styles;
    }

    _placeElements (target) {
        const styles = this._getElementsStyles(target);

        setStyles(this.tooltip, styles.tooltip);
        setStyles(this.arrow, styles.arrow);
    }

    show (selector, target) {
        this._setTooltipText(selector);
        this._placeElements(target);

        addToUiRoot(this.tooltip);
        addToUiRoot(this.arrow);
    }

    hide () {
        removeFromUiRoot(this.tooltip);
        removeFromUiRoot(this.arrow);
    }
}

export const tooltip = new Tooltip();
