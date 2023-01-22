/* eslint-disable no-restricted-properties */
import uiRoot from '../../ui-root';

export function addToUiRoot (element) {
    if (!element.parentElement) {
        const panelsContainer = uiRoot.panelsContainer();

        uiRoot.element().insertBefore(element, panelsContainer);
    }
}

export function removeFromUiRoot (element) {
    if (element.parentElement)
        uiRoot.element().removeChild(element);
}

export function getChildren () {
    return uiRoot.element().children;
}
