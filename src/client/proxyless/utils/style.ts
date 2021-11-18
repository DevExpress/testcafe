import * as domUtils from './dom';
import nativeMethods from '../native-methods';
import { BoundaryValuesData } from '../../../shared/utils/values/boundary-values';
import { LeftTopValues } from '../../../shared/utils/values/axis-values';


// NOTE: For Chrome.
const MIN_SELECT_SIZE_VALUE = 4;

export function get (el: Element | Document, property: keyof CSSStyleDeclaration): string | null {
    el = 'documentElement' in el ? el.documentElement : el;

    const computedStyle = getComputedStyle(el);

    return computedStyle && computedStyle[property] as string | null;
}

export function getBordersWidth (el: Element): BoundaryValuesData {
    return {
        bottom: getIntValue(get(el, 'borderBottomWidth')),
        left:   getIntValue(get(el, 'borderLeftWidth')),
        right:  getIntValue(get(el, 'borderRightWidth')),
        top:    getIntValue(get(el, 'borderTopWidth')),
    };
}

export function isOptionElementVisible (el: HTMLOptionElement): boolean {
    const parentSelect = domUtils.getSelectParent(el);

    if (!parentSelect)
        return true;

    const selectSizeValue = getSelectElementSize(parentSelect);

    return selectSizeValue > 1;
}

export function isSelectVisibleChild (el: Node): el is HTMLElement {
    const select  = domUtils.getSelectParent(el);
    const tagName = domUtils.getTagName(el as Element);

    return domUtils.isSelectElement(select) && getSelectElementSize(select) > 1 &&
        (tagName === 'option' || tagName === 'optgroup');
}

export function getScrollLeft (el: Window | Document | Element | null): number {
    if (!el)
        return 0;

    if (domUtils.isWindow(el))
        return el.pageXOffset;

    if (domUtils.isDocument(el))
        return el.defaultView?.pageXOffset || 0;

    return el.scrollLeft;
}

export function getScrollTop (el: Window | Document | Element | null): number {
    if (!el)
        return 0;

    if (domUtils.isWindow(el))
        return el.pageYOffset;

    if (domUtils.isDocument(el))
        return el.defaultView?.pageYOffset || 0;

    return el.scrollTop;
}

export function getElementScroll (el: Window | Document | Element): LeftTopValues<number> {
    let targetEl = el;

    if (domUtils.isHtmlElement(el)) {
        targetEl = window;

        if (domUtils.isElementInIframe(el)) {
            const currentIframe = domUtils.getIframeByElement(el);

            if (currentIframe)
                targetEl = nativeMethods.contentWindowGetter.call(currentIframe) || window;
        }
    }

    return {
        left: getScrollLeft(targetEl),
        top:  getScrollTop(targetEl),
    };
}

function getIntValue (value: string | null): number {
    value = value || '';

    const parsedValue = parseInt(value.replace('px', ''), 10);

    return isNaN(parsedValue) ? 0 : parsedValue;
}

export function getElementPadding (el: Element): BoundaryValuesData {
    return {
        bottom: getIntValue(get(el, 'paddingBottom')),
        left:   getIntValue(get(el, 'paddingLeft')),
        right:  getIntValue(get(el, 'paddingRight')),
        top:    getIntValue(get(el, 'paddingTop')),
    };
}

function getHeight (el: HTMLElement | Window | Document | null): number {
    if (!el)
        return 0;

    if (domUtils.isWindow(el))
        return el.document.documentElement.clientHeight;

    if (domUtils.isDocument(el)) {
        const doc        = el.documentElement;
        const clientProp = 'clientHeight';
        const scrollProp = 'scrollHeight';
        const offsetProp = 'offsetHeight';

        if (doc[clientProp] >= doc[scrollProp])
            return doc[clientProp];

        return Math.max(
            el.body[scrollProp], doc[scrollProp],
            el.body[offsetProp], doc[offsetProp]
        );
    }

    let value = el.offsetHeight;

    value -= getIntValue(get(el, 'paddingTop'));
    value -= getIntValue(get(el, 'paddingBottom'));
    value -= getIntValue(get(el, 'borderTopWidth'));
    value -= getIntValue(get(el, 'borderBottomWidth'));

    return value;
}

export function getOptionHeight (select: HTMLSelectElement): number {
    const realSizeValue      = getSelectElementSize(select);
    const selectPadding      = getElementPadding(select);
    const selectScrollHeight = select.scrollHeight - (selectPadding.top + selectPadding.bottom);
    const childrenCount      = domUtils.getSelectVisibleChildren(select).length;

    if (realSizeValue === 1)
        return getHeight(select);

    return Math.round(selectScrollHeight / Math.max(childrenCount, realSizeValue));
}

export function getSelectElementSize (select: HTMLSelectElement): number {
    const sizeAttr     = nativeMethods.getAttribute.call(select, 'size');
    const multipleAttr = nativeMethods.getAttribute.call(select, 'multiple');
    let size           = !sizeAttr ? 1 : parseInt(sizeAttr, 10);

    if (multipleAttr && (!sizeAttr || size < 1))
        size = MIN_SELECT_SIZE_VALUE;

    return size;
}

export function getInnerWidth (el: Element | Window | Document | null): number {
    if (!el)
        return 0;

    if (domUtils.isWindow(el))
        return el.document.documentElement.clientWidth;

    if (domUtils.isDocument(el))
        return el.documentElement.clientWidth;

    let value = (el as HTMLElement).offsetWidth;

    value -= getIntValue(get(el, 'borderLeftWidth'));
    value -= getIntValue(get(el, 'borderRightWidth'));

    return value;
}

export function getInnerHeight (el: Element | Window | Document | null): number {
    if (!el)
        return 0;

    if (domUtils.isWindow(el))
        return el.document.documentElement.clientHeight;

    if (domUtils.isDocument(el))
        return el.documentElement.clientHeight;

    let value = (el as HTMLElement).offsetHeight;

    value -= getIntValue(get(el, 'borderTopWidth'));
    value -= getIntValue(get(el, 'borderBottomWidth'));

    return value;
}

export function getOffset (el: Element | Document | Window | null): LeftTopValues<number> | null {
    if (!el || domUtils.isWindow(el) || domUtils.isDocument(el))
        return null;

    let clientRect = el.getBoundingClientRect();

    // NOTE: A detached node or documentElement.
    const doc        = el.ownerDocument;
    const docElement = doc.documentElement;

    if (!docElement.contains(el) || el === docElement) {
        return {
            top:  clientRect.top,
            left: clientRect.left,
        };
    }

    const win        = doc.defaultView as Window;
    const clientTop  = docElement.clientTop || doc.body.clientTop || 0;
    const clientLeft = docElement.clientLeft || doc.body.clientLeft || 0;
    const scrollTop  = win.pageYOffset || docElement.scrollTop || doc.body.scrollTop;
    const scrollLeft = win.pageXOffset || docElement.scrollLeft || doc.body.scrollLeft;

    clientRect = el.getBoundingClientRect();

    return {
        top:  clientRect.top + scrollTop - clientTop,
        left: clientRect.left + scrollLeft - clientLeft,
    };
}

export function setScrollLeft (el: Element | Document | Window, value: number): void {
    if (!el)
        return;

    if (domUtils.isDocument(el))
        el = el.defaultView as Window;

    if (domUtils.isWindow(el)) {
        const scrollTop = getScrollTop(el);

        nativeMethods.scrollTo.call(el, value, scrollTop);
    }
    else
        el.scrollLeft = value;
}

export function setScrollTop (el: Element | Document | Window, value: number): void {
    if (!el)
        return;

    if (domUtils.isDocument(el))
        el = el.defaultView as Window;

    if (domUtils.isWindow(el)) {
        const scrollLeft = getScrollLeft(el);

        nativeMethods.scrollTo.call(el, scrollLeft, value);
    }
    else
        el.scrollTop = value;
}
