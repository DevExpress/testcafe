import * as domUtils from './dom';
import * as arrayUtils from './array';
import * as styleUtils from './style';
import { nativeMethods } from '../deps/hammerhead';

//nodes utils
function getOwnFirstVisibleTextNode (el) {
    const children       = nativeMethods.nodeChildNodesGetter.call(el);
    const childrenLength = domUtils.getChildNodesLength(children);

    if (!childrenLength && isVisibleTextNode(el))
        return el;

    return arrayUtils.find(children, node => isVisibleTextNode(node));
}

function getOwnFirstVisibleNode (el) {
    const cildNodes = nativeMethods.nodeChildNodesGetter.call(el);

    return arrayUtils.find(cildNodes, node => isVisibleTextNode(node) ||
                                                  !isSkippableNode(node) && getOwnFirstVisibleNode(node));
}

function getOwnPreviousVisibleSibling (el) {
    let sibling = null;
    let current = el;

    while (!sibling) {
        current = current.previousSibling;
        if (!current)
            break;
        else if (!isSkippableNode(current) && !isInvisibleTextNode(current)) {
            sibling = current;
            break;
        }
    }
    return sibling;
}

function isVisibleNode (node) {
    return domUtils.isTextNode(node) || domUtils.isElementNode(node) && styleUtils.isElementVisible(node);
}

function getVisibleChildren (node) {
    const childNodes = nativeMethods.nodeChildNodesGetter.call(node);

    return arrayUtils.filter(childNodes, isVisibleNode);
}

function hasVisibleChildren (node) {
    const childNodes = nativeMethods.nodeChildNodesGetter.call(node);

    return arrayUtils.some(childNodes, isVisibleNode);
}

function hasSelectableChildren (node) {
    const childNodes = nativeMethods.nodeChildNodesGetter.call(node);

    return arrayUtils.some(childNodes, child => isNodeSelectable(child, true));
}

//NOTE: before such elements (like div or p) adds line breaks before and after it
// (except line break before first visible element in contentEditable parent)
// this line breaks is not contained in node values
//so we should take it into account manually
function isNodeBlockWithBreakLine (parent, node) {
    let parentFirstVisibleChild = null;
    let firstVisibleChild       = null;

    if (domUtils.isShadowUIElement(parent) || domUtils.isShadowUIElement(node))
        return false;

    const childNodes = nativeMethods.nodeChildNodesGetter.call(node);

    if (!domUtils.isTheSameNode(node, parent) && domUtils.getChildNodesLength(childNodes) &&
        /div|p/.test(domUtils.getTagName(node))) {
        parentFirstVisibleChild = getOwnFirstVisibleNode(parent);

        if (!parentFirstVisibleChild || domUtils.isTheSameNode(node, parentFirstVisibleChild))
            return false;

        firstVisibleChild = getFirstVisibleTextNode(parentFirstVisibleChild);
        if (!firstVisibleChild || domUtils.isTheSameNode(node, firstVisibleChild))
            return false;

        return getOwnFirstVisibleTextNode(node);
    }
    return false;
}

function isNodeAfterNodeBlockWithBreakLine (parent, node) {
    const isRenderedNode        = domUtils.isRenderedNode(node);
    let parentFirstVisibleChild = null;
    let firstVisibleChild       = null;
    let previousSibling         = null;

    if (domUtils.isShadowUIElement(parent) || domUtils.isShadowUIElement(node))
        return false;

    const childNodes = nativeMethods.nodeChildNodesGetter.call(node);

    if (!domUtils.isTheSameNode(node, parent) &&
        (isRenderedNode && domUtils.isElementNode(node) && domUtils.getChildNodesLength(childNodes) &&
         !/div|p/.test(domUtils.getTagName(node)) ||
         isVisibleTextNode(node) && !domUtils.isTheSameNode(node, parent) && node.nodeValue.length)) {

        if (isRenderedNode && domUtils.isElementNode(node)) {
            parentFirstVisibleChild = getOwnFirstVisibleNode(parent);

            if (!parentFirstVisibleChild || domUtils.isTheSameNode(node, parentFirstVisibleChild))
                return false;

            firstVisibleChild = getFirstVisibleTextNode(parentFirstVisibleChild);
            if (!firstVisibleChild || domUtils.isTheSameNode(node, firstVisibleChild))
                return false;
        }

        previousSibling = getOwnPreviousVisibleSibling(node);

        return previousSibling && domUtils.isElementNode(previousSibling) &&
               /div|p/.test(domUtils.getTagName(previousSibling)) && getOwnFirstVisibleTextNode(previousSibling);
    }
    return false;
}

function getFirstTextNode (el, onlyVisible) {
    const children                  = nativeMethods.nodeChildNodesGetter.call(el);
    const childrenLength            = domUtils.getChildNodesLength(children);
    let curNode                     = null;
    let child                       = null;
    let isNotContentEditableElement = null;
    const checkTextNode             = onlyVisible ? isVisibleTextNode : domUtils.isTextNode;

    if (!childrenLength && checkTextNode(el))
        return el;

    for (let i = 0; i < childrenLength; i++) {
        curNode                     = children[i];
        isNotContentEditableElement = domUtils.isElementNode(curNode) && !domUtils.isContentEditableElement(curNode);

        if (checkTextNode(curNode))
            return curNode;
        else if (domUtils.isRenderedNode(curNode) && hasVisibleChildren(curNode) && !isNotContentEditableElement) {
            child = getFirstTextNode(curNode, onlyVisible);

            if (child)
                return child;
        }
    }

    return child;
}

export function getFirstVisibleTextNode (el) {
    return getFirstTextNode(el, true);
}

export function getLastTextNode (el, onlyVisible) {
    const children                  = nativeMethods.nodeChildNodesGetter.call(el);
    const childrenLength            = domUtils.getChildNodesLength(children);
    let curNode                     = null;
    let child                       = null;
    let isNotContentEditableElement = null;
    let visibleTextNode             = null;

    if (!childrenLength && isVisibleTextNode(el))
        return el;

    for (let i = childrenLength - 1; i >= 0; i--) {
        curNode                     = children[i];
        isNotContentEditableElement = domUtils.isElementNode(curNode) && !domUtils.isContentEditableElement(curNode);
        visibleTextNode             = domUtils.isTextNode(curNode) &&
                                      (onlyVisible ? !isInvisibleTextNode(curNode) : true);

        if (visibleTextNode)
            return curNode;
        else if (domUtils.isRenderedNode(curNode) && hasVisibleChildren(curNode) && !isNotContentEditableElement) {
            child = getLastTextNode(curNode, false);

            if (child)
                return child;
        }
    }

    return child;
}

export function getFirstNonWhitespaceSymbolIndex (nodeValue, startFrom) {
    if (!nodeValue || !nodeValue.length)
        return 0;

    const valueLength = nodeValue.length;
    let index       = startFrom || 0;

    for (let i = index; i < valueLength; i++) {
        if (nodeValue.charCodeAt(i) === 10 || nodeValue.charCodeAt(i) === 32)
            index++;
        else
            break;
    }
    return index;
}

export function getLastNonWhitespaceSymbolIndex (nodeValue) {
    if (!nodeValue || !nodeValue.length)
        return 0;

    const valueLength = nodeValue.length;
    let index       = valueLength;

    for (let i = valueLength - 1; i >= 0; i--) {
        if (nodeValue.charCodeAt(i) === 10 || nodeValue.charCodeAt(i) === 32)
            index--;
        else
            break;
    }
    return index;
}

export function isInvisibleTextNode (node) {
    if (!domUtils.isTextNode(node))
        return false;

    const nodeValue         = node.nodeValue;
    const firstVisibleIndex = getFirstNonWhitespaceSymbolIndex(nodeValue);
    const lastVisibleIndex  = getLastNonWhitespaceSymbolIndex(nodeValue);

    return firstVisibleIndex === nodeValue.length && lastVisibleIndex === 0;
}

function isVisibleTextNode (node) {
    return domUtils.isTextNode(node) && !isInvisibleTextNode(node);
}

function isSkippableNode (node) {
    return !domUtils.isRenderedNode(node) || domUtils.isShadowUIElement(node);
}

//dom utils
function hasContentEditableAttr (el) {
    const attrValue = el.getAttribute ? el.getAttribute('contenteditable') : null;

    return attrValue === '' || attrValue === 'true';
}

export function findContentEditableParent (element) {
    const elParents = domUtils.getParents(element);

    if (hasContentEditableAttr(element) && domUtils.isContentEditableElement(element))
        return element;

    const currentDocument = domUtils.findDocument(element);

    if (currentDocument.designMode === 'on')
        return currentDocument.body;

    return arrayUtils.find(elParents, parent => hasContentEditableAttr(parent) &&
                                                domUtils.isContentEditableElement(parent));
}

export function getNearestCommonAncestor (node1, node2) {
    if (domUtils.isTheSameNode(node1, node2)) {
        if (domUtils.isTheSameNode(node2, findContentEditableParent(node1)))
            return node1;
        return nativeMethods.nodeParentNodeGetter.call(node1);
    }

    const ancestors             = [];
    const contentEditableParent = findContentEditableParent(node1);
    let curNode               = null;

    if (!domUtils.isElementContainsNode(contentEditableParent, node2))
        return null;

    for (curNode = node1; curNode !== contentEditableParent; curNode = nativeMethods.nodeParentNodeGetter.call(curNode))
        ancestors.push(curNode);

    for (curNode = node2; curNode !== contentEditableParent; curNode = nativeMethods.nodeParentNodeGetter.call(curNode)) {
        if (arrayUtils.indexOf(ancestors, curNode) !== -1)
            return curNode;
    }

    return contentEditableParent;
}

//selection utils
function getSelectedPositionInParentByOffset (node, offset) {
    let currentNode          = null;
    let currentOffset        = null;
    const childNodes         = nativeMethods.nodeChildNodesGetter.call(node);
    const childCount         = domUtils.getChildNodesLength(childNodes);
    let isSearchForLastChild = offset >= childCount;

    // NOTE: we get a child element by its offset index in the parent
    if (domUtils.isShadowUIElement(node))
        return { node, offset };

    // NOTE: IE behavior
    if (isSearchForLastChild)
        currentNode = childNodes[childCount - 1];
    else {
        currentNode   = childNodes[offset];
        currentOffset = 0;
    }

    // NOTE: skip shadowUI elements
    if (domUtils.isShadowUIElement(currentNode)) {
        if (childCount <= 1)
            return { node, offset: 0 };

        isSearchForLastChild = offset - 1 >= childCount;

        if (isSearchForLastChild)
            currentNode = childNodes[childCount - 2];
        else {
            currentNode   = childNodes[offset - 1];
            currentOffset = 0;
        }
    }

    // NOTE: we try to find text node
    while (!isSkippableNode(currentNode) && domUtils.isElementNode(currentNode)) {
        const visibleChildren = getVisibleChildren(currentNode);

        if (visibleChildren.length)
            currentNode = visibleChildren[isSearchForLastChild ? visibleChildren.length - 1 : 0];
        else {
            //NOTE: if we didn't find a text node then always set offset to zero
            currentOffset = 0;
            break;
        }
    }

    if (currentOffset !== 0 && !isSkippableNode(currentNode))
        currentOffset = currentNode.nodeValue ? currentNode.nodeValue.length : 0;

    return {
        node:   currentNode,
        offset: currentOffset
    };
}

function getSelectionStart (el, selection, inverseSelection) {
    const startNode   = inverseSelection ? selection.focusNode : selection.anchorNode;
    const startOffset = inverseSelection ? selection.focusOffset : selection.anchorOffset;

    let correctedStartPosition = {
        node:   startNode,
        offset: startOffset
    };

    //NOTE: window.getSelection() can't returns not rendered node like selected node, so we shouldn't check it
    if ((domUtils.isTheSameNode(el, startNode) || domUtils.isElementNode(startNode)) && hasSelectableChildren(startNode))
        correctedStartPosition = getSelectedPositionInParentByOffset(startNode, startOffset);

    return {
        node:   correctedStartPosition.node,
        offset: correctedStartPosition.offset
    };
}

function getSelectionEnd (el, selection, inverseSelection) {
    const endNode   = inverseSelection ? selection.anchorNode : selection.focusNode;
    const endOffset = inverseSelection ? selection.anchorOffset : selection.focusOffset;

    let correctedEndPosition = {
        node:   endNode,
        offset: endOffset
    };

    //NOTE: window.getSelection() can't returns not rendered node like selected node, so we shouldn't check it
    if ((domUtils.isTheSameNode(el, endNode) || domUtils.isElementNode(endNode)) && hasSelectableChildren(endNode))
        correctedEndPosition = getSelectedPositionInParentByOffset(endNode, endOffset);

    return {
        node:   correctedEndPosition.node,
        offset: correctedEndPosition.offset
    };
}

export function getSelection (el, selection, inverseSelection) {
    return {
        startPos: getSelectionStart(el, selection, inverseSelection),
        endPos:   getSelectionEnd(el, selection, inverseSelection)
    };
}

export function getSelectionStartPosition (el, selection, inverseSelection) {
    const correctedSelectionStart = getSelectionStart(el, selection, inverseSelection);

    return calculatePositionByNodeAndOffset(el, correctedSelectionStart);
}

export function getSelectionEndPosition (el, selection, inverseSelection) {
    const correctedSelectionEnd = getSelectionEnd(el, selection, inverseSelection);

    return calculatePositionByNodeAndOffset(el, correctedSelectionEnd);
}

function getElementOffset (target) {
    let offset       = 0;
    const childNodes = nativeMethods.nodeChildNodesGetter.call(target);

    const firstBreakElement = arrayUtils.find(childNodes, (node, index) => {
        offset = index;
        return domUtils.getTagName(node) === 'br';
    });

    return firstBreakElement ? offset : 0;
}

function isNodeSelectable (node, includeDescendants) {
    if (styleUtils.isNotVisibleNode(node))
        return false;

    if (domUtils.isTextNode(node))
        return true;

    if (!domUtils.isElementNode(node))
        return false;

    if (hasSelectableChildren(node))
        return includeDescendants;

    const parent                = nativeMethods.nodeParentNodeGetter.call(node);
    const isContentEditableRoot = !domUtils.isContentEditableElement(parent);
    const visibleChildren       = getVisibleChildren(node);
    const hasBreakLineElements  = arrayUtils.some(visibleChildren, child => domUtils.getTagName(child) === 'br');

    return isContentEditableRoot || hasBreakLineElements;
}

export function calculateNodeAndOffsetByPosition (el, offset) {
    let point = {
        node:   null,
        offset: offset
    };

    function checkChildNodes (target) {
        const childNodes       = nativeMethods.nodeChildNodesGetter.call(target);
        const childNodesLength = domUtils.getChildNodesLength(childNodes);

        if (point.node)
            return point;

        if (isSkippableNode(target))
            return point;

        if (domUtils.isTextNode(target)) {
            if (point.offset <= target.nodeValue.length) {
                point.node = target;
                return point;
            }
            else if (target.nodeValue.length) {
                if (!point.node && isNodeAfterNodeBlockWithBreakLine(el, target))
                    point.offset--;

                point.offset -= target.nodeValue.length;
            }
        }
        else if (domUtils.isElementNode(target)) {
            if (!isVisibleNode(target))
                return point;

            if (point.offset === 0 && isNodeSelectable(target, false)) {
                point.node   = target;
                point.offset = getElementOffset(target);

                return point;
            }
            if (!point.node && (isNodeBlockWithBreakLine(el, target) || isNodeAfterNodeBlockWithBreakLine(el, target)))
                point.offset--;
            else if (!childNodesLength && domUtils.getTagName(target) === 'br')
                point.offset--;
        }

        for (let i = 0; i < childNodesLength; i++)
            point = checkChildNodes(childNodes[i]);

        return point;
    }

    return checkChildNodes(el);
}

export function calculatePositionByNodeAndOffset (el, { node, offset }) {
    let currentOffset = 0;
    let find          = false;

    function checkChildNodes (target) {
        const childNodes       = nativeMethods.nodeChildNodesGetter.call(target);
        const childNodesLength = domUtils.getChildNodesLength(childNodes);

        if (find)
            return currentOffset;

        if (domUtils.isTheSameNode(node, target)) {
            if (isNodeBlockWithBreakLine(el, target) || isNodeAfterNodeBlockWithBreakLine(el, target))
                currentOffset++;

            find = true;
            return currentOffset + offset;
        }

        if (isSkippableNode(target))
            return currentOffset;

        if (!childNodesLength && target.nodeValue && target.nodeValue.length) {
            if (!find && isNodeAfterNodeBlockWithBreakLine(el, target))
                currentOffset++;

            currentOffset += target.nodeValue.length;
        }

        else if (!childNodesLength && domUtils.isElementNode(target) && domUtils.getTagName(target) === 'br')
            currentOffset++;

        else if (!find && (isNodeBlockWithBreakLine(el, target) || isNodeAfterNodeBlockWithBreakLine(el, target)))
            currentOffset++;

        for (let i = 0; i < childNodesLength; i++)
            currentOffset = checkChildNodes(childNodes[i]);

        return currentOffset;
    }

    return checkChildNodes(el);
}

export function getElementBySelection (selection) {
    const el = getNearestCommonAncestor(selection.anchorNode, selection.focusNode);

    return domUtils.isTextNode(el) ? el.parentElement : el;
}

//NOTE: We can not determine first visible symbol of node in all cases,
// so we should create a range and select all text contents of the node.
// Then range object will contain information about node's the first and last visible symbol.
export function getFirstVisiblePosition (el) {
    const firstVisibleTextChild = domUtils.isTextNode(el) ? el : getFirstVisibleTextNode(el);
    const curDocument           = domUtils.findDocument(el);
    const range                 = curDocument.createRange();

    if (firstVisibleTextChild) {
        range.selectNodeContents(firstVisibleTextChild);

        return calculatePositionByNodeAndOffset(el, { node: firstVisibleTextChild, offset: range.startOffset });
    }

    return 0;
}

export function getLastVisiblePosition (el) {
    const lastVisibleTextChild = domUtils.isTextNode(el) ? el : getLastTextNode(el, true);

    if (!lastVisibleTextChild || isResetAnchorOffsetRequired(lastVisibleTextChild, el))
        return 0;

    const curDocument = domUtils.findDocument(el);
    const range       = curDocument.createRange();

    range.selectNodeContents(lastVisibleTextChild);

    return calculatePositionByNodeAndOffset(el, { node: lastVisibleTextChild, offset: range.endOffset });
}

function isResetAnchorOffsetRequired (lastVisibleTextChild, el) {
    const firstVisibleTextChild = domUtils.isTextNode(el) ? el : getFirstTextNode(el, false);
    const isSingleTextNode      = lastVisibleTextChild === firstVisibleTextChild;
    const isNewLineChar         = lastVisibleTextChild.nodeValue === String.fromCharCode(10);

    return isSingleTextNode && isNewLineChar && hasWhiteSpacePreStyle(lastVisibleTextChild, el);
}

function hasWhiteSpacePreStyle (el, container) {
    const whiteSpacePreStyles = ['pre', 'pre-wrap', 'pre-line'];

    while (el !== container) {
        el = nativeMethods.nodeParentNodeGetter.call(el);

        if (arrayUtils.indexOf(whiteSpacePreStyles, styleUtils.get(el, 'white-space')) > -1)
            return true;
    }

    return false;
}

function getContentEditableNodes (target) {
    let result             = [];
    const childNodes       = nativeMethods.nodeChildNodesGetter.call(target);
    const childNodesLength = domUtils.getChildNodesLength(childNodes);

    if (!isSkippableNode(target) && !childNodesLength && domUtils.isTextNode(target))
        result.push(target);

    for (let i = 0; i < childNodesLength; i++)
        result = result.concat(getContentEditableNodes(childNodes[i]));

    return result;
}

// contents util
export function getContentEditableValue (target) {
    return arrayUtils.map(getContentEditableNodes(target), node => node.nodeValue).join('');
}
