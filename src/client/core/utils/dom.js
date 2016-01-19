import escapeHTML from 'escape-html';
import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as arrayUtils from './array';


var browserUtils = hammerhead.utils.browser;

function getElementsWithTabIndex (elements) {
    return arrayUtils.filter(elements, el => el.tabIndex > 0);
}

function getElementsWithoutTabIndex (elements) {
    return arrayUtils.filter(elements, el => el.tabIndex <= 0);
}

function sortElementsByFocusingIndex (elements) {
    if (!elements || !elements.length)
        return [];

    var elementsWithTabIndex = getElementsWithTabIndex(elements);

    //iFrames
    var iFrames = arrayUtils.filter(elements, el => el.tagName.toLowerCase() === 'iframe');

    if (!elementsWithTabIndex.length) {
        if (iFrames.length)
            elements = insertIFramesContentElements(elements, iFrames);

        return elements;
    }

    elementsWithTabIndex        = elementsWithTabIndex.sort(sortBy('tabIndex'));
    var elementsWithoutTabIndex = getElementsWithoutTabIndex(elements);

    if (iFrames.length)
        return insertIFramesContentElements(elementsWithTabIndex, iFrames).concat(insertIFramesContentElements(elementsWithoutTabIndex, iFrames));

    return elementsWithTabIndex.concat(elementsWithoutTabIndex);
}

function insertIFramesContentElements (elements, iFrames) {
    var sortedIFrames         = sortElementsByTabIndex(iFrames);
    var results               = [];
    var iFramesElements       = [];
    var iframeFocusedElements = [];

    for (var i = 0; i < sortedIFrames.length; i++) {
        //NOTE: We can get elements of the same domain iframe only
        try {
            iframeFocusedElements = getFocusableElements(sortedIFrames[i].contentDocument);
        }
        catch (e) {
            iframeFocusedElements = [];
        }

        iFramesElements.push(sortElementsByFocusingIndex(iframeFocusedElements));
    }

    for (var i = 0; i < elements.length; i++) {
        results.push(elements[i]);

        if (elements[i].tagName.toLowerCase() === 'iframe') {
            if (browserUtils.isIE) {
                results.pop();

                var iFrameElements               = iFramesElements[arrayUtils.indexOf(iFrames, elements[i])];
                var elementsWithTabIndex         = getElementsWithTabIndex(iFrameElements);
                var elementsWithoutTabIndexArray = getElementsWithoutTabIndex(iFrameElements);

                elementsWithTabIndex = elementsWithTabIndex.sort(sortBy('tabIndex'));
                results              = results.concat(elementsWithTabIndex);
                results.push(elements[i]);
                results              = results.concat(elementsWithoutTabIndexArray);
            }
            else {
                if (browserUtils.isWebKit && iFramesElements[arrayUtils.indexOf(iFrames, elements[i])].length)
                    results.pop();

                results = results.concat(iFramesElements[arrayUtils.indexOf(iFrames, elements[i])]);
            }
        }
    }

    return results;
}

function sortElementsByTabIndex (elements) {
    var elementsWithTabIndex = getElementsWithTabIndex(elements);

    if (!elementsWithTabIndex.length)
        return elements;

    return elementsWithTabIndex.sort(sortBy('tabIndex')).concat(getElementsWithoutTabIndex(elements));
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

function getFocusableElements (doc) {
    // NOTE: We don't take into account the case of embedded contentEditable
    // elements and specify the contentEditable attribute for focusable elements
    var allElements         = doc.querySelectorAll('*');
    var invisibleElements   = getInvisibleElements(allElements);
    var inputElementsRegExp = /^(input|button|select|textarea)$/;
    var focusableElements   = [];
    var el                  = null;
    var tagName             = null;
    var tabIndex            = null;

    var needPush = false;

    for (var i = 0; i < allElements.length; i++) {
        el       = allElements[i];
        tagName  = el.tagName.toLowerCase();
        tabIndex = getTabIndexAttributeIntValue(el);
        needPush = false;

        if (el.disabled)
            continue;

        if (styleUtils.get(el, 'display') === 'none' || styleUtils.get(el, 'visibility') === 'hidden')
            continue;

        if (browserUtils.isIE && tagName === 'option')
            continue;

        if (tabIndex !== null && tabIndex < 0)
            continue;

        if (inputElementsRegExp.test(tagName))
            needPush = true;
        else if (browserUtils.isIE && tagName === 'iframe')
            focusableElements.push(el);
        else if (!browserUtils.isOpera && tagName === 'a' && el.hasAttribute('href'))
            needPush = el.getAttribute('href') !== '' || !browserUtils.isIE || tabIndex !== null;

        var contentEditableAttr = el.getAttribute('contenteditable');

        if (contentEditableAttr === '' || contentEditableAttr === "true")
            needPush = true;

        if (tabIndex !== null)
            needPush = true;

        if (needPush)
            focusableElements.push(el);
    }

    //NOTE: remove children of invisible elements
    return arrayUtils.filter(focusableElements, el => !containsElement(invisibleElements, el));
}

function getInvisibleElements (elements) {
    var invisibleElements = [];

    for (var i = 0; i < elements.length; i++) {
        if (styleUtils.get(elements[i], 'display') === 'none')
            invisibleElements.push(elements[i]);
    }

    return invisibleElements;
}

function getTabIndexAttributeIntValue (el) {
    var tabIndex = el.getAttribute('tabIndex');

    if (tabIndex !== null) {
        tabIndex = parseInt(tabIndex);
        tabIndex = isNaN(tabIndex) ? null : tabIndex;
    }

    return tabIndex;
}

export function containsElement (elements, element) {
    if (elements.contains)
        return elements.contains(element);

    return arrayUtils.some(elements, parent => parent.contains(element));
}

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

// NOTE: the form is also submitted on enter key press if there is only one input of certain
// types (referred to as types that block implicit submission in the HTML5 standard) on the
// form and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
export function blocksImplicitSubmission (el) {
    var inputTypeRegExp = null;

    if (browserUtils.isSafari)
        inputTypeRegExp = /^(text|password|color|date|time|datetime|datetime-local|email|month|number|search|tel|url|week|image)$/i;
    else if (browserUtils.isFirefox)
        inputTypeRegExp = /^(text|password|date|time|datetime|datetime-local|email|month|number|search|tel|url|week|image)$/i;
    else if (browserUtils.isIE)
        inputTypeRegExp = /^(text|password|color|date|time|datetime|datetime-local|email|file|month|number|search|tel|url|week|image)$/i;
    else
        inputTypeRegExp = /^(text|password|datetime|email|number|search|tel|url|image)$/i;

    return inputTypeRegExp.test(el.type);
}

export function isEditableElement (el, checkEditingAllowed) {
    return checkEditingAllowed ?
           isTextEditableElementAndEditingAllowed(el) || isContentEditableElement(el) :
           isTextEditableElement(el) || isContentEditableElement(el);
}

export function isElementContainsNode (el, node) {
    var contains = false;

    function checkChildNodes (el, node) {
        if (contains || isTheSameNode(node, el))
            contains = true;

        for (var i = 0; i < el.childNodes.length; i++) {
            contains = checkChildNodes(el.childNodes[i], node);

            if (contains)
                return contains;
        }

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
            id:      'id',
            name:    'name',
            'class': 'className'
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

export function getNextFocusableElement (element, reverse) {
    var offset       = reverse ? -1 : 1,
        allFocusable = sortElementsByFocusingIndex(getFocusableElements(findDocument(element)));

    //NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
    // in Mozilla and Opera focus sets on any radio set.
    if (element.tagName === "INPUT" && element.type === "radio" && element.name !== "" &&
        !(browserUtils.isFirefox || browserUtils.isOpera))
        allFocusable = arrayUtils.filter(allFocusable, item => {
            return !item.name || item === element || item.name !== element.name;
        });

    var currentIndex         = arrayUtils.indexOf(allFocusable, element);
    var isLastElementFocused = reverse ? currentIndex === 0 : currentIndex === allFocusable.length - 1;

    if (isLastElementFocused)
        return document.body;

    if (reverse && currentIndex === -1)
        return allFocusable[allFocusable.length - 1];

    return allFocusable[currentIndex + offset];
}

export function isElementFocusable (element) {
    var tagName           = element.tagName.toLowerCase();
    var focusableElements = getFocusableElements(findDocument(element));
    var isFocusable       = (arrayUtils.indexOf(focusableElements, element) !== -1 || tagName === 'body')
                            && !element.disabled && element.tabIndex >= 0;

    if (!isFocusable)
        return isFocusable;

    if ((browserUtils.isWebKit || browserUtils.isOpera) && tagName === 'option')
        return isFocusable;

    return !styleUtils.isElementHidden(element) && styleUtils.get(element, 'visibility') !== 'hidden';
}

export function getParents (el, selector) {
    var parent  = el.parentNode;
    var parents = [];

    while (parent) {
        if (parent.nodeType === 1 && (!selector || (selector && hammerhead.utils.dom.matches(parent, selector))))
            parents.push(parent);

        parent = parent.parentNode;
    }

    return parents;
}

export function remove (el) {
    if (el && el.parentElement)
        el.parentElement.removeChild(el);
}

export function isIFrameWindowInDOM (win) {
    //NOTE: In MS Edge, if an iframe is removed from DOM, the browser throws an exception when accessing window.top
    //and window.frameElement. Fortunately, setTimeout is set to undefined in this case.
    if (!win.setTimeout)
        return false;

    //NOTE: Cross-domain iframes in Firefox have null in frameElement even if they are in DOM
    //But Firefox doesn't execute scripts in removed iframes, so we suppose that the iframe is in DOM
    if (browserUtils.isFirefox && win.top !== win.self && !win.frameElement)
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

export function isDocumentRootElement (element) {
    return element.tagName && element.tagName.toLowerCase() === 'html';
}

export function findIframeInTopWindow (iframeWindow) {
    var iframes = window.top.document.getElementsByTagName('iframe');

    for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === iframeWindow)
            return iframes[i];
    }

    return null;
}

export var findDocument                               = hammerhead.utils.dom.findDocument;
export var getActiveElement                           = hammerhead.utils.dom.getActiveElement;
export var getChildVisibleIndex                       = hammerhead.utils.dom.getChildVisibleIndex;
export var getIframeByElement                         = hammerhead.utils.dom.getIframeByElement;
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
export var isInputWithoutSelectionPropertiesInFirefox = hammerhead.utils.dom.isInputWithoutSelectionPropertiesInFirefox;
export var isRenderedNode                             = hammerhead.utils.dom.isRenderedNode;
export var isShadowUIElement                          = hammerhead.utils.dom.isShadowUIElement;
export var isSVGElement                               = hammerhead.utils.dom.isSVGElement;
export var isTextEditableElement                      = hammerhead.utils.dom.isTextEditableElement;
export var isTextEditableElementAndEditingAllowed     = hammerhead.utils.dom.isTextEditableElementAndEditingAllowed;
export var isTextEditableInput                        = hammerhead.utils.dom.isTextEditableInput;
export var isTextNode                                 = hammerhead.utils.dom.isTextNode;
export var isMapElement                               = hammerhead.utils.dom.isMapElement;
export var getMapContainer                            = hammerhead.utils.dom.getMapContainer;
export var isWindowInstance                           = hammerhead.utils.dom.isWindow;
export var isDocumentInstance                         = hammerhead.utils.dom.isDocument;
export var closest                                    = hammerhead.utils.dom.closest;
