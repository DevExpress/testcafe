HammerheadClient.define('Util.DOM', function (require, exports) {
    var $ = require('jQuery'),
        Browser = require('Util.Browser'),
        SharedConst = require('Shared.Const'),
        UrlUtil = require('UrlUtil');

    var scrollbarSize = null;

    exports.getActiveElement = function (currentDocument) {
        var doc = currentDocument || document,
            activeElement = doc.activeElement && doc.activeElement.tagName ? doc.activeElement : $('body')[0];

        if (activeElement.tagName.toLowerCase() === 'iframe') {
            try {
                return exports.getActiveElement($(activeElement).contents()[0]);
            } catch (e) {
            }
        }

        return activeElement;
    };

    exports.getChildIndex = function ($select, child) {
        var $allChildren = child.tagName.toLowerCase() === 'option' ? $select.find('option') : $select.find('optgroup');

        return $.inArray(child, $allChildren);
    };

    exports.getChildVisibleIndex = function ($select, child) {
        return $.inArray(child, exports.getSelectVisibleChildren($select));
    };

    exports.getIFrameByElement = function (el) {
        var currentDocument = el.documentElement ? el : exports.findDocument(el),
            currentWindow = window !== window.top && exports.isCrossDomainWindows(window.top, window) ? window : window.top;

        var $iframe = $(currentWindow.document).find('iframe').filter(function () {
            //crossDomain iframes throw error here
            try {
                return this.contentWindow.document === currentDocument;
            } catch (e) {
                return false;
            }
        });

        return $iframe.length ? $iframe[0] : null;
    };

    exports.getIFrameByWindow = function (win) {
        var $iframe = $(window.top.document).find('iframe').filter(function () {
            return this.contentWindow === win;
        });

        return $iframe.length ? $iframe[0] : null;
    };

    exports.getMapContainer = function (el) {
        var $container = $('[usemap=#' + $(el).closest('map').attr('name') + ']', exports.findDocument(el));

        return $container.length ? $container[0] : null;
    };

    exports.getScrollbarSize = function () {
        if (!scrollbarSize) {
            var $scrollDiv = $('<div>').css({
                height: '100px',
                overflow: 'scroll',
                position: 'absolute',
                top: '-9999px',
                width: '100px'
            }).appendTo($('body'));

            var scrollbarWidth = $scrollDiv[0].offsetWidth - $scrollDiv[0].clientWidth;

            $scrollDiv.remove();
            scrollbarSize = scrollbarWidth;
        }

        return scrollbarSize;
    };

    exports.getSelectParent = function ($child) {
        var $select = $child.parents('select:first');

        return !$select.length ? null : $select[0];
    };

    exports.getSelectVisibleChildren = function ($select) {
        var $children = $select.find('optgroup, option');

        if (Browser.isMozilla) {
            //NOTE: Mozilla does not display group without label and with empty label
            $children = $children.filter(function (index, item) {
                return  item.tagName.toLowerCase() !== 'optgroup' || item.label;
            });
        }

        return $children;
    };

    exports.getTextareaIndentInLine = function (textarea, position) {
        if (!textarea.value)
            return 0;

        var topPart = textarea.value.substring(0, position),
            linePosition = topPart.lastIndexOf('\n') === -1 ? 0 : (topPart.lastIndexOf('\n') + 1);

        return position - linePosition;
    };

    exports.getTextareaLineNumberByPosition = function (textarea, position) {
        var lines = textarea.value.split('\n'),
            topPartLength = 0,
            line = 0;

        for (var i = 0; topPartLength <= position; i++) {
            if (position <= topPartLength + lines[i].length) {
                line = i;

                break;
            }

            topPartLength += lines[i].length + 1;
        }

        return line;
    };

    exports.getTextareaPositionByLineAndOffset = function (textarea, line, offset) {
        var lines = textarea.value.split('\n'),
            lineIndex = 0;

        for (var i = 0; i < line; i++)
            lineIndex += lines[i].length + 1;

        return lineIndex + offset;
    };

    exports.getTopSameDomainWindow = function (window) {
        try {
            if ((window !== window.top) && UrlUtil.isIframeWithoutSrc(window.frameElement))
                return exports.getTopSameDomainWindow(window.parent);
        } catch (e) {
        }

        return window;
    };

    exports.findDocument = function (el) {
        if (el.documentElement)
            return el;

        return el.parentNode ? exports.findDocument(el.parentNode) : document;
    };

    exports.isAnchor = function (el) {
        return exports.isDomElement(el) && el.tagName.toLowerCase() === 'a';
    };

    exports.isContentEditableElement = function (el) {
        var isAlwaysNotEditableElement = function (el) {
            var tagName = el.tagName.toLowerCase(),
                notContentEditableElementsRegExp = /select|option|applet|area|audio|canvas|datalist|keygen|map|meter|object|progress|source|track|video|img/;

            return tagName && (notContentEditableElementsRegExp.test(tagName) || $(el).is(':input'));
        };

        var isContentEditable = false,
            element = null;

        if (exports.isTextNode(el))
            element = el.parentElement || $(el).parent()[0];
        else
            element = el;

        if (element)
            isContentEditable = element.isContentEditable && !isAlwaysNotEditableElement(element) && !exports.isTextEditableElement(element);

        return exports.isRenderedNode(element) && (isContentEditable || exports.findDocument(el).designMode === 'on');
    };

    exports.isCrossDomainIframe = function (iframe, bySrc) {
        var iframeLocation = UrlUtil.getIframeLocation(iframe);

        if (!bySrc && iframeLocation.documentLocation === null)
            return true;

        var currentLocation = bySrc ? iframeLocation.srcLocation : iframeLocation.documentLocation;

        if (currentLocation && UrlUtil.isSupportedProtocol(currentLocation))
            return !UrlUtil.sameOriginCheck(location.toString(), currentLocation);

        return false;
    };

    exports.isCrossDomainWindows = function (window1, window2) {
        try {
            if (window1 === window2)
                return false;

            var window1Location = window1.location.toString(),
                window2Location = window2.location.toString();

            if (window1Location === 'about:blank' || window2Location === 'about:blank')
                return false;

            return !UrlUtil.sameOriginCheck(window1Location, window2Location);
        } catch (e) {
            return true;
        }
    };

    exports.isDocumentInstance = function (instance) {
        return instance && typeof instance === 'object' && typeof instance.referrer !== 'undefined' && instance.toString &&
            (instance.toString() === '[object HTMLDocument]' || instance.toString() === '[object Document]');
    };

    exports.isDomElement = function (el) {
        // T184805
        if (el && typeof el.toString === 'function' && el.toString.toString().indexOf('[native code]') !== -1 && el.constructor &&
            (el.constructor.toString().indexOf(' Element') !== -1 || el.constructor.toString().indexOf(' Node') !== -1))
                return false;

        //B252941
        return el && (typeof el === 'object' || (Browser.isMozilla && typeof el === 'function')) &&
            el.nodeType !== 11 && typeof el.nodeName === 'string' && el.tagName;
    };

    exports.isEditableElement = function (el, checkEditingAllowed) {
        return checkEditingAllowed ? exports.isTextEditableElementAndEditingAllowed(el) || exports.isContentEditableElement(el) :
            exports.isTextEditableElement(el) || exports.isContentEditableElement(el);
    };

    exports.isElementContainsNode = function (el, node) {
        var contains = false;

        function checkChildNodes(el, node) {
            var childNodes = el.childNodes;

            if (contains || exports.isTheSameNode(node, el))
                contains = true;

            $.each(childNodes, function (index, value) {
                if (!contains)
                    contains = checkChildNodes(value, node);
                else
                    return false;
            });

            return contains;
        }

        return checkChildNodes(el, node);
    };

    exports.isElementInDocument = function (el, currentDocument) {
        var doc = currentDocument || document,
            curElement = el.parentNode;

        while (curElement) {
            if (curElement === doc)
                return true;

            curElement = curElement.parentNode;
        }

        return false;
    };

    exports.isElementInIframe = function (el, currentDocument) {
        var doc = currentDocument || exports.findDocument(el);

        return window.document !== doc;
    };

    exports.isFileInput = function (el) {
        return exports.isInputElement(el) && el.type.toLowerCase() === 'file';
    };

    exports.isHammerheadAttr = function (attr) {
        return attr === SharedConst.TEST_CAFE_HOVER_PSEUDO_CLASS_ATTR || attr.indexOf(SharedConst.DOM_SANDBOX_STORED_ATTR_POSTFIX) !== -1;
    };

    exports.isHTMLCollection = function (collection) {
        try {
            return collection.toString() === '[object HTMLCollection]';
        } catch (e) {
            return false;
        }
    };

    exports.isIframe = function (el) {
        return exports.isDomElement(el) && el.tagName.toLowerCase() === 'iframe';
    };

    exports.isInputElement = function (el) {
        return exports.isDomElement(el) && el.tagName.toLowerCase() === 'input';
    };

    exports.isInputWithoutSelectionPropertiesInMozilla = function (el) {
        //T101195, T133144, T101195
        return Browser.isMozilla && Browser.browserVersion >= 29 && $(el).is('input[type=number]');
    };

    exports.isLocationInstance = function (instance) {
        return instance && typeof instance === 'object' && typeof instance.href !== 'undefined' &&
            typeof instance.assign !== 'undefined';
    };

    exports.isMapElement = function (el) {
        return /^map$|^area$/i.test(el.tagName);
    };

    exports.isNodeList = function (collection) {
        try {
            return collection.toString() === '[object NodeList]';
        } catch (e) {
            return false;
        }
    };

    exports.isRenderedNode = function (node) {
        return !(node.nodeType === 7 || node.nodeType === 8 || /^(script|style)$/i.test(node.nodeName));
    };

    exports.isSelectElement = function (el) {
        return el.tagName && el.tagName.toLowerCase() === 'select';
    };

    exports.isShadowUIElement = function (element) {
        while (element) {
            if (element.tagName === 'BODY' || element.tagName === 'HEAD')
                return false;

            //NOTE: check className type to avoid issues with SVG elements className property
            if (typeof element.className === 'string' && element.className.indexOf(SharedConst.TEST_CAFE_UI_CLASSNAME_POSTFIX) > -1)
                return true;

            element = element.parentNode;
        }

        return false;
    };

    exports.isStyleInstance = function (instance) {
        return instance && typeof instance === 'object' && typeof instance.border !== 'undefined' &&
            (instance.toString() === '[object CSSStyleDeclaration]' || instance.toString() === '[object CSS2Properties]' ||
                instance.toString() === '[object MSStyleCSSProperties]');
    };

    exports.isSvgElement = function (el) {
        return $(el).closest('svg').length > 0;
    };

    exports.isTextEditableInput = function (el) {
        var editableInputTypesRegEx = /^(datetime|email|number|password|search|tel|text|url)$/,
            tagName = el.tagName ? el.tagName.toLowerCase() : '';

        return tagName === 'input' && editableInputTypesRegEx.test(el.type);
    };

    exports.isTextEditableElement = function (el) {
        var tagName = el.tagName ? el.tagName.toLowerCase() : '';

        return exports.isTextEditableInput(el) || tagName === 'textarea';
    };

    exports.isTextEditableElementAndEditingAllowed = function (el) {
        var isElementEditingAllowed = function () {
            return !el.readOnly && el.getAttribute('readonly') !== 'readonly';
        };

        return exports.isTextEditableElement(el) && isElementEditingAllowed();
    };

    exports.isTextNode = function (node) {
        return node && typeof node === 'object' && node.nodeType === 3 && typeof node.nodeName === 'string';
    };

    exports.isTheSameNode = function (node1, node2) {
        //NOTE: Mozilla has not isSameNode method
        if (node1 && node2 && node1.isSameNode)
            return node1.isSameNode(node2);
        else
            return node1 === node2;
    };

    exports.isWindowInstance = function (instance) {
        var result = instance && typeof instance === 'object' && typeof instance.top !== 'undefined' &&
            ($.browser.mozilla ? true : (instance.toString && (instance.toString() === '[object Window]' ||
                instance.toString() === '[object global]')));

        if (result && instance.top !== instance)
            return exports.isWindowInstance(instance.top);

        return result;
    };

    exports.setUnselectableAttributeRecursive = function (el) {
        if (el.nodeType === 1)
            el.setAttribute("unselectable", "on");

        var child = el.firstChild;

        while (child) {
            exports.setUnselectableAttributeRecursive(child);

            child = child.nextSibling;
        }
    };
});