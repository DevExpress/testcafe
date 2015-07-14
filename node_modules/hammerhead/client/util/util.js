HammerheadClient.define('Util', function (require, exports) {
    //TODO: split utils to separate
    var $ = require('jQuery'),
        Browser = require('Util.Browser'),
        DOM = require('Util.DOM'),
        Event = require('Util.Event'),
        EventEmitter = require('Util.EventEmitter'),
        KeyChar = require('Util.KeyChar'),
        Position = require('Util.Position'),
        Style = require('Util.Style');


    // Uses in the TestCafe Only
    exports.MAX_OPTION_LIST_LENGTH = Browser.isIE ? 30 : 20;
    exports.BUTTON = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2
    };
    exports.WHICH_PARAMETER = {
        NO_BUTTON: 0,
        LEFT_BUTTON: 1,
        MIDDLE_BUTTON: 2,
        RIGHT_BUTTON: 3
    };
    exports.BUTTONS_PARAMETER = {
        NO_BUTTON: 0,
        LEFT_BUTTON: 1,
        RIGHT_BUTTON: 2
    };
    exports.POINTER_EVENT_BUTTON = {
        NO_BUTTON: -1,
        LEFT_BUTTON: 0,
        RIGHT_BUTTON: 2
    };

    exports.RESERVED_WORDS = /^(break|case|catch|continue|default|delete|do|else|false|finally|for|function|if|in|instanceof|new|null|return|switch|this|throw|true|try|typeof|var|void|while|with)$/;

    exports.checkPresenceInRectangle = Position.checkPresenceInRectangle;
    exports.clientToOffsetCoord = Position.clientToOffsetCoord;
    exports.findCenter = Position.findCenter;
    exports.findClientCenter = Position.findClientCenter;
    exports.findLineAndRectangelIntersection = Position.findLineAndRectangelIntersection;
    exports.getClientDimensions = Position.getClientDimensions;
    exports.getElementClientRectangle = Position.getElementClientRectangle;
    exports.getElementRectangle = Position.getElementRectangle;
    exports.getElementRectangleForMarking = Position.getElementRectangleForMarking;
    exports.getIFrameCoordinates = Position.getIFrameCoordinates;
    exports.isContainOffset = Position.isContainOffset;
    exports.isElementVisible = Position.isElementVisible;
    exports.getFixedPositionForIFrame = Position.getFixedPositionForIFrame;
    exports.getFixedPosition = Position.getFixedPosition;
    exports.getElementFromPoint = Position.getElementFromPoint;
    exports.getEventPageCoordinates = Position.getEventPageCoordinates;
    exports.getEventAbsoluteCoordinates = Position.getEventAbsoluteCoordinates;

    exports.getCssStyleValue = Style.getCssStyleValue;
    exports.getDocumentElementHeight = Style.getDocumentElementHeight;
    exports.getDocumentElementWidth = Style.getDocumentElementWidth;
    exports.getElementMargin = Style.getElementMargin;
    exports.getElementPadding = Style.getElementPadding;
    exports.getOptionHeight = Style.getOptionHeight;
    exports.getSelectElementSize = Style.getSelectElementSize;
    exports.hasScroll = Style.hasScroll;
    exports.isVisibleChild = Style.isVisibleChild;
    exports.isNotVisibleNode = Style.isNotVisibleNode;
    exports.getScrollableParents = Style.getScrollableParents;

    exports.changeLetterCase = KeyChar.changeLetterCase;
    exports.getKeyCodeByChar = KeyChar.getKeyCodeByChar;
    exports.isArrowKey = KeyChar.isArrowKey;
    exports.isCharByKeyCode = KeyChar.isCharByKeyCode;
    exports.isLetter = KeyChar.isLetter;
    exports.KEYS_MAPS = KeyChar.KEYS_MAPS;
    exports.getArrayByKeyCombination = KeyChar.getArrayByKeyCombination;
    exports.getShortcutsByKeyCombination = KeyChar.getShortcutsByKeyCombination;
    exports.getShortcutHandlerByKeyCombination = KeyChar.getShortcutHandlerByKeyCombination;
    exports.parseKeysString = KeyChar.parseKeysString;
    exports.getChildVisibleIndex = DOM.getChildVisibleIndex;
    exports.getIFrameByWindow = DOM.getIFrameByWindow;
    exports.getScrollbarSize = DOM.getScrollbarSize;
    exports.getSelectParent = DOM.getSelectParent;
    exports.getSelectVisibleChildren = DOM.getSelectVisibleChildren;
    exports.isContentEditableElement = DOM.isContentEditableElement;
    exports.isEditableElement = DOM.isEditableElement;
    exports.isElementContainsNode = DOM.isElementContainsNode;
    exports.isRenderedNode = DOM.isRenderedNode;
    exports.isSelectElement = DOM.isSelectElement;
    exports.isSvgElement = DOM.isSvgElement;
    exports.isTextNode = DOM.isTextNode;
    exports.isTheSameNode = DOM.isTheSameNode;
    exports.setUnselectableAttributeRecursive = DOM.setUnselectableAttributeRecursive;
    exports.getChildIndex = DOM.getChildIndex;
    exports.getTextareaLineNumberByPosition = DOM.getTextareaLineNumberByPosition;
    exports.getTextareaIndentInLine = DOM.getTextareaIndentInLine;
    exports.getTextareaPositionByLineAndOffset = DOM.getTextareaPositionByLineAndOffset;
    exports.getTopSameDomainWindow = DOM.getTopSameDomainWindow;
    // --------------------

    // Uses in the Hammerhead
    exports.getOffsetPosition = Position.getOffsetPosition;
    exports.offsetToClientCoords = Position.offsetToClientCoords;

    exports.getBordersWidth = Style.getBordersWidth;
    exports.getElementScroll = Style.getElementScroll;

    exports.preventDefault = Event.preventDefault;
    exports.RECORDING_LISTENED_EVENTS = Event.RECORDING_LISTENED_EVENTS;
    exports.DOM_EVENTS = Event.DOM_EVENTS;
    exports.stopPropagation = Event.stopPropagation;

    exports.EventEmitter = EventEmitter;

    exports.findDocument = DOM.findDocument;
    exports.getActiveElement = DOM.getActiveElement;
    exports.getIFrameByElement = DOM.getIFrameByElement;
    exports.isAnchor = DOM.isAnchor;
    exports.isCrossDomainIframe = DOM.isCrossDomainIframe;
    exports.isCrossDomainWindows = DOM.isCrossDomainWindows;
    exports.isDocumentInstance = DOM.isDocumentInstance;
    exports.isDomElement = DOM.isDomElement;
    exports.isElementInDocument = DOM.isElementInDocument;
    exports.isElementInIframe = DOM.isElementInIframe;
    exports.isFileInput = DOM.isFileInput;
    exports.isHammerheadAttr = DOM.isHammerheadAttr;
    exports.isHTMLCollection = DOM.isHTMLCollection;
    exports.isIframe = DOM.isIframe;
    exports.isInputElement = DOM.isInputElement;
    exports.isInputWithoutSelectionPropertiesInMozilla = DOM.isInputWithoutSelectionPropertiesInMozilla;
    exports.isLocationInstance = DOM.isLocationInstance;
    exports.isNodeList = DOM.isNodeList;
    exports.isShadowUIElement = DOM.isShadowUIElement;
    exports.isStyleInstance = DOM.isStyleInstance;
    exports.isTextEditableElement = DOM.isTextEditableElement;
    exports.isTextEditableElementAndEditingAllowed = DOM.isTextEditableElementAndEditingAllowed;
    exports.isTextEditableInput = DOM.isTextEditableInput;
    exports.isWindowInstance = DOM.isWindowInstance;

    // We can't use 'obj instanceof $' check because it depends on instance of the jQuery.
    exports.isJQueryObj = function (obj) {
        return obj && !!obj.jquery;
    };
    //-------------------------------------------

    exports.browserVersion = Browser.browserVersion;
    exports.hasTouchEvents = Browser.hasTouchEvents;
    exports.isAndroid = Browser.isAndroid;
    exports.isIE = Browser.isIE;
    exports.isIE11 = Browser.isIE11;
    exports.isIOS = Browser.isIOS;
    exports.isMozilla = Browser.isMozilla;
    exports.isOpera = Browser.isOpera;
    exports.isOperaWithWebKit = Browser.isOperaWithWebKit;
    exports.isSafari = Browser.isSafari;
    exports.isTouchDevice = Browser.isTouchDevice;
    exports.isWebKit = Browser.isWebKit;

    exports.getElementDescription = function (el) {
        var attributes = {
                id: 'id',
                name: 'name',
                class: 'className'
            },
            res = [];

        res.push('<');
        res.push(el.tagName.toLowerCase());

        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                var val = el[attributes[attr]];

                if (val)
                    res.push(' ' + attr + '="' + val + '"');
            }
        }

        res.push('>');

        return res.join('');
    };

    exports.storeElementAttributes = function (propName, el) {
        el[propName] = {};

        $.each(el.attributes, function (index, attribute) {
            el[propName][attribute.nodeName] = attribute.nodeValue;
        });
    };

    exports.ensureArray = function (target) {
        return target instanceof Array ? target : [target];
    };

    exports.isStringOrStringArray = function (target, forbidEmptyArray) {
        if (typeof target === 'string')
            return true;

        if (target instanceof Array && (!forbidEmptyArray || target.length)) {
            for (var i = 0; i < target.length; i++) {
                if (typeof target[i] !== 'string')
                    return false;
            }

            return true;
        }

        return false;
    };

    exports.parseActionArgument = function (item, actionName) {
        var elements = [];

        if (DOM.isDomElement(item))
            return [item];
        else if (actionName && actionName === 'select' && DOM.isTextNode(item))
            return [item];
        else if (typeof item === 'string') {
            $(item).each(function () {
                elements.push(this);
            });

            return elements;
        }
        else if (exports.isJQueryObj(item)) {
            item.each(function () {
                elements.push(this);
            });

            return elements;
        }
        else
            return null;
    };

    // TODO: replace to 'return window !== window.top'
    exports.hasIFrameParent = function (el) {
        var findDocument = function (el) {
            if (el.documentElement)
                return el;

            return el.parentNode ? findDocument(el.parentNode) : document;
        };

        try {
            return window.top.document !== findDocument(el);
        } catch (e) {
            return true;
        }
    };

    var NativeDate = window.Date,
        nativeDateNow = NativeDate.now;

    exports.dateNow = function () {
        return nativeDateNow ? nativeDateNow() : +(new NativeDate());
    };

    //helpers
    //TODO move to separate file
    (function () {
        function sortElementsByFocusingIndex($elements) {
            if (!$elements || !$elements.length)
                return [];

            var $withTabIndex = $elements.filter(function (item, el) {
                return el.tabIndex > 0;
            });

            //iFrames
            var $iFrames = $elements.filter('iframe');

            if (!$withTabIndex.length) {
                var elementsArray = $elements.toArray();

                if ($iFrames.length)
                    elementsArray = insertIFramesContentElements(elementsArray, $iFrames);

                return elementsArray;
            }

            var withTabIndexArray = $withTabIndex.toArray().sort(sortBy('tabIndex')),
                withoutTabIndexArray = $elements.not($withTabIndex).toArray();

            if ($iFrames.length)
                return insertIFramesContentElements(withTabIndexArray, $iFrames).concat(insertIFramesContentElements(withoutTabIndexArray, $iFrames));

            return withTabIndexArray.concat(withoutTabIndexArray);
        }

        function insertIFramesContentElements(elementsArray, $iFrames) {
            var results = [],
                sortedIFrames = sortElementsByTabIndex($iFrames),
                iFramesElements = [];

            for (var i = 0; i < sortedIFrames.length; i++)
                iFramesElements.push(sortElementsByFocusingIndex(getAllFocusableElements($(sortedIFrames[i]))));

            var elementWithTabIndexFilter = function (item, el) {
                return el.tabIndex > 0;
            };

            for (var j = 0; j < elementsArray.length; j++) {
                results.push(elementsArray[j]);

                if (elementsArray[j].tagName.toLowerCase() === 'iframe') {
                    if (Browser.isIE) {
                        results.pop();

                        var $iFramesElements = $(iFramesElements[$.inArray(elementsArray[j], $iFrames)]),
                            $withTabIndex = $iFramesElements.filter(elementWithTabIndexFilter),
                            withTabIndexArray = $withTabIndex.toArray().sort(sortBy('tabIndex')),
                            withoutTabIndexArray = $iFramesElements.not($withTabIndex).toArray();

                        results = results.concat(withTabIndexArray);
                        results.push(elementsArray[j]);
                        results = results.concat(withoutTabIndexArray);
                    }
                    else {
                        if ($.browser.webkit && iFramesElements[$.inArray(elementsArray[j], $iFrames)].length)
                            results.pop();

                        results = results.concat(iFramesElements[$.inArray(elementsArray[j], $iFrames)]);
                    }
                }
            }

            return results;
        }

        function sortElementsByTabIndex($elements) {
            var $withTabIndex = $elements.filter(function (item, el) {
                return el.tabIndex > 0;
            });

            if (!$withTabIndex.length)
                return $elements.toArray();

            return $withTabIndex.toArray().sort(sortBy('tabIndex')).concat($elements.not($withTabIndex).toArray());
        }

        function sortBy(property) {
            return function (a, b) {
                if (a[property] < b[property])
                    return -1;
                if (a[property] > b[property])
                    return 1;

                return 0;
            };
        }

        function getAllFocusableElements($iframe) {
            var $allFocusable = $();

            if ($iframe) {
                //NOTE: We can get elements of the same domain iframe only
                try {
                    $allFocusable = $iframe.contents(0).find(getFocusableSelector());
                } catch (e) {
                    return $allFocusable;
                }
            } else
                $allFocusable = $(getFocusableSelector());

            $allFocusable = $allFocusable
                .not(":disabled")
                .filter(function () {
                    return $(this).attr("tabIndex") !== -1;
                });

            //NOTE: <option> element visible/ hidden in all browser differently
            // http://api.jquery.com/hidden-selector/
            if ($.browser.webkit || $.browser.opera) {
                var $hidden = $allFocusable.filter(function () {
                    return ($(this).is(":hidden") && !($(this).is("option")));
                });

                $allFocusable = $allFocusable.not($hidden);
            }
            else
                $allFocusable = $allFocusable.not(':hidden');

            $allFocusable = $allFocusable.filter(function () {
                var $this = $(this);

                return !($this.is("a") && $this.attr("href") === '' && !$this.attr("tabIndex")) && $this.css('visibility') !== 'hidden';
            });

            return $allFocusable;
        }

        function getFocusableSelector() {
            //NOTE: We don't take into account the case of embedded contentEditable elements and specify the contentEditable attribute for focusable elements
            var selectorPostfix = ', [contenteditable="true"], [contenteditable=""], [tabIndex]';

            if (Browser.isIE)
                return ':input, a[href][href != ""], iframe' + selectorPostfix;

            if ($.browser.opera)
                return ':input' + selectorPostfix;

            return ':input, a[href], iframe' + selectorPostfix;
        }

        exports.getNextFocusableElement = function (element, reverse) {
            var offset = reverse ? -1 : 1,
                allFocusable = sortElementsByFocusingIndex(getAllFocusableElements());

            //NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
            // in Mozilla and Opera focus sets on any radio set.
            if (element.tagName === "INPUT" && element.type === "radio" && element.name !== "" && !(Browser.isMozilla || $.browser.opera)) {
                allFocusable = $.grep(allFocusable, function (item) {
                    return !item.name || item === element || item.name !== element.name;
                });
            }

            var currentIndex = -1;

            $.each(allFocusable, function (index, item) {
                if (item === element) {
                    currentIndex = index;
                    return false;
                }
            });

            if ((!reverse && currentIndex === allFocusable.length - 1) || (reverse && currentIndex === 0))
                return $('body')[0];

            if (reverse && currentIndex === -1)
                return allFocusable[allFocusable.length - 1];

            return allFocusable[currentIndex + offset];
        };

        exports.isElementFocusable = function ($element) {
            var isFocusable = $element.is(getFocusableSelector() + ', body') && !$element.is(':disabled') && $element.attr("tabIndex") !== -1;

            if ($.browser.webkit || $.browser.opera)
                isFocusable = isFocusable && (!$element.is(':hidden') || $element.is('option'));
            else
                isFocusable = isFocusable && !$element.is(':hidden');


            return (isFocusable && !($element.is("a") && $element.attr("href") === '' && !$element.attr("tabIndex")) && $element.css('visibility') !== 'hidden');
        };

    })();

    //Inherit
    exports.inherit = function (Child, Parent) {
        var Func = function () {
        };

        Func.prototype = Parent.prototype;

        $.extend(Child.prototype, new Func());
        Child.prototype.constructor = Child;
        Child.base = Parent.prototype;
    };

    exports.forEachKey = function(obj, func) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                func(key);
        }
    };

    exports.arrForEach = function(arr, func) {
        for(var i = 0; i < arr.length; i++)
            func(arr[i], i);
    };
});