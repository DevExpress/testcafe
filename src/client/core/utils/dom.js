import escapeHTML from 'escape-html';
import hammerhead from '../deps/hammerhead';
import $ from '../deps/jquery';


var browserUtils = hammerhead.utils.browser;

export function getTextareaIndentInLine (textarea, position) {
    if (!textarea.value)
        return 0;

    var topPart      = textarea.value.substring(0, position),
        linePosition = topPart.lastIndexOf('\n') === -1 ? 0 : (topPart.lastIndexOf('\n') + 1);

    return position - linePosition;
}

export function getTextareaLineNumberByPosition (textarea, position) {
    var lines         = textarea.value.split('\n'),
        topPartLength = 0,
        line          = 0;

    for (var i = 0; topPartLength <= position; i++) {
        if (position <= topPartLength + lines[i].length) {
            line = i;

            break;
        }

        topPartLength += lines[i].length + 1;
    }

    return line;
}

export function getTextareaPositionByLineAndOffset (textarea, line, offset) {
    var lines     = textarea.value.split('\n'),
        lineIndex = 0;

    for (var i = 0; i < line; i++)
        lineIndex += lines[i].length + 1;

    return lineIndex + offset;
}

export function isEditableElement (el, checkEditingAllowed) {
    return checkEditingAllowed ?
           isTextEditableElementAndEditingAllowed(el) || isContentEditableElement(el) :
           isTextEditableElement(el) || isContentEditableElement(el);
}

export function isElementContainsNode (el, node) {
    var contains = false;

    function checkChildNodes (el, node) {
        var childNodes = el.childNodes;

        if (contains || isTheSameNode(node, el))
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
}

export function isSelectElement (el) {
    return el.tagName && el.tagName.toLowerCase() === 'select';
}

export function setUnselectableAttributeRecursive (el) {
    if (el.nodeType === 1)
        el.setAttribute("unselectable", "on");

    var child = el.firstChild;

    while (child) {
        setUnselectableAttributeRecursive(child);

        child = child.nextSibling;
    }
}

export function isTheSameNode (node1, node2) {
    //NOTE: Mozilla has not isSameNode method
    if (node1 && node2 && node1.isSameNode)
        return node1.isSameNode(node2);
    else
        return node1 === node2;
}

export function getElementDescription (el) {
    var attributes = {
            id:    'id',
            name:  'name',
            class: 'className'
        },
        res        = [];

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

    return escapeHTML(res.join(''));
}

export function storeElementAttributes (propName, el) {
    el[propName] = {};

    $.each(el.attributes, function (index, attribute) {
        el[propName][attribute.nodeName] = attribute.nodeValue;
    });
}

function sortElementsByFocusingIndex ($elements) {
    if (!$elements || !$elements.length)
        return [];

    var $withTabIndex = $elements.filter((index, el) => el.tabIndex > 0);

    //iFrames
    var $iFrames = $elements.filter('iframe');

    if (!$withTabIndex.length) {
        var elementsArray = $elements.toArray();

        if ($iFrames.length)
            elementsArray = insertIFramesContentElements(elementsArray, $iFrames);

        return elementsArray;
    }

    var withTabIndexArray    = $withTabIndex.toArray().sort(sortBy('tabIndex')),
        withoutTabIndexArray = $elements.not($withTabIndex).toArray();

    if ($iFrames.length)
        return insertIFramesContentElements(withTabIndexArray, $iFrames).concat(insertIFramesContentElements(withoutTabIndexArray, $iFrames));

    return withTabIndexArray.concat(withoutTabIndexArray);
}

function insertIFramesContentElements (elementsArray, $iFrames) {
    var results         = [],
        sortedIFrames   = sortElementsByTabIndex($iFrames),
        iFramesElements = [];

    for (var i = 0; i < sortedIFrames.length; i++)
        iFramesElements.push(sortElementsByFocusingIndex(getAllFocusableElements($(sortedIFrames[i]))));

    var elementWithTabIndexFilter = (item, el) => el.tabIndex > 0;

    for (var j = 0; j < elementsArray.length; j++) {
        results.push(elementsArray[j]);

        if (elementsArray[j].tagName.toLowerCase() === 'iframe') {
            if (browserUtils.isIE) {
                results.pop();

                var $iFramesElements     = $(iFramesElements[$.inArray(elementsArray[j], $iFrames)]),
                    $withTabIndex        = $iFramesElements.filter(elementWithTabIndexFilter),
                    withTabIndexArray    = $withTabIndex.toArray().sort(sortBy('tabIndex')),
                    withoutTabIndexArray = $iFramesElements.not($withTabIndex).toArray();

                results = results.concat(withTabIndexArray);
                results.push(elementsArray[j]);
                results = results.concat(withoutTabIndexArray);
            }
            else {
                if (browserUtils.isWebKit && iFramesElements[$.inArray(elementsArray[j], $iFrames)].length)
                    results.pop();

                results = results.concat(iFramesElements[$.inArray(elementsArray[j], $iFrames)]);
            }
        }
    }

    return results;
}

function sortElementsByTabIndex ($elements) {
    var $withTabIndex = $elements.filter((index, el) => el.tabIndex > 0);

    if (!$withTabIndex.length)
        return $elements.toArray();

    return $withTabIndex.toArray().sort(sortBy('tabIndex')).concat($elements.not($withTabIndex).toArray());
}

function sortBy (property) {
    return function (a, b) {
        if (a[property] < b[property])
            return -1;
        if (a[property] > b[property])
            return 1;

        return 0;
    };
}

function getAllFocusableElements ($iframe) {
    var $allFocusable = $();
    var $invisibleElements = $();

    if ($iframe) {
        //NOTE: We can get elements of the same domain iframe only
        try {
            $allFocusable = $iframe.contents(0).find(getFocusableSelector());
            $invisibleElements = $iframe.contents(0).find('*').filter((index, el)=> el.style.display === 'none');
        } catch (e) {
            return $allFocusable;
        }
    }
    else {
        $allFocusable      = $(getFocusableSelector());
        $invisibleElements = $('*').filter((index, el) => el.style.display === 'none');
    }

    $allFocusable = $allFocusable
        .not(":disabled")
        .filter((index, el) => $(el).attr("tabIndex") !== -1);

    $allFocusable = $allFocusable.filter((index, el) => el.style.display !== 'none' && !$invisibleElements.has(el).length);

    if (browserUtils.isIE)
        $allFocusable = $allFocusable.not('option');

    $allFocusable = $allFocusable.filter((index, el) => {
        var $el = $(el);

        return !($el.is("a") && $el.attr("href") === '' && !$el.attr("tabIndex")) &&
               $el.css('visibility') !== 'hidden';
    });

    return $allFocusable;
}

function getFocusableSelector () {
    //NOTE: We don't take into account the case of embedded contentEditable elements and specify the contentEditable attribute for focusable elements
    var selectorPostfix = ', [contenteditable="true"], [contenteditable=""], [tabIndex]';

    if (browserUtils.isIE)
        return ':input, a[href][href != ""], iframe' + selectorPostfix;

    if (browserUtils.isOpera)
        return ':input' + selectorPostfix;

    return ':input, a[href], iframe' + selectorPostfix;
}

export function getNextFocusableElement (element, reverse) {
    var offset       = reverse ? -1 : 1,
        allFocusable = sortElementsByFocusingIndex(getAllFocusableElements());

    //NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
    // in Mozilla and Opera focus sets on any radio set.
    if (element.tagName === "INPUT" && element.type === "radio" && element.name !== "" &&
        !(browserUtils.isMozilla || browserUtils.isOpera)) {
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
}

export function isElementFocusable ($element) {
    var isFocusable = $element.is(getFocusableSelector() + ', body') && !$element.is(':disabled') &&
                      $element.attr("tabIndex") !== -1;

    if (browserUtils.isWebKit || browserUtils.isOpera)
        isFocusable = isFocusable && (!$element.is(':hidden') || $element.is('option'));
    else
        isFocusable = isFocusable && !$element.is(':hidden');


    return (isFocusable && !($element.is("a") && $element.attr("href") === '' && !$element.attr("tabIndex")) &&
            $element.css('visibility') !== 'hidden');
}

export function isIFrameWindowInDOM (win) {
    //NOTE: In MS Edge, if an iframe is removed from DOM, the browser throws an exception when accessing window.top
    //and window.frameElement. Fortunately, setTimeout is set to undefined in this case.
    if (!win.setTimeout)
        return false;

    //NOTE: Cross-domain iframes in Firefox have null in frameElement even if they are in DOM
    //But Firefox doesn't execute scripts in removed iframes, so we suppose that the iframe is in DOM
    if (browserUtils.isMozilla && win.top !== win.self && !win.frameElement)
        return true;

    try {
        //NOTE: This raises a cross-domain policy error in WebKit-based browsers.
        return !!(win.frameElement && win.frameElement.contentDocument);
    }
    catch (e) {
        return !!win.top;
    }
}

export function isTopWindow (win) {
    try {
        //NOTE: MS Edge throws an exception when trying to access window.top from an iframe removed from DOM
        return win.top === win.self;
    }
    catch (e) {
        return false;
    }
}

export var findDocument                               = hammerhead.utils.dom.findDocument;
export var getActiveElement                           = hammerhead.utils.dom.getActiveElement;
export var getChildVisibleIndex                       = hammerhead.utils.dom.getChildVisibleIndex;
export var getIFrameByElement                         = hammerhead.utils.dom.getIFrameByElement;
export var getIFrameByWindow                          = hammerhead.utils.dom.getIFrameByWindow;
export var getScrollbarSize                           = hammerhead.utils.dom.getScrollbarSize;
export var getSelectParent                            = hammerhead.utils.dom.getSelectParent;
export var getSelectVisibleChildren                   = hammerhead.utils.dom.getSelectVisibleChildren;
export var isContentEditableElement                   = hammerhead.utils.dom.isContentEditableElement;
export var isCrossDomainWindows                       = hammerhead.utils.dom.isCrossDomainWindows;
export var isDomElement                               = hammerhead.utils.dom.isDomElement;
export var isElementInDocument                        = hammerhead.utils.dom.isElementInDocument;
export var isElementInIframe                          = hammerhead.utils.dom.isElementInIframe;
export var isFileInput                                = hammerhead.utils.dom.isFileInput;
export var isHammerheadAttr                           = hammerhead.utils.dom.isHammerheadAttr;
export var isInputWithoutSelectionPropertiesInMozilla = hammerhead.utils.dom.isInputWithoutSelectionPropertiesInMozilla;
export var isRenderedNode                             = hammerhead.utils.dom.isRenderedNode;
export var isShadowUIElement                          = hammerhead.utils.dom.isShadowUIElement;
export var isSVGElement                               = hammerhead.utils.dom.isSVGElement;
export var isTextEditableElement                      = hammerhead.utils.dom.isTextEditableElement;
export var isTextEditableElementAndEditingAllowed     = hammerhead.utils.dom.isTextEditableElementAndEditingAllowed;
export var isTextEditableInput                        = hammerhead.utils.dom.isTextEditableInput;
export var isTextNode                                 = hammerhead.utils.dom.isTextNode;
export var isWindowInstance                           = hammerhead.utils.dom.isWindow;
export var isDocumentInstance                         = hammerhead.utils.dom.isDocument;
