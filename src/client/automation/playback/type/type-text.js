import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import nextTick from '../../utils/next-tick';

var browserUtils   = hammerhead.utils.browser;
var eventSandbox   = hammerhead.sandbox.event;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var listeners      = hammerhead.eventSandbox.listeners;

var domUtils        = testCafeCore.domUtils;
var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;


function _getSelectionInElement (element) {
    var currentSelection   = textSelection.getSelectionByElement(element);
    var isInverseSelection = textSelection.hasInverseSelectionContentEditable(element);

    if (textSelection.hasElementContainsSelection(element))
        return contentEditable.getSelection(element, currentSelection, isInverseSelection);

    // NOTE: if we type text to an element that doesn't contain selection we
    // assume the selectionStart and selectionEnd positions are null in this
    // element. So we calculate the necessary start and end nodes and offsets
    return {
        startPos: contentEditable.calculateNodeAndOffsetByPosition(element, 0),
        endPos:   contentEditable.calculateNodeAndOffsetByPosition(element, 0)
    };
}

function _updateSelectionAfterDeletionContent (element, selection) {
    var startNode      = selection.startPos.node;
    var hasStartParent = startNode.parentNode && startNode.parentElement;

    var browserRequiresSelectionUpdating = browserUtils.isChrome && browserUtils.version < 58 || browserUtils.isSafari;

    if (browserRequiresSelectionUpdating || !hasStartParent || !domUtils.isElementContainsNode(element, startNode)) {
        selection = _getSelectionInElement(element);

        if (textSelection.hasInverseSelectionContentEditable(element)) {
            selection = {
                startPos: selection.endPos,
                endPos:   selection.startPos
            };
        }
    }

    selection.endPos.offset = selection.startPos.offset;

    return selection;
}

function _typeTextInElementNode (elementNode, text, offset) {
    var nodeForTyping  = document.createTextNode(text);
    var textLength     = text.length;
    var selectPosition = { node: nodeForTyping, offset: textLength };

    if (domUtils.getTagName(elementNode) === 'br')
        elementNode.parentNode.insertBefore(nodeForTyping, elementNode);
    else if (offset > 0)
        elementNode.insertBefore(nodeForTyping, elementNode.childNodes[offset]);
    else
        elementNode.appendChild(nodeForTyping);

    textSelection.selectByNodesAndOffsets(selectPosition, selectPosition);
}

function _typeTextInChildTextNode (element, selection, text) {
    let startNode = selection.startPos.node;

    // NOTE: startNode could be moved or deleted on textInput event. Need ensure startNode.
    if (!domUtils.isElementContainsNode(element, startNode)) {
        selection = _excludeInvisibleSymbolsFromSelection(_getSelectionInElement(element));
        startNode = selection.startPos.node;
    }

    const startOffset    = selection.startPos.offset;
    const endOffset      = selection.endPos.offset;
    const nodeValue      = startNode.nodeValue;
    const selectPosition = { node: startNode, offset: startOffset + text.length };

    startNode.nodeValue = nodeValue.substring(0, startOffset) + text +
                          nodeValue.substring(endOffset, nodeValue.length);

    textSelection.selectByNodesAndOffsets(selectPosition, selectPosition);
}

function _excludeInvisibleSymbolsFromSelection (selection) {
    var startNode   = selection.startPos.node;
    var startOffset = selection.startPos.offset;
    var endOffset   = selection.endPos.offset;

    var firstNonWhitespaceSymbolIndex = contentEditable.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue);
    var lastNonWhitespaceSymbolIndex  = contentEditable.getLastNonWhitespaceSymbolIndex(startNode.nodeValue);

    if (startOffset < firstNonWhitespaceSymbolIndex && startOffset !== 0) {
        selection.startPos.offset = firstNonWhitespaceSymbolIndex;
        selection.endPos.offset   = endOffset + firstNonWhitespaceSymbolIndex - startOffset;
    }
    else if (endOffset > lastNonWhitespaceSymbolIndex && endOffset !== startNode.nodeValue.length) {
        selection.startPos.offset = startNode.nodeValue.length;
        selection.endPos.offset   = endOffset + startNode.nodeValue.length - startOffset;
    }

    return selection;
}

// NOTE: Typing can be prevented in Chrome/Edge but can not be prevented in IE11 or Firefox
//       Firefox does not support TextInput event
//       Safari supports the TextInput event but has a bug: e.data is added to the node value.
//       So in Safari we need to call preventDefault in the last textInput handler but not prevent the Input event

let forceInputInSafari;

function simulateTextInput (element, text) {
    if (browserUtils.isSafari) {
        listeners.addInternalEventListener(window, ['textInput'], onSafariTextInput);
        eventSandbox.on(eventSandbox.EVENT_PREVENTED_EVENT, onSafariPreventTextInput);
    }

    const isInputEventRequired = browserUtils.isFirefox || eventSimulator.textInput(element, text) || forceInputInSafari;

    if (browserUtils.isSafari) {
        listeners.removeInternalEventListener(window, ['textInput'], onSafariTextInput);
        eventSandbox.off(eventSandbox.EVENT_PREVENTED_EVENT, onSafariPreventTextInput);
    }

    return isInputEventRequired || browserUtils.isIE11;
}

function onSafariTextInput (e) {
    e.preventDefault();

    forceInputInSafari = true;
}

function onSafariPreventTextInput (e) {
    if (e.type === 'textInput')
        forceInputInSafari = false;
}

function _typeTextToContentEditable (element, text) {
    var currentSelection    = _getSelectionInElement(element);
    var startNode           = currentSelection.startPos.node;
    var endNode             = currentSelection.endPos.node;
    var needProcessInput    = true;
    var needRaiseInputEvent = true;

    // NOTE: some browsers raise the 'input' event after the element
    // content is changed, but in others we should do it manually.

    var onInput = () => {
        needRaiseInputEvent = false;
    };

    // NOTE: IE11 does not raise input event when type to contenteditable

    var beforeContentChanged = () => {
        needProcessInput    = simulateTextInput(element, text);
        needRaiseInputEvent = needProcessInput && !browserUtils.isIE11;
    };

    var afterContentChanged = () => {
        nextTick()
            .then(() => {
                if (needRaiseInputEvent)
                    eventSimulator.input(element);

                listeners.removeInternalEventListener(window, ['input'], onInput);
            });
    };

    listeners.addInternalEventListener(window, ['input'], onInput);

    if (!startNode || !endNode || !domUtils.isContentEditableElement(startNode) ||
        !domUtils.isContentEditableElement(endNode))
        return;

    if (!domUtils.isTheSameNode(startNode, endNode)) {
        textSelection.deleteSelectionContents(element);

        // NOTE: after deleting the selection contents we should refresh the stored startNode because
        // contentEditable element's content could change and we can no longer find parent elements
        // of the nodes. In MSEdge, 'parentElement' for the deleted element isn't undefined
        currentSelection = _updateSelectionAfterDeletionContent(element, currentSelection);
        startNode        = currentSelection.startPos.node;
    }

    if (!startNode || !domUtils.isContentEditableElement(startNode) || !domUtils.isRenderedNode(startNode))
        return;

    beforeContentChanged();

    if (needProcessInput) {
        // NOTE: we can type only to the text nodes; for nodes with the 'element-node' type, we use a special behavior
        if (domUtils.isElementNode(startNode))
            _typeTextInElementNode(startNode, text);
        else
            _typeTextInChildTextNode(element, _excludeInvisibleSymbolsFromSelection(currentSelection), text);
    }

    afterContentChanged();
}

function _typeTextToTextEditable (element, text) {
    var elementValue      = domUtils.getElementValue(element);
    var textLength        = text.length;
    var startSelection    = textSelection.getSelectionStart(element);
    var endSelection      = textSelection.getSelectionEnd(element);
    var isInputTypeNumber = domUtils.isInputElement(element) && element.type === 'number';
    var needProcessInput  = simulateTextInput(element, text);

    if (!needProcessInput)
        return;

    // NOTE: the 'maxlength' attribute doesn't work in all browsers. IE still doesn't support input with the 'number' type
    var elementMaxLength = !browserUtils.isIE && isInputTypeNumber ? null : parseInt(element.maxLength, 10);

    if (elementMaxLength < 0)
        elementMaxLength = browserUtils.isIE ? 0 : null;

    if (elementMaxLength === null || isNaN(elementMaxLength) || elementMaxLength > elementValue.length) {
        // NOTE: B254013
        if (isInputTypeNumber && browserUtils.isIOS && elementValue[elementValue.length - 1] === '.') {
            startSelection += 1;
            endSelection += 1;
        }

        domUtils.setElementValue(element, elementValue.substring(0, startSelection) + text +
                          elementValue.substring(endSelection, elementValue.length));

        textSelection.select(element, startSelection + textLength, startSelection + textLength);
    }

    // NOTE: We should simulate the 'input' event after typing a char (B253410, T138385)
    eventSimulator.input(element);
}

function _typeTextToNonTextEditable (element, text, caretPos) {
    if (caretPos !== null) {
        var elementValue = domUtils.getElementValue(element);

        domUtils.setElementValue(element, elementValue.substr(0, caretPos) + text + elementValue.substr(caretPos + text.length));
    }
    else
        domUtils.setElementValue(element, text);

    eventSimulator.change(element);
    eventSimulator.input(element);
}

export default function (element, text, caretPos) {
    if (domUtils.isContentEditableElement(element))
        _typeTextToContentEditable(element, text === ' ' ? String.fromCharCode(160) : text);

    if (!domUtils.isElementReadOnly(element)) {
        if (domUtils.isTextEditableElement(element))
            _typeTextToTextEditable(element, text);

        else if (domUtils.isInputElement(element))
            _typeTextToNonTextEditable(element, text, caretPos);
    }
}
