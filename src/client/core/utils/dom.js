import hammerhead from '../deps/hammerhead';
import * as arrayUtils from './array';

const browserUtils  = hammerhead.utils.browser;
const nativeMethods = hammerhead.nativeMethods;

// NOTE: We have to retrieve styleUtils.get from hammerhead
// to avoid circular dependencies between domUtils and styleUtils
const getElementStyleProperty = hammerhead.utils.style.get;

export const getActiveElement                       = hammerhead.utils.dom.getActiveElement;
export const findDocument                           = hammerhead.utils.dom.findDocument;
export const find                                   = hammerhead.utils.dom.find;
export const isElementInDocument                    = hammerhead.utils.dom.isElementInDocument;
export const isElementInIframe                      = hammerhead.utils.dom.isElementInIframe;
export const getIframeByElement                     = hammerhead.utils.dom.getIframeByElement;
export const isCrossDomainWindows                   = hammerhead.utils.dom.isCrossDomainWindows;
export const getSelectParent                        = hammerhead.utils.dom.getSelectParent;
export const getChildVisibleIndex                   = hammerhead.utils.dom.getChildVisibleIndex;
export const getSelectVisibleChildren               = hammerhead.utils.dom.getSelectVisibleChildren;
export const isElementNode                          = hammerhead.utils.dom.isElementNode;
export const isTextNode                             = hammerhead.utils.dom.isTextNode;
export const isRenderedNode                         = hammerhead.utils.dom.isRenderedNode;
export const isIframeElement                        = hammerhead.utils.dom.isIframeElement;
export const isInputElement                         = hammerhead.utils.dom.isInputElement;
export const isButtonElement                        = hammerhead.utils.dom.isButtonElement;
export const isFileInput                            = hammerhead.utils.dom.isFileInput;
export const isTextAreaElement                      = hammerhead.utils.dom.isTextAreaElement;
export const isAnchorElement                        = hammerhead.utils.dom.isAnchorElement;
export const isImgElement                           = hammerhead.utils.dom.isImgElement;
export const isFormElement                          = hammerhead.utils.dom.isFormElement;
export const isLabelElement                         = hammerhead.utils.dom.isLabelElement;
export const isSelectElement                        = hammerhead.utils.dom.isSelectElement;
export const isRadioButtonElement                   = hammerhead.utils.dom.isRadioButtonElement;
export const isColorInputElement                    = hammerhead.utils.dom.isColorInputElement;
export const isCheckboxElement                      = hammerhead.utils.dom.isCheckboxElement;
export const isOptionElement                        = hammerhead.utils.dom.isOptionElement;
export const isSVGElement                           = hammerhead.utils.dom.isSVGElement;
export const isMapElement                           = hammerhead.utils.dom.isMapElement;
export const isBodyElement                          = hammerhead.utils.dom.isBodyElement;
export const isHtmlElement                          = hammerhead.utils.dom.isHtmlElement;
export const isDocument                             = hammerhead.utils.dom.isDocument;
export const isWindow                               = hammerhead.utils.dom.isWindow;
export const isTextEditableInput                    = hammerhead.utils.dom.isTextEditableInput;
export const isTextEditableElement                  = hammerhead.utils.dom.isTextEditableElement;
export const isTextEditableElementAndEditingAllowed = hammerhead.utils.dom.isTextEditableElementAndEditingAllowed;
export const isContentEditableElement               = hammerhead.utils.dom.isContentEditableElement;
export const isDomElement                           = hammerhead.utils.dom.isDomElement;
export const isShadowUIElement                      = hammerhead.utils.dom.isShadowUIElement;
export const isShadowRoot                           = hammerhead.utils.dom.isShadowRoot;
export const isElementFocusable                     = hammerhead.utils.dom.isElementFocusable;
export const isHammerheadAttr                       = hammerhead.utils.dom.isHammerheadAttr;
export const isElementReadOnly                      = hammerhead.utils.dom.isElementReadOnly;
export const getScrollbarSize                       = hammerhead.utils.dom.getScrollbarSize;
export const getMapContainer                        = hammerhead.utils.dom.getMapContainer;
export const getTagName                             = hammerhead.utils.dom.getTagName;
export const closest                                = hammerhead.utils.dom.closest;
export const getParents                             = hammerhead.utils.dom.getParents;
export const findParent                             = hammerhead.utils.dom.findParent;
export const getTopSameDomainWindow                 = hammerhead.utils.dom.getTopSameDomainWindow;
export const getParentExceptShadowRoot              = hammerhead.utils.dom.getParentExceptShadowRoot;

function canFocus (element, parent, tabIndex) {
    let activeElement = null;

    if (parent.nodeType === Node.DOCUMENT_NODE)
        activeElement = nativeMethods.documentActiveElementGetter.call(parent);

    if (element === activeElement)
        return true;

    if (element.disabled)
        return false;

    if (getElementStyleProperty(element, 'display') === 'none' || getElementStyleProperty(element, 'visibility') === 'hidden')
        return false;

    if ((browserUtils.isIE || browserUtils.isAndroid) && isOptionElement(element))
        return false;

    if (tabIndex !== null && tabIndex < 0)
        return false;

    return true;
}

function wrapElement (el) {
    return {
        el:       el,
        skip:     el.shadowRoot && el.tabIndex < 0,
        children: {},
    };
}

function buildFocusableTree (parent, sort) {
    const node = wrapElement(parent);

    parent = parent.shadowRoot || parent;

    if (isIframeElement(parent))
        parent = nativeMethods.contentDocumentGetter.call(parent);

    if (parent && (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || parent.nodeType === Node.DOCUMENT_NODE)) {
        const elements = filterFocusableElements(parent);

        for (const el of elements) {
            const key = !sort || el.tabIndex <= 0 ? -1 : el.tabIndex;

            node.children[key] = node.children[key] || [];

            node.children[key].push(buildFocusableTree(el, sort));
        }
    }

    return node;
}

function filterFocusableElements (parent) {
    // NOTE: We don't take into account the case of embedded contentEditable
    // elements and specify the contentEditable attribute for focusable elements
    const allElements           = parent.querySelectorAll('*');
    const invisibleElements     = getInvisibleElements(allElements);
    const inputElementsRegExp   = /^(input|button|select|textarea)$/;
    const focusableElements     = [];

    let element  = null;
    let tagName  = null;
    let tabIndex = null;

    let needPush = false;

    for (let i = 0; i < allElements.length; i++) {
        element  = allElements[i];
        tagName  = getTagName(element);
        tabIndex = getTabIndexAttributeIntValue(element);
        needPush = false;

        if (!canFocus(element, parent, tabIndex))
            continue;

        if (inputElementsRegExp.test(tagName))
            needPush = true;
        else if (element.shadowRoot)
            needPush = true;
        else if (isIframeElement(element))
            needPush = true;
        else if (isAnchorElement(element) && element.hasAttribute('href'))
            needPush = element.getAttribute('href') !== '' || !browserUtils.isIE || tabIndex !== null;

        const contentEditableAttr = element.getAttribute('contenteditable');

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

function flattenFocusableTree (node) {
    const result = [];

    if (!node.skip && node.el.nodeType !== Node.DOCUMENT_NODE && !isIframeElement(node.el))
        result.push(node.el);

    for (const prop in node.children) {
        for (const childNode of node.children[prop])
            result.push(...flattenFocusableTree(childNode));
    }

    return result;
}


export function getFocusableElements (doc, sort = false) {
    const root = buildFocusableTree(doc, sort);

    return flattenFocusableTree(root);
}

function getInvisibleElements (elements) {
    const invisibleElements = [];

    for (let i = 0; i < elements.length; i++) {
        if (getElementStyleProperty(elements[i], 'display') === 'none')
            invisibleElements.push(elements[i]);
    }

    return invisibleElements;
}

export function getTabIndexAttributeIntValue (el) {
    let tabIndex = nativeMethods.getAttribute.call(el, 'tabindex');

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
    const textareaValue = getTextAreaValue(textarea);

    if (!textareaValue)
        return 0;

    const topPart      = textareaValue.substring(0, position);
    const linePosition = topPart.lastIndexOf('\n') === -1 ? 0 : topPart.lastIndexOf('\n') + 1;

    return position - linePosition;
}

export function getTextareaLineNumberByPosition (textarea, position) {
    const textareaValue = getTextAreaValue(textarea);
    const lines         = textareaValue.split('\n');
    let topPartLength   = 0;
    let line            = 0;

    for (let i = 0; topPartLength <= position; i++) {
        if (position <= topPartLength + lines[i].length) {
            line = i;

            break;
        }

        topPartLength += lines[i].length + 1;
    }

    return line;
}

export function getTextareaPositionByLineAndOffset (textarea, line, offset) {
    const textareaValue = getTextAreaValue(textarea);
    const lines         = textareaValue.split('\n');
    let lineIndex       = 0;

    for (let i = 0; i < line; i++)
        lineIndex += lines[i].length + 1;

    return lineIndex + offset;
}

// NOTE: the form is also submitted on enter key press if there is only one input of certain
// types (referred to as types that block implicit submission in the HTML5 standard) on the
// form and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
export function blocksImplicitSubmission (el) {
    let inputTypeRegExp = null;

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
    if (isTheSameNode(childNode, parentElement))
        return true;

    const childNodes = nativeMethods.nodeChildNodesGetter.call(parentElement);
    const length     = getChildNodesLength(childNodes);

    for (let i = 0; i < length; i++) {
        const el = childNodes[i];

        if (!isShadowUIElement(el) && isElementContainsNode(el, childNode))
            return true;
    }

    return false;
}

export function isOptionGroupElement (element) {
    return hammerhead.utils.dom.instanceToString(element) === '[object HTMLOptGroupElement]';
}

export function getElementIndexInParent (parent, child) {
    const children = parent.querySelectorAll(getTagName(child));

    return arrayUtils.indexOf(children, child);

}

export function isTheSameNode (node1, node2) {
    //NOTE: Mozilla has not isSameNode method
    if (node1 && node2 && node1.isSameNode)
        return node1.isSameNode(node2);

    return node1 === node2;
}

export function getElementDescription (el) {
    const attributes = {
        id:      'id',
        name:    'name',
        'class': 'className',
    };

    const res = [];

    res.push('<');
    res.push(getTagName(el));

    for (const attr in attributes) {
        if (attributes.hasOwnProperty(attr)) { //eslint-disable-line no-prototype-builtins
            const val = el[attributes[attr]];

            if (val)
                res.push(' ' + attr + '="' + val + '"');
        }
    }

    res.push('>');

    return res.join('');
}

export function getFocusableParent (el) {
    const parents = getParents(el);

    for (let i = 0; i < parents.length; i++) {
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

    let frameElement = null;

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

    return !!(frameElement && nativeMethods.contentDocumentGetter.call(frameElement));
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

export function findIframeByWindow (iframeWindow) {
    const iframes = [];

    find(document, '*', elem => {
        if (elem.tagName === 'IFRAME')
            iframes.push(elem);

        if (elem.shadowRoot)
            find(elem.shadowRoot, 'iframe', iframe => iframes.push(iframe));
    });

    for (let i = 0; i < iframes.length; i++) {
        if (nativeMethods.contentWindowGetter.call(iframes[i]) === iframeWindow)
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

    const el1Parents   = [element1].concat(getParents(element1));
    let commonAncestor = element2;

    while (commonAncestor) {
        if (arrayUtils.indexOf(el1Parents, commonAncestor) > -1)
            return commonAncestor;

        commonAncestor = nativeMethods.nodeParentNodeGetter.call(commonAncestor);
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

export function isShadowElement (element) {
    return element && element.getRootNode && findDocument(element) !== element.getRootNode();
}

export function contains (element, target) {
    if (!element || !target)
        return false;

    if (element.contains)
        return element.contains(target);

    return !!findParent(target, true, node => node === element);
}

export function isNodeEqual (el1, el2) {
    return el1 === el2;
}

export function getNodeText (el) {
    return nativeMethods.nodeTextContentGetter.call(el);
}

export function getImgMapName (img) {
    return img.useMap.substring(1);
}

export function getDocumentElement (win) {
    return win.document.documentElement;
}

export function isDocumentElement (el) {
    return el === document.documentElement;
}

