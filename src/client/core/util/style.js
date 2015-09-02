import * as hammerheadAPI from '../deps/hammerhead';
import $ from '../deps/jquery';
import * as domUtils from './dom';


var hhStyleUtils = hammerheadAPI.Util.Style;

export function getCssStyleValue (el, property, doc) {
    doc = doc || domUtils.findDocument(el);

    var computedStyle = el.currentStyle;

    if (doc.defaultView && doc.defaultView.getComputedStyle)
        computedStyle = doc.defaultView.getComputedStyle(el, null);

    return computedStyle ? computedStyle.getPropertyValue(property) : null;
}

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
        var isHidden  = false;

        $.each(ancestors, function (index, value) {
            if (value.nodeType === 1 && getCssStyleValue(value, 'display') === "none") {
                isHidden = true;

                return false;
            }
        });

        return isHidden;
    };

    var isVisibilityHiddenTextNode = function (textNode) {
        var el = textNode.nodeType === 3 ? textNode.parentNode : null;

        return el && getCssStyleValue(el, "visibility") === "hidden";
    };

    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenTextNode(node);
}

export function getScrollableParents (el, doc) {
    var currentDocument = doc || document;
    var $parentsArray   = $.makeArray($(el).parents());

    if (domUtils.isElementInIframe(el)) {
        var $iFrameParents = $(domUtils.getIFrameByElement(el)).parents();

        $.each($iFrameParents, function (index, el) {
            $parentsArray.push(el);
        });
    }

    return $.grep($parentsArray, function (el) {
        return el.tagName.toLowerCase() !== 'body' && hasScroll(el, currentDocument);
    });
}

export function hasScroll (el, doc) {
    var currentDocument = doc || document;
    var styles          = hhStyleUtils.getComputedStyle(el, currentDocument);
    var scrollRegEx     = /auto|scroll/i;
    var overflowX       = scrollRegEx.test(styles.overflowX);
    var overflowY       = scrollRegEx.test(styles.overflowY);
    var isHtmlElement   = /html/i.test(el.tagName);
    var body            = isHtmlElement ? $(el).find('body')[0] : null;

    if (!overflowX && !overflowY && !isHtmlElement)
        return false;

    var hasScroll = ((overflowY || isHtmlElement) && el.scrollHeight > el.clientHeight) ||
                    ((overflowX || isHtmlElement) && el.scrollWidth > el.clientWidth);

    if (hasScroll)
        return hasScroll;

    //T174562 - wrong scrolling in iframes without src and others iframes
    if (isHtmlElement && body)
        return body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth;
}

export function getDocumentElementHeight () {
    var $window = $(window);

    return Math.round(Math.max($(document).height(), $window.height() + $window.scrollTop()));
}

export function getDocumentElementWidth () {
    var $window = $(window);

    return Math.round(Math.max($(document).width(), $window.width() + $window.scrollLeft()));
}

// Imported form the hammerhead
export var getBordersWidth      = hhStyleUtils.getBordersWidth;
export var getComputedStyle     = hhStyleUtils.getComputedStyle;
export var getElementMargin     = hhStyleUtils.getElementMargin;
export var getElementPadding    = hhStyleUtils.getElementPadding;
export var getElementScroll     = hhStyleUtils.getElementScroll;
export var getOptionHeight      = hhStyleUtils.getOptionHeight;
export var getSelectElementSize = hhStyleUtils.getSelectElementSize;
export var isVisibleChild       = hhStyleUtils.isVisibleChild;
