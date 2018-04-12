import * as domUtils from './dom';
import * as arrayUtils from './array';
import * as styleUtils from './style';

//nodes utils
function getOwnFirstVisibleTextNode (el) {
    var children       = el.childNodes;
    var childrenLength = domUtils.getChildNodesLength(children);

    if (!childrenLength && isVisibleTextNode(el))
        return el;

    return arrayUtils.find(children, node => isVisibleTextNode(node));
}

function getOwnFirstVisibleNode (el) {
    return arrayUtils.find(el.childNodes, node => isVisibleTextNode(node) ||
                                                  !isSkippableNode(node) && getOwnFirstVisibleNode(node));
}

function getOwnPreviousVisibleSibling (el) {
    var sibling = null;
    var current = el;

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
    return arrayUtils.filter(node.childNodes, isVisibleNode);
}

function hasVisibleChildren (node) {
    return arrayUtils.some(node.childNodes, isVisibleNode);
}

function hasSelectableChildren (node) {
    return arrayUtils.some(node.childNodes, child => isNodeSelectable(child, true));
}

//NOTE: before such elements (like div or p) adds line breaks before and after it
// (except line break before first visible element in contentEditable parent)
// this line breaks is not contained in node values
//so we should take it into account manually
function isNodeBlockWithBreakLine (parent, node) {
    var parentFirstVisibleChild = null;
    var firstVisibleChild       = null;

    if (domUtils.isShadowUIElement(parent) || domUtils.isShadowUIElement(node))
        return false;

    if (!domUtils.isTheSameNode(node, parent) && domUtils.getChildNodesLength(node.childNodes) &&
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
    var isRenderedNode          = domUtils.isRenderedNode(node);
    var parentFirstVisibleChild = null;
    var firstVisibleChild       = null;
    var previousSibling         = null;

    if (domUtils.isShadowUIElement(parent) || domUtils.isShadowUIElement(node))
        return false;

    if (!domUtils.isTheSameNode(node, parent) &&
        (isRenderedNode && domUtils.isElementNode(node) && domUtils.getChildNodesLength(node.childNodes) &&
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

export function getFirstVisibleTextNode (el) {
    var children                    = el.childNodes;
    var childrenLength              = domUtils.getChildNodesLength(children);
    var curNode                     = null;
    var child                       = null;
    var isNotContentEditableElement = null;

    if (!childrenLength && isVisibleTextNode(el))
        return el;

    for (var i = 0; i < childrenLength; i++) {
        curNode                     = children[i];
        isNotContentEditableElement = domUtils.isElementNode(curNode) && !domUtils.isContentEditableElement(curNode);

        if (isVisibleTextNode(curNode))
            return curNode;
        else if (domUtils.isRenderedNode(curNode) && hasVisibleChildren(curNode) && !isNotContentEditableElement) {
            child = getFirstVisibleTextNode(curNode);

            if (child)
                return child;
        }
    }

    return child;
}

export function getLastTextNode (el, onlyVisible) {
    var children                    = el.childNodes;
    var childrenLength              = domUtils.getChildNodesLength(children);
    var curNode                     = null;
    var child                       = null;
    var isNotContentEditableElement = null;
    var visibleTextNode             = null;

    if (!childrenLength && isVisibleTextNode(el))
        return el;

    for (var i = childrenLength - 1; i >= 0; i--) {
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

    var valueLength = nodeValue.length;
    var index       = startFrom || 0;

    for (var i = index; i < valueLength; i++) {
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

    var valueLength = nodeValue.length;
    var index       = valueLength;

    for (var i = valueLength - 1; i >= 0; i--) {
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

    var nodeValue         = node.nodeValue;
    var firstVisibleIndex = getFirstNonWhitespaceSymbolIndex(nodeValue);
    var lastVisibleIndex  = getLastNonWhitespaceSymbolIndex(nodeValue);

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
    var attrValue = el.getAttribute ? el.getAttribute('contenteditable') : null;

    return attrValue === '' || attrValue === 'true';
}

export function findContentEditableParent (element) {
    var elParents = domUtils.getParents(element);

    if (hasContentEditableAttr(element) && domUtils.isContentEditableElement(element))
        return element;

    var currentDocument = domUtils.findDocument(element);

    if (currentDocument.designMode === 'on')
        return currentDocument.body;

    return arrayUtils.find(elParents, parent => hasContentEditableAttr(parent) &&
                                                domUtils.isContentEditableElement(parent));
}

export function getNearestCommonAncestor (node1, node2) {
    if (domUtils.isTheSameNode(node1, node2)) {
        if (domUtils.isTheSameNode(node2, findContentEditableParent(node1)))
            return node1;
        return node1.parentNode;
    }

    var ancestors             = [];
    var contentEditableParent = findContentEditableParent(node1);
    var curNode               = null;

    if (!domUtils.isElementContainsNode(contentEditableParent, node2))
        return null;

    for (curNode = node1; curNode !== contentEditableParent; curNode = curNode.parentNode)
        ancestors.push(curNode);

    for (curNode = node2; curNode !== contentEditableParent; curNode = curNode.parentNode) {
        if (arrayUtils.indexOf(ancestors, curNode) !== -1)
            return curNode;
    }

    return contentEditableParent;
}

//selection utils
function getSelectedPositionInParentByOffset (node, offset) {
    var currentNode          = null;
    var currentOffset        = null;
    var childCount           = domUtils.getChildNodesLength(node.childNodes);
    var isSearchForLastChild = offset >= childCount;

    // NOTE: we get a child element by its offset index in the parent
    if (domUtils.isShadowUIElement(node))
        return { node, offset };

    // NOTE: IE behavior
    if (isSearchForLastChild)
        currentNode = node.childNodes[childCount - 1];
    else {
        currentNode   = node.childNodes[offset];
        currentOffset = 0;
    }

    // NOTE: skip shadowUI elements
    if (domUtils.isShadowUIElement(currentNode)) {
        if (childCount <= 1)
            return { node, offset: 0 };

        isSearchForLastChild = offset - 1 >= childCount;

        if (isSearchForLastChild)
            currentNode = node.childNodes[childCount - 2];
        else {
            currentNode   = node.childNodes[offset - 1];
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
    var startNode   = inverseSelection ? selection.focusNode : selection.anchorNode;
    var startOffset = inverseSelection ? selection.focusOffset : selection.anchorOffset;

    var correctedStartPosition = {
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
    var endNode   = inverseSelection ? selection.anchorNode : selection.focusNode;
    var endOffset = inverseSelection ? selection.anchorOffset : selection.focusOffset;

    var correctedEndPosition = {
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
    var correctedSelectionStart = getSelectionStart(el, selection, inverseSelection);

    return calculatePositionByNodeAndOffset(el, correctedSelectionStart);
}

export function getSelectionEndPosition (el, selection, inverseSelection) {
    var correctedSelectionEnd = getSelectionEnd(el, selection, inverseSelection);

    return calculatePositionByNodeAndOffset(el, correctedSelectionEnd);
}

function getElementOffset (target) {
    let offset = 0;

    const firstBreakElement = arrayUtils.find(target.childNodes, (node, index) => {
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

    const isContentEditableRoot = !domUtils.isContentEditableElement(node.parentNode);
    const visibleChildren       = getVisibleChildren(node);
    const hasBreakLineElements  = arrayUtils.some(visibleChildren, child => domUtils.getTagName(child) === 'br');

    return isContentEditableRoot || hasBreakLineElements;
}

export function calculateNodeAndOffsetByPosition (el, offset) {
    var point = {
        node:   null,
        offset: offset
    };

    function checkChildNodes (target) {
        var childNodes       = target.childNodes;
        var childNodesLength = domUtils.getChildNodesLength(childNodes);

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

        arrayUtils.forEach(childNodes, node => {
            point = checkChildNodes(node);
        });

        return point;
    }

    return checkChildNodes(el);
}

export function calculatePositionByNodeAndOffset (el, { node, offset }) {
    var currentOffset = 0;
    var find          = false;

    function checkChildNodes (target) {
        var childNodes       = target.childNodes;
        var childNodesLength = domUtils.getChildNodesLength(childNodes);

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

        arrayUtils.forEach(childNodes, currentNode => {
            currentOffset = checkChildNodes(currentNode);
        });

        return currentOffset;
    }

    return checkChildNodes(el);
}

export function getElementBySelection (selection) {
    var el = getNearestCommonAncestor(selection.anchorNode, selection.focusNode);

    return domUtils.isTextNode(el) ? el.parentElement : el;
}

//NOTE: We can not determine first visible symbol of node in all cases,
// so we should create a range and select all text contents of the node.
// Then range object will contain information about node's the first and last visible symbol.
export function getFirstVisiblePosition (el) {
    var firstVisibleTextChild = domUtils.isTextNode(el) ? el : getFirstVisibleTextNode(el);
    var curDocument           = domUtils.findDocument(el);
    var range                 = curDocument.createRange();

    if (firstVisibleTextChild) {
        range.selectNodeContents(firstVisibleTextChild);

        return calculatePositionByNodeAndOffset(el, { node: firstVisibleTextChild, offset: range.startOffset });
    }

    return 0;
}

export function getLastVisiblePosition (el) {
    var lastVisibleTextChild = domUtils.isTextNode(el) ? el : getLastTextNode(el, true);
    var curDocument          = domUtils.findDocument(el);
    var range                = curDocument.createRange();

    if (lastVisibleTextChild) {
        range.selectNodeContents(lastVisibleTextChild);

        return calculatePositionByNodeAndOffset(el, { node: lastVisibleTextChild, offset: range.endOffset });
    }

    return 0;
}

function getContentEditableNodes (target) {
    var result           = [];
    var childNodes       = target.childNodes;
    var childNodesLength = domUtils.getChildNodesLength(childNodes);

    if (!isSkippableNode(target) && !childNodesLength && domUtils.isTextNode(target))
        result.push(target);

    arrayUtils.forEach(childNodes, node => {
        result = result.concat(getContentEditableNodes(node));
    });

    return result;
}

// contents util
export function getContentEditableValue (target) {
    return arrayUtils.map(getContentEditableNodes(target), node => node.nodeValue).join('');
}
