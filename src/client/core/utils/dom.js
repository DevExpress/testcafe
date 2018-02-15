import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as arrayUtils from './array';


var browserUtils  = hammerhead.utils.browser;
var nativeMethods = hammerhead.nativeMethods;

export var getActiveElement                       = hammerhead.utils.dom.getActiveElement;
export var findDocument                           = hammerhead.utils.dom.findDocument;
export var isElementInDocument                    = hammerhead.utils.dom.isElementInDocument;
export var isElementInIframe                      = hammerhead.utils.dom.isElementInIframe;
export var getIframeByElement                     = hammerhead.utils.dom.getIframeByElement;
export var isCrossDomainWindows                   = hammerhead.utils.dom.isCrossDomainWindows;
export var getSelectParent                        = hammerhead.utils.dom.getSelectParent;
export var getChildVisibleIndex                   = hammerhead.utils.dom.getChildVisibleIndex;
export var getSelectVisibleChildren               = hammerhead.utils.dom.getSelectVisibleChildren;
export var isElementNode                          = hammerhead.utils.dom.isElementNode;
export var isTextNode                             = hammerhead.utils.dom.isTextNode;
export var isRenderedNode                         = hammerhead.utils.dom.isRenderedNode;
export var isIframeElement                        = hammerhead.utils.dom.isIframeElement;
export var isInputElement                         = hammerhead.utils.dom.isInputElement;
export var isButtonElement                        = hammerhead.utils.dom.isButtonElement;
export var isFileInput                            = hammerhead.utils.dom.isFileInput;
export var isTextAreaElement                      = hammerhead.utils.dom.isTextAreaElement;
export var isAnchorElement                        = hammerhead.utils.dom.isAnchorElement;
export var isImgElement                           = hammerhead.utils.dom.isImgElement;
export var isFormElement                          = hammerhead.utils.dom.isFormElement;
export var isSelectElement                        = hammerhead.utils.dom.isSelectElement;
export var isOptionElement                        = hammerhead.utils.dom.isOptionElement;
export var isSVGElement                           = hammerhead.utils.dom.isSVGElement;
export var isMapElement                           = hammerhead.utils.dom.isMapElement;
export var isBodyElement                          = hammerhead.utils.dom.isBodyElement;
export var isHtmlElement                          = hammerhead.utils.dom.isHtmlElement;
export var isDocument                             = hammerhead.utils.dom.isDocument;
export var isWindow                               = hammerhead.utils.dom.isWindow;
export var isTextEditableInput                    = hammerhead.utils.dom.isTextEditableInput;
export var isTextEditableElement                  = hammerhead.utils.dom.isTextEditableElement;
export var isTextEditableElementAndEditingAllowed = hammerhead.utils.dom.isTextEditableElementAndEditingAllowed;
export var isContentEditableElement               = hammerhead.utils.dom.isContentEditableElement;
export var isDomElement                           = hammerhead.utils.dom.isDomElement;
export var isShadowUIElement                      = hammerhead.utils.dom.isShadowUIElement;
export var isElementFocusable                     = hammerhead.utils.dom.isElementFocusable;
export var isHammerheadAttr                       = hammerhead.utils.dom.isHammerheadAttr;
export var isElementReadOnly                      = hammerhead.utils.dom.isElementReadOnly;
export var getScrollbarSize                       = hammerhead.utils.dom.getScrollbarSize;
export var getMapContainer                        = hammerhead.utils.dom.getMapContainer;
export var getTagName                             = hammerhead.utils.dom.getTagName;
export var closest                                = hammerhead.utils.dom.closest;
export var getParents                             = hammerhead.utils.dom.getParents;
export var getTopSameDomainWindow                 = hammerhead.utils.dom.getTopSameDomainWindow;

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
    var iFrames = arrayUtils.filter(elements, el => isIframeElement(el));

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
    var i                     = 0;

    for (i = 0; i < sortedIFrames.length; i++) {
        //NOTE: We can get elements of the same domain iframe only
        try {
            iframeFocusedElements = getFocusableElements(sortedIFrames[i].contentDocument);
        }
        catch (e) {
            iframeFocusedElements = [];
        }

        iFramesElements.push(sortElementsByFocusingIndex(iframeFocusedElements));
    }

    for (i = 0; i < elements.length; i++) {
        results.push(elements[i]);

        if (isIframeElement(elements[i])) {
            if (browserUtils.isIE) {
                results.pop();

                var iFrameElements               = iFramesElements[arrayUtils.indexOf(iFrames, elements[i])];
                var elementsWithTabIndex         = getElementsWithTabIndex(iFrameElements);
                var elementsWithoutTabIndexArray = getElementsWithoutTabIndex(iFrameElements);

                elementsWithTabIndex = elementsWithTabIndex.sort(sortBy('tabIndex'));
                results              = results.concat(elementsWithTabIndex);
                results.push(elements[i]);
                results = results.concat(elementsWithoutTabIndexArray);
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
    var element             = null;
    var tagName             = null;
    var tabIndex            = null;

    var needPush = false;

    for (var i = 0; i < allElements.length; i++) {
        element  = allElements[i];
        tagName  = getTagName(element);
        tabIndex = getTabIndexAttributeIntValue(element);
        needPush = false;

        if (element.disabled)
            continue;

        if (styleUtils.get(element, 'display') === 'none' || styleUtils.get(element, 'visibility') === 'hidden')
            continue;

        if ((browserUtils.isIE || browserUtils.isAndroid) && isOptionElement(element))
            continue;

        if (tabIndex !== null && tabIndex < 0)
            continue;

        if (inputElementsRegExp.test(tagName))
            needPush = true;
        else if (browserUtils.isIE && isIframeElement(element))
            focusableElements.push(element);
        else if (isAnchorElement(element) && element.hasAttribute('href'))
            needPush = element.getAttribute('href') !== '' || !browserUtils.isIE || tabIndex !== null;

        var contentEditableAttr = element.getAttribute('contenteditable');

        if (contentEditableAttr === '' || contentEditableAttr === 'true')
            needPush = true;

        if (tabIndex !== null)
            needPush = true;

        if (needPush)
            focusableElements.push(element);
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
        tabIndex = parseInt(tabIndex, 10);
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
    var textareaValue = getTextAreaValue(textarea);

    if (!textareaValue)
        return 0;

    var topPart      = textareaValue.substring(0, position);
    var linePosition = topPart.lastIndexOf('\n') === -1 ? 0 : topPart.lastIndexOf('\n') + 1;

    return position - linePosition;
}

export function getTextareaLineNumberByPosition (textarea, position) {
    var textareaValue = getTextAreaValue(textarea);
    var lines         = textareaValue.split('\n');
    var topPartLength = 0;
    var line          = 0;

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
    var textareaValue = getTextAreaValue(textarea);
    var lines         = textareaValue.split('\n');
    var lineIndex     = 0;

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

export function isElementContainsNode (parentElement, childNode) {
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

    return checkChildNodes(parentElement, childNode);
}

export function isOptionGroupElement (element) {
    return hammerhead.utils.dom.instanceToString(element) === '[object HTMLOptGroupElement]';
}

export function getElementIndexInParent (parent, child) {
    var children = parent.querySelectorAll(getTagName(child));

    return arrayUtils.indexOf(children, child);

}

export function isTheSameNode (node1, node2) {
    //NOTE: Mozilla has not isSameNode method
    if (node1 && node2 && node1.isSameNode)
        return node1.isSameNode(node2);

    return node1 === node2;
}

export function getElementDescription (el) {
    var attributes = {
        id:      'id',
        name:    'name',
        'class': 'className'
    };

    var res = [];

    res.push('<');
    res.push(getTagName(el));

    for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
            var val = el[attributes[attr]];

            if (val)
                res.push(' ' + attr + '="' + val + '"');
        }
    }

    res.push('>');

    return res.join('');
}

export function getNextFocusableElement (element, reverse) {
    var offset       = reverse ? -1 : 1;
    var allFocusable = sortElementsByFocusingIndex(getFocusableElements(findDocument(element)));

    //NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
    // in Mozilla and Opera focus sets on any radio set.
    if (isInputElement(element) && element.type === 'radio' && element.name !== '' && !browserUtils.isFirefox) {
        allFocusable = arrayUtils.filter(allFocusable, item => {
            return !item.name || item === element || item.name !== element.name;
        });
    }

    var currentIndex         = arrayUtils.indexOf(allFocusable, element);
    var isLastElementFocused = reverse ? currentIndex === 0 : currentIndex === allFocusable.length - 1;

    if (isLastElementFocused)
        return document.body;

    if (reverse && currentIndex === -1)
        return allFocusable[allFocusable.length - 1];

    return allFocusable[currentIndex + offset];
}

export function getFocusableParent (el) {
    var parents = getParents(el);

    for (var i = 0; i < parents.length; i++) {
        if (isElementFocusable(parents[i]))
            return parents[i];
    }

    return null;
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

    var frameElement = null;

    try {
        //NOTE: This may raise a cross-domain policy error in some browsers.
        frameElement = win.frameElement;
    }
    catch (e) {
        return !!win.top;
    }

    // NOTE: in Firefox and WebKit, frameElement is null for cross-domain iframes even if they are in the DOM.
    // But these browsers don't execute scripts in removed iframes, so we suppose that the iframe is in the DOM.
    if ((browserUtils.isFirefox || browserUtils.isWebKit) && win.top !== win && !frameElement)
        return true;

    return !!(frameElement && frameElement.contentDocument);
}

export function isTopWindow (win) {
    try {
        //NOTE: MS Edge throws an exception when trying to access window.top from an iframe removed from DOM
        return win.top === win;
    }
    catch (e) {
        return false;
    }
}

export function findIframeByWindow (iframeWindow, iframeDestinationWindow) {
    var iframes = (iframeDestinationWindow || window).document.getElementsByTagName('iframe');

    for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === iframeWindow)
            return iframes[i];
    }

    return null;
}

export function isEditableFormElement (element) {
    return isTextEditableElement(element) || isSelectElement(element);
}

export function getCommonAncestor (element1, element2) {
    if (isTheSameNode(element1, element2))
        return element1;

    var el1Parents     = [element1].concat(getParents(element1));
    var commonAncestor = element2;

    while (commonAncestor) {
        if (arrayUtils.indexOf(el1Parents, commonAncestor) > -1)
            return commonAncestor;

        commonAncestor = commonAncestor.parentNode;
    }

    return commonAncestor;
}

export function getChildrenLength (children) {
    return nativeMethods.htmlCollectionLengthGetter.call(children);
}

export function getChildNodesLength (childNodes) {
    return nativeMethods.nodeListLengthGetter.call(childNodes);
}

export function getInputValue (input) {
    return nativeMethods.inputValueGetter.call(input);
}

export function getTextAreaValue (textArea) {
    return nativeMethods.textAreaValueGetter.call(textArea);
}

export function setInputValue (input, value) {
    return nativeMethods.inputValueSetter.call(input, value);
}

export function setTextAreaValue (textArea, value) {
    return nativeMethods.textAreaValueSetter.call(textArea, value);
}

export function getElementValue (element) {
    if (isInputElement(element))
        return getInputValue(element);
    else if (isTextAreaElement(element))
        return getTextAreaValue(element);

    /*eslint-disable no-restricted-properties*/
    return element.value;
    /*eslint-enable no-restricted-properties*/
}

export function setElementValue (element, value) {
    if (isInputElement(element))
        return setInputValue(element, value);
    else if (isTextAreaElement(element))
        return setTextAreaValue(element, value);

    /*eslint-disable no-restricted-properties*/
    element.value = value;
    /*eslint-enable no-restricted-properties*/

    return value;
}
