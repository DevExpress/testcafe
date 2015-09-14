import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import { filter, some } from './array';


var styleUtils = hammerhead.utils.style;


export function isNotVisibleNode (node) {
    var isHiddenNode = function (node) {
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

        var ancestors = getAncestorsAndSelf(node);

        return some(ancestors, ancestor => ancestor.nodeType === 1 && get(ancestor, 'display') === "none");
    };

    var isVisibilityHiddenTextNode = function (textNode) {
        var el = textNode.nodeType === 3 ? textNode.parentNode : null;

        return el && get(el, "visibility") === "hidden";
    };

    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenTextNode(node);
}

export function getScrollableParents (el, doc) {
    var parentsArray = domUtils.getParents(el);

    if (domUtils.isElementInIframe(el)) {
        var iFrameParents = domUtils.getParents(domUtils.getIframeByElement(el));

        parentsArray.concat(iFrameParents);
    }

    return filter(parentsArray, el => el.tagName.toLowerCase() !== 'body' && hasScroll(el));
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

    var hasScroll = ((scrollableVertically || isHtmlElement) && el.scrollHeight > el.clientHeight) ||
                    ((scrollableHorizontally || isHtmlElement) && el.scrollWidth > el.clientWidth);

    if (hasScroll)
        return hasScroll;

    //T174562 - wrong scrolling in iframes without src and others iframes
    if (isHtmlElement && body)
        return body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth;
}

export function hasDimensions (el) {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0)
}

export function isElementHidden (el) {
    //NOTE: it's like jquery ':hidden' selector
    if (get(el, 'display') === 'none' || !hasDimensions(el) || (el.type && el.type === 'hidden'))
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

export var getBordersWidth      = hammerhead.utils.style.getBordersWidth;
export var getElementMargin     = hammerhead.utils.style.getElementMargin;
export var getElementPadding    = hammerhead.utils.style.getElementPadding;
export var getElementScroll     = hammerhead.utils.style.getElementScroll;
export var getOptionHeight      = hammerhead.utils.style.getOptionHeight;
export var getSelectElementSize = hammerhead.utils.style.getSelectElementSize;
export var isVisibleChild       = hammerhead.utils.style.isVisibleChild;
export var getWidth             = hammerhead.utils.style.getWidth;
export var getHeight            = hammerhead.utils.style.getHeight;
export var getInnerWidth        = hammerhead.utils.style.getInnerWidth;
export var getInnerHeight       = hammerhead.utils.style.getInnerHeight;
export var getScrollLeft        = hammerhead.utils.style.getScrollLeft;
export var getScrollTop         = hammerhead.utils.style.getScrollTop;
export var setScrollLeft        = hammerhead.utils.style.setScrollLeft;
export var setScrollTop         = hammerhead.utils.style.setScrollTop;
export var get                  = hammerhead.utils.style.get;
