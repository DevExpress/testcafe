import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import { filter } from './array';


const styleUtils   = hammerhead.utils.style;
const browserUtils = hammerhead.utils.browser;

export const getBordersWidth      = hammerhead.utils.style.getBordersWidth;
export const getComputedStyle     = hammerhead.utils.style.getComputedStyle;
export const getElementMargin     = hammerhead.utils.style.getElementMargin;
export const getElementPadding    = hammerhead.utils.style.getElementPadding;
export const getElementScroll     = hammerhead.utils.style.getElementScroll;
export const getOptionHeight      = hammerhead.utils.style.getOptionHeight;
export const getSelectElementSize = hammerhead.utils.style.getSelectElementSize;
export const isElementVisible     = hammerhead.utils.style.isElementVisible;
export const isSelectVisibleChild = hammerhead.utils.style.isVisibleChild;
export const getWidth             = hammerhead.utils.style.getWidth;
export const getHeight            = hammerhead.utils.style.getHeight;
export const getInnerWidth        = hammerhead.utils.style.getInnerWidth;
export const getInnerHeight       = hammerhead.utils.style.getInnerHeight;
export const getScrollLeft        = hammerhead.utils.style.getScrollLeft;
export const getScrollTop         = hammerhead.utils.style.getScrollTop;
export const setScrollLeft        = hammerhead.utils.style.setScrollLeft;
export const setScrollTop         = hammerhead.utils.style.setScrollTop;
export const get                  = hammerhead.utils.style.get;

const SCROLLABLE_OVERFLOW_STYLE_RE               = /auto|scroll/i;
const DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE = 'visible';

const getScrollable = function (el) {
    const overflowX            = get(el, 'overflowX');
    const overflowY            = get(el, 'overflowY');
    let scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    let scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    // IE11 and MS Edge bug: There are two properties: overflow-x and overflow-y.
    // If one property is set so that the browser may show scrollbars (`auto` or `scroll`) and the second one is set to 'visible',
    // then the second one will work as if it had the 'auto' value.
    if (browserUtils.isIE) {
        scrollableHorizontally = scrollableHorizontally || scrollableVertically && overflowX === DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE;
        scrollableVertically   = scrollableVertically || scrollableHorizontally && overflowY === DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE;
    }

    return { scrollableHorizontally, scrollableVertically };
};

const isVisibilityHiddenNode = function (node) {
    node = domUtils.findParent(node, true, ancestor => {
        return domUtils.isElementNode(ancestor) && get(ancestor, 'visibility') === 'hidden';
    });

    return !!node;
};

const isHiddenNode = function (node) {
    node = domUtils.findParent(node, true, ancestor => {
        return domUtils.isElementNode(ancestor) && get(ancestor, 'display') === 'none';
    });

    return !!node;
};

export function isFixedElement (node) {
    return domUtils.isElementNode(node) && get(node, 'position') === 'fixed';
}

export function isNotVisibleNode (node) {
    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenNode(node);
}

export function getScrollableParents (element) {
    const parentsArray = domUtils.getParents(element);

    if (domUtils.isElementInIframe(element)) {
        const iFrameParents = domUtils.getParents(domUtils.getIframeByElement(element));

        parentsArray.concat(iFrameParents);
    }

    return filter(parentsArray, hasScroll);
}

function hasBodyScroll (el) {
    const overflowX              = get(el, 'overflowX');
    const overflowY              = get(el, 'overflowY');
    const scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    const scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    const documentElement = domUtils.findDocument(el).documentElement;

    let bodyScrollHeight = el.scrollHeight;

    if (browserUtils.isChrome || browserUtils.isFirefox) {
        const { top: bodyTop }     = el.getBoundingClientRect();
        const { top: documentTop } = documentElement.getBoundingClientRect();

        bodyScrollHeight = bodyScrollHeight - documentTop + bodyTop;
    }

    return (scrollableHorizontally || scrollableVertically) &&
           bodyScrollHeight > documentElement.scrollHeight;
}

function hasHTMLElementScroll (el) {
    const overflowX = get(el, 'overflowX');
    const overflowY = get(el, 'overflowY');
    //T174562 - wrong scrolling in iframes without src and others iframes
    const body      = el.getElementsByTagName('body')[0];

    //T303226
    if (overflowX === 'hidden' && overflowY === 'hidden')
        return false;

    const hasHorizontalScroll = el.scrollHeight > el.clientHeight;
    const hasVerticalScroll   = el.scrollWidth > el.clientWidth;

    if (hasHorizontalScroll || hasVerticalScroll)
        return true;

    if (body) {
        if (hasBodyScroll(body))
            return false;

        const clientWidth  = Math.min(el.clientWidth, body.clientWidth);
        const clientHeight = Math.min(el.clientHeight, body.clientHeight);

        return body.scrollHeight > clientHeight || body.scrollWidth > clientWidth;
    }

    return false;
}

export function hasScroll (el) {
    const { scrollableHorizontally, scrollableVertically } = getScrollable(el);

    if (domUtils.isBodyElement(el))
        return hasBodyScroll(el);

    if (domUtils.isHtmlElement(el))
        return hasHTMLElementScroll(el);

    if (!scrollableHorizontally && !scrollableVertically)
        return false;

    const hasVerticalScroll   = scrollableVertically && el.scrollHeight > el.clientHeight;
    const hasHorizontalScroll = scrollableHorizontally && el.scrollWidth > el.clientWidth;

    return hasHorizontalScroll || hasVerticalScroll;
}

export function hasDimensions (el) {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0);
}

export function set (el, style, value) {
    if (typeof style === 'string')
        styleUtils.set(el, style, value);

    for (const property in style) {
        if (style.hasOwnProperty(property))
            styleUtils.set(el, property, style[property]);
    }
}

function getViewportDimension (windowDimension, documentDimension, bodyDimension) {
    if (documentDimension > windowDimension)
        return bodyDimension;

    if (bodyDimension > windowDimension)
        return documentDimension;

    return Math.max(bodyDimension, documentDimension);
}

export function getViewportDimensions () {
    return {
        width:  getViewportDimension(window.innerWidth, document.documentElement.clientWidth, document.body.clientWidth),
        height: getViewportDimension(window.innerHeight, document.documentElement.clientHeight, document.body.clientHeight)
    };
}

