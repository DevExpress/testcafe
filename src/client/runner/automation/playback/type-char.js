import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var $               = testCafeCore.$;
var domUtils        = testCafeCore.domUtils;
var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;


function getCorrectElementSelection (element) {
    var currentSelection = textSelection.getSelectionByElement(element),
        inverseSelection = textSelection.hasInverseSelectionContentEditable(element);

    if (textSelection.hasElementContainsSelection(element))
        currentSelection = contentEditable.getSelection(element, currentSelection, inverseSelection);
    else {
        //NOTE: if we type text in element which don't contains selection
        // we think selectionStart and selectionEnd positions are null in this element.
        //So we calculate the necessary start and end nodes and offsets
        var startSelectionPosition = contentEditable.calculateNodeAndOffsetByPosition(element, 0),
            endSelectionPosition   = contentEditable.calculateNodeAndOffsetByPosition(element, 0);

        currentSelection             = {};
        currentSelection.startNode   = startSelectionPosition.node;
        currentSelection.startOffset = startSelectionPosition.offset;
        currentSelection.endNode     = endSelectionPosition.node;
        currentSelection.endOffset   = endSelectionPosition.offset;
    }
    return currentSelection;
}

function typeCharToContentEditable (element, characters) {
    var chars            = characters === ' ' ? String.fromCharCode(160) : characters,
        currentSelection = getCorrectElementSelection(element),
        startNode        = currentSelection.startNode,
        startOffset      = currentSelection.startOffset,
        endNode          = currentSelection.endNode,
        endOffset        = currentSelection.endOffset;

    if (!startNode || !domUtils.isContentEditableElement(startNode) || !endNode ||
        !domUtils.isContentEditableElement(endNode))
        return;

    var firstNonWhitespaceSymbolIndex = contentEditable.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue),
        lastNonWhitespaceSymbolIndex  = contentEditable.getLastNonWhitespaceSymbolIndex(startNode.nodeValue),
        startNodeParent               = startNode.parentNode,
        needDeleteSelectedContent     = !domUtils.isTheSameNode(startNode, endNode),
        inverseSelection              = null,

        correctedStartNode            = null,
        correctedStartOffset          = null,
        correctedEndOffset            = null,
        newCaretPos                   = null,

        oldStartNodeValue             = null;

    if (needDeleteSelectedContent) {
        textSelection.deleteSelectionContents(element);

        //NOTE: After deleting selection contents we should refresh stored startNode
        //because contentEditable element's content could change and we can not find parentElements of nodes
        //In MSEdge 'parentElement' for deleted element isn't undefined
        if (browserUtils.isWebKit || !(startNode.parentNode && startNode.parentElement) ||
            !domUtils.isElementContainsNode(element, startNode)) {
            currentSelection = getCorrectElementSelection(element);
            inverseSelection = textSelection.hasInverseSelectionContentEditable(element);
            startNode        = inverseSelection ? currentSelection.endNode : currentSelection.startNode;
            startOffset      = inverseSelection ? currentSelection.endOffset : currentSelection.startOffset;

            if (!startNode || !domUtils.isContentEditableElement(startNode))
                return;
        }
        endOffset = startOffset;
    }

    //NOTE: We can type only in text nodes(except if selected node is 'br' node, then we use special behavior)
    if (!domUtils.isRenderedNode(startNode))
        return;

    if (startNode.nodeType === 1) {
        correctedStartNode = document.createTextNode(chars);
        if (startNode.tagName.toLowerCase() === 'br')
            startNodeParent.insertBefore(correctedStartNode, startNode);
        else
            startNode.appendChild(correctedStartNode);
        newCaretPos = chars.length;
        textSelection.selectByNodesAndOffsets(correctedStartNode, newCaretPos, correctedStartNode, newCaretPos);
        return;
    }

    if (startOffset < firstNonWhitespaceSymbolIndex && startOffset !== 0) {
        correctedStartOffset = firstNonWhitespaceSymbolIndex;
        correctedEndOffset   = endOffset + (firstNonWhitespaceSymbolIndex - startOffset);
    }
    else if (endOffset > lastNonWhitespaceSymbolIndex && endOffset !== startNode.nodeValue.length) {
        correctedStartOffset = startNode.nodeValue.length;
        correctedEndOffset   = endOffset + (startNode.nodeValue.length - startOffset);
    }
    else {
        correctedStartOffset = startOffset;
        correctedEndOffset   = endOffset;
    }

    correctedStartNode           = correctedStartNode || startNode;
    oldStartNodeValue            = correctedStartNode.nodeValue;
    correctedStartNode.nodeValue = oldStartNodeValue.substring(0, correctedStartOffset) + chars +
                                   oldStartNodeValue.substring(correctedEndOffset, oldStartNodeValue.length);
    newCaretPos                  = correctedStartOffset + chars.length;
    textSelection.selectByNodesAndOffsets(correctedStartNode, newCaretPos, correctedStartNode, newCaretPos);
}

export default function (element, characters, caretPos) {
    if (domUtils.isContentEditableElement(element)) {
        typeCharToContentEditable(element, characters);
        return;
    }

    if (!domUtils.isTextEditableElementAndEditingAllowed(element))
        return;

    var startSelection   = textSelection.getSelectionStart(element),
        endSelection     = textSelection.getSelectionEnd(element),

        //NOTE: attribute 'maxlength' doesn't work in all browsers. In IE still don't support input with type 'number'
        isNumberInput    = $(element).is('input[type=number]'),
        elementMaxLength = !browserUtils.isIE && isNumberInput ?
                           null : parseInt($(element).attr('maxLength')),

        value            = element.value;

    if (elementMaxLength === null || isNaN(elementMaxLength) || elementMaxLength > value.length) {
        if (isNumberInput) {
            if (browserUtils.isIOS && value[value.length - 1] === '.') {    //B254013
                startSelection += 1;
                endSelection += 1;
            }
            else if (domUtils.isInputWithoutSelectionPropertiesInMozilla(element)) //T133144
                startSelection = endSelection = caretPos;
        }

        element.value = value.substring(0, startSelection) + characters + value.substring(endSelection, value.length);

        textSelection.select(element, startSelection + characters.length, startSelection + characters.length);
    }

    //NOTE: B253410, T138385 (we should simulate 'input' event after type char in 'type' and 'press' action)
    eventSimulator.input(element);
};
