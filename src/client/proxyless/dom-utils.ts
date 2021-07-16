import nativeMethods from './native-methods';


// NOTE: save this classes in hammerhead and local native methods
const HTMLOptionElement = window.HTMLOptionElement;
const ShadowRoot        = window.ShadowRoot;
const Text              = window.Text;

export function isShadowRoot (root: unknown): root is ShadowRoot {
    return root instanceof ShadowRoot;
}

export function isDomElement (el: unknown): el is Element {
    return el instanceof nativeMethods.elementClass;
}

export function isTextNode (node: unknown): node is Text {
    return node instanceof Text;
}

export function isOptionElement (el: unknown): el is HTMLOptionElement {
    return el instanceof HTMLOptionElement;
}

export function getTagName (el: Element): string {
    // NOTE: Check for tagName being a string, because it may be a function in an Angular app (T175340).
    return el && typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
}

export function getActiveElement (): Element {
    let activeElement = document.activeElement || document.body; // eslint-disable-line no-restricted-properties

    while (activeElement.shadowRoot?.activeElement) // eslint-disable-line no-restricted-properties
        activeElement = activeElement.shadowRoot.activeElement; // eslint-disable-line no-restricted-properties

    return activeElement;
}

function getSelectParent (el: Element): Element | null {
    const parent = el.parentNode; // eslint-disable-line no-restricted-properties

    return parent && nativeMethods.closest.call(parent, 'select');
}

export function isOptionElementVisible (el: HTMLOptionElement): boolean {
    const parentSelect = getSelectParent(el);

    if (!parentSelect)
        return true;

    // const expanded        = isOptionListExpanded(parentSelect);
    // const selectSizeValue = styleUtils.getSelectElementSize(parentSelect);
    //
    // return expanded || selectSizeValue > 1;

    return false;
}

export function isElementVisible (/*el: any*/): boolean {
    return true;

    // if (domUtils.isTextNode(el))
    //     return !styleUtils.isNotVisibleNode(el);
    //
    // const elementRectangle = getElementRectangle(el);
    //
    // if (!domUtils.isContentEditableElement(el)) {
    //     if (elementRectangle.width === 0 || elementRectangle.height === 0)
    //         return false;
    // }
    //
    // if (domUtils.isMapElement(el)) {
    //     const mapContainer = domUtils.getMapContainer(domUtils.closest(el, 'map'));
    //
    //     return mapContainer ? isElementVisible(mapContainer) : false;
    // }
    //
    // if (styleUtils.isSelectVisibleChild(el)) {
    //     const select              = domUtils.getSelectParent(el);
    //     const childRealIndex      = domUtils.getChildVisibleIndex(select, el);
    //     const realSelectSizeValue = styleUtils.getSelectElementSize(select);
    //     const topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
    //     const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
    //     const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);
    //
    //     return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    // }
    //
    // if (domUtils.isSVGElement(el))
    //     return styleUtils.get(el, 'visibility') !== 'hidden' && styleUtils.get(el, 'display') !== 'none';
    //
    // return styleUtils.hasDimensions(el) && styleUtils.get(el, 'visibility') !== 'hidden';
}
