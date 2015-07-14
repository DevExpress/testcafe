HammerheadClient.define('Util.Style', function (require, exports) {
    var $ = require('jQuery'),
        Browser = require('Util.Browser'),
        DOM = require('Util.DOM');

    // NOTE: In IE8 jquery returns 'medium' border value in two cases:
    // when border is not set and when border is set to 'medium' value.
    // But in this cases real border values are different (0px and 3px). But we can't determine it.
    // And we take value 0px.
    var BORDER_WIDTH_KEYWORDS = {
        medium: 4,
        thick: 6,
        thin: 2
    };

    //NOTE: for Chrome
    var MIN_SELECT_SIZE_VALUE = 4;

    exports.getBordersWidth = function ($el) {
        //otherwise IE raises error
        var $elem = $el[0].documentElement ? $($el[0].documentElement) : $el,

            bottomBorderString = $elem.css('borderBottomWidth'),
            leftBorderString = $elem.css('borderLeftWidth'),
            rightBorderString = $elem.css('borderRightWidth'),
            topBorderString = $elem.css('borderTopWidth'),

            topBorder = !isNaN(parseInt(BORDER_WIDTH_KEYWORDS[topBorderString])) ?
                BORDER_WIDTH_KEYWORDS[topBorderString] :
                topBorderString.replace('px', ''),

            leftBorder = !isNaN(parseInt(BORDER_WIDTH_KEYWORDS[leftBorderString])) ?
                BORDER_WIDTH_KEYWORDS[leftBorderString] :
                leftBorderString.replace('px', ''),

            bottomBorder = !isNaN(parseInt(BORDER_WIDTH_KEYWORDS[bottomBorderString])) ?
                BORDER_WIDTH_KEYWORDS[bottomBorderString] :
                bottomBorderString.replace('px', ''),

            rightBorder = !isNaN(parseInt(BORDER_WIDTH_KEYWORDS[rightBorderString])) ?
                BORDER_WIDTH_KEYWORDS[rightBorderString] :
                rightBorderString.replace('px', '');

        return {
            bottom: bottomBorder ? parseInt(bottomBorder) : 0,
            left: leftBorder ? parseInt(leftBorder) : 0,
            right: rightBorder ? parseInt(rightBorder) : 0,
            top: topBorder ? parseInt(topBorder) : 0
        };
    };

    exports.getComputedStyle = function (el, doc) {
        return doc.defaultView && doc.defaultView.getComputedStyle ? doc.defaultView.getComputedStyle(el, null) : el.currentStyle;
    };

    exports.getCssStyleValue = function (el, property, doc) {
        var computedStyle = exports.getComputedStyle(el, doc || DOM.findDocument(el));

        return computedStyle ? computedStyle.getPropertyValue(property) : null;
    };

    exports.getDocumentElementHeight = function () {
        var $window = $(window);

        return Math.round(Math.max($(document).height(), $window.height() + $window.scrollTop()));
    };

    exports.getDocumentElementWidth = function () {
        var $window = $(window);

        return Math.round(Math.max($(document).width(), $window.width() + $window.scrollLeft()));
    };

    exports.getElementMargin = function ($el) {
        return {
            bottom: parseInt($el.css('margin-bottom').replace('px', '')),
            left: parseInt($el.css('margin-left').replace('px', '')),
            right: parseInt($el.css('margin-right').replace('px', '')),
            top: parseInt($el.css('margin-top').replace('px', ''))
        };
    };

    exports.getElementPadding = function ($el) {
        var padding = {
            bottom: parseInt($el.css('padding-bottom').replace('px', '')),
            left: parseInt($el.css('padding-left').replace('px', '')),
            right: parseInt($el.css('padding-right').replace('px', '')),
            top: parseInt($el.css('padding-top').replace('px', ''))
        };

        return {
            bottom: !isNaN(padding.bottom) ? padding.bottom : 0,
            left: !isNaN(padding.left) ? padding.left : 0,
            right: !isNaN(padding.right) ? padding.right : 0,
            top: !isNaN(padding.top) ? padding.top : 0
        };
    };

    exports.getOptionHeight = function ($select) {
        var realSizeValue = exports.getSelectElementSize($select),
            selectPadding = exports.getElementPadding($select),
            selectScrollHeight = $select[0].scrollHeight - (selectPadding.top + selectPadding.bottom),
            childrenCount = DOM.getSelectVisibleChildren($select).length;

        if (realSizeValue === 1)
            return $select.height();

        return Browser.isIE && realSizeValue > childrenCount ?
            Math.round(selectScrollHeight / childrenCount) :
            Math.round(selectScrollHeight / Math.max(childrenCount, realSizeValue));
    };

    exports.getScrollableParents = function (el, doc) {
        var currentDocument = doc || document,
            $parentsArray = $.makeArray($(el).parents());

        if (DOM.isElementInIframe(el)) {
            var $iFrameParents = $(DOM.getIFrameByElement(el)).parents();

            $.each($iFrameParents, function (index, el) {
                $parentsArray.push(el);
            });
        }

        return $.grep($parentsArray, function (el) {
            return el.tagName.toLowerCase() !== 'body' && exports.hasScroll(el, currentDocument);
        });
    };

    exports.hasScroll = function (el, doc) {
        var currentDocument = doc || document,
            styles = exports.getComputedStyle(el, currentDocument),
            scrollRegEx = /auto|scroll/i,
            overflowX = scrollRegEx.test(styles.overflowX),
            overflowY = scrollRegEx.test(styles.overflowY),
            isHtmlElement = /html/i.test(el.tagName),
            body = isHtmlElement ? $(el).find('body')[0] : null;

        if (!overflowX && !overflowY && !isHtmlElement)
            return false;

        var hasScroll = ((overflowY || isHtmlElement) && el.scrollHeight > el.clientHeight) || ((overflowX || isHtmlElement) && el.scrollWidth > el.clientWidth);

        if (hasScroll)
            return hasScroll;

        //T174562 - wrong scrolling in iframes without src and others iframes
        if (isHtmlElement && body)
            return body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth;
    };

    exports.getElementScroll = function ($el) {
        var isHtmlElement = /html/i.test($el[0].tagName),
            $currentWindow = $(window);

        if (isHtmlElement && DOM.isElementInIframe($el[0])) {
            var currentIFrame = DOM.getIFrameByElement($el[0]);

            if (currentIFrame)
                $currentWindow = $(currentIFrame.contentWindow);
        }

        var targetEl = isHtmlElement ? $currentWindow : $el;

        return {
            left: targetEl.scrollLeft(),
            top: targetEl.scrollTop()
        };
    };

    exports.getSelectElementSize = function ($select) {
        var sizeAttr = $select.attr('size'),
            multipleAttr = $select.attr('multiple'),
            size = !sizeAttr ? 1 : parseInt(sizeAttr);

        if(multipleAttr && (!sizeAttr || size < 1))
            size = MIN_SELECT_SIZE_VALUE;

        return size;
    };

    exports.isNotVisibleNode = function (node) {
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

            var ancestors = getAncestorsAndSelf(node),
                isHidden = false;

            $.each(ancestors, function (index, value) {
                if (value.nodeType === 1 &&
                    exports.getCssStyleValue(value, 'display') === "none") {
                    isHidden = true;

                    return false;
                }
            });

            return isHidden;
        };

        var isVisibilityHiddenTextNode = function (textNode) {
            var el = textNode.nodeType === 3 ? textNode.parentNode : null;

            return el && exports.getCssStyleValue(el, "visibility") === "hidden";
        };

        return !DOM.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenTextNode(node);
    };

    exports.isVisibleChild = function (el) {
        var $el = $(el),
            select = DOM.getSelectParent($el),
            tagName = el.tagName.toLowerCase();

        return select && select.tagName.toLowerCase() === 'select' && exports.getSelectElementSize($(select)) > 1 &&
            (tagName === 'option' || tagName === 'optgroup') &&
                //NOTE: Mozilla does not display group without label and with empty label
            (!Browser.isMozilla || el.label);
    };
});