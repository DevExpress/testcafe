import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import { filter, some } from './array';


var styleUtils = hammerhead.utils.style;

export var getBordersWidth      = hammerhead.utils.style.getBordersWidth;
export var getComputedStyle     = hammerhead.utils.style.getComputedStyle;
export var getElementMargin     = hammerhead.utils.style.getElementMargin;
export var getElementPadding    = hammerhead.utils.style.getElementPadding;
export var getElementScroll     = hammerhead.utils.style.getElementScroll;
export var getOptionHeight      = hammerhead.utils.style.getOptionHeight;
export var getSelectElementSize = hammerhead.utils.style.getSelectElementSize;
export var isSelectVisibleChild = hammerhead.utils.style.isVisibleChild;
export var getWidth             = hammerhead.utils.style.getWidth;
export var getHeight            = hammerhead.utils.style.getHeight;
export var getInnerWidth        = hammerhead.utils.style.getInnerWidth;
export var getInnerHeight       = hammerhead.utils.style.getInnerHeight;
export var getScrollLeft        = hammerhead.utils.style.getScrollLeft;
export var getScrollTop         = hammerhead.utils.style.getScrollTop;
export var setScrollLeft        = hammerhead.utils.style.setScrollLeft;
export var setScrollTop         = hammerhead.utils.style.setScrollTop;
export var get                  = hammerhead.utils.style.get;

var getAncestors = function (node) {
    var ancestors = [];

    while (node.parentNode) {
        ancestors.unshift(node.parentNode);
        node = node.parentNode;
    }

    return ancestors;
};

var getAncestorsAndSelf = function (node) {
    return getAncestors(node).concat([node]);
};

var isVisibilityHiddenTextNode = function (textNode) {
    var el = domUtils.isTextNode(textNode) ? textNode.parentNode : null;

    return el && get(el, 'visibility') === 'hidden';
};

var isHiddenNode = function (node) {
    var ancestors = getAncestorsAndSelf(node);

    return some(ancestors, ancestor => domUtils.isElementNode(ancestor) && get(ancestor, 'display') === 'none');
};

export function isNotVisibleNode (node) {
    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenTextNode(node);
}

export function getScrollableParents (element) {
    var parentsArray = domUtils.getParents(element);

    if (domUtils.isElementInIframe(element)) {
        var iFrameParents = domUtils.getParents(domUtils.getIframeByElement(element));

        parentsArray.concat(iFrameParents);
    }

    return filter(parentsArray, el => !domUtils.isBodyElement(el) && hasScroll(el));
}

export function hasScroll (el) {
    var scrollRegEx            = /auto|scroll/i;
    var overflowX              = get(el, 'overflowX');
    var overflowY              = get(el, 'overflowY');
    var scrollableHorizontally = scrollRegEx.test(overflowX);
    var scrollableVertically   = scrollRegEx.test(overflowY);
    var isHtmlElement          = /html/i.test(el.tagName);
    var body                   = isHtmlElement ? el.getElementsByTagName('body')[0] : null;

    //T303226
    if (isHtmlElement && overflowX === 'hidden' && overflowY === 'hidden')
        return false;

    if (!isHtmlElement && !scrollableHorizontally && !scrollableVertically)
        return false;

    var hasHorizontalScroll = (scrollableVertically || isHtmlElement) && el.scrollHeight > el.clientHeight;
    var hasVerticalScroll = (scrollableHorizontally || isHtmlElement) && el.scrollWidth > el.clientWidth;

    if (hasHorizontalScroll || hasVerticalScroll)
        return true;

    //T174562 - wrong scrolling in iframes without src and others iframes
    if (isHtmlElement && body) {
        var clientWidth  = Math.min(el.clientWidth, body.clientWidth);
        var clientHeight = Math.min(el.clientHeight, body.clientHeight);

        return body.scrollHeight > clientHeight || body.scrollWidth > clientWidth;
    }

    return false;
}

export function hasDimensions (el) {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0);
}

export function isElementHidden (el) {
    //NOTE: it's like jquery ':hidden' selector
    if (get(el, 'display') === 'none' || !hasDimensions(el) || el.type && el.type === 'hidden')
        return true;

    var elements       = domUtils.findDocument(el).querySelectorAll('*');
    var hiddenElements = [];

    for (var i = 0; i < elements.length; i++) {
        if (get(elements[i], 'display') === 'none' || !hasDimensions(elements[i]))
            hiddenElements.push(elements[i]);
    }

    return domUtils.containsElement(hiddenElements, el);
}

export function set (el, style, value) {
    if (typeof style === 'string')
        styleUtils.set(el, style, value);

    for (var property in style) {
        if (style.hasOwnProperty(property))
            styleUtils.set(el, property, style[property]);
    }
}

