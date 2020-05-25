import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import nextTick from '../../utils/next-tick';

const browserUtils   = hammerhead.utils.browser;
const eventSandbox   = hammerhead.sandbox.event;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners      = hammerhead.eventSandbox.listeners;
const nativeMethods  = hammerhead.nativeMethods;

const domUtils        = testCafeCore.domUtils;
const contentEditable = testCafeCore.contentEditable;
const textSelection   = testCafeCore.textSelection;

const WHITE_SPACES_RE = / /g;

function _getSelectionInElement (element) {
    const currentSelection   = textSelection.getSelectionByElement(element);
    const isInverseSelection = textSelection.hasInverseSelectionContentEditable(element);

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
    const startNode      = selection.startPos.node;
    const startParent    = nativeMethods.nodeParentNodeGetter.call(startNode);
    const hasStartParent = startParent && startNode.parentElement;

    const browserRequiresSelectionUpdating = browserUtils.isChrome && browserUtils.version < 58 || browserUtils.isSafari;

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
    const nodeForTyping  = document.createTextNode(text);
    const textLength     = text.length;
    const selectPosition = { node: nodeForTyping, offset: textLength };
    const parent         = nativeMethods.nodeParentNodeGetter.call(elementNode);

    if (domUtils.getTagName(elementNode) === 'br')
        parent.insertBefore(nodeForTyping, elementNode);
    else if (offset > 0) {
        const childNodes = nativeMethods.nodeChildNodesGetter.call(elementNode);

        elementNode.insertBefore(nodeForTyping, childNodes[offset]);
    }
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
    const startNode   = selection.startPos.node;
    const startOffset = selection.startPos.offset;
    const endOffset   = selection.endPos.offset;

    const firstNonWhitespaceSymbolIndex = contentEditable.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue);
    const lastNonWhitespaceSymbolIndex  = contentEditable.getLastNonWhitespaceSymbolIndex(startNode.nodeValue);

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

// NOTE: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event
// The `beforeInput` event is supported only in Chrome-based browsers and Safari
// The order of events differs in Chrome and Safari:
// In Chrome: `beforeinput` occurs before `textInput`
// In Safari: `beforeinput` occurs after `textInput`
function simulateBeforeInput (element, text, needSimulate) {
    if (needSimulate)
        return eventSimulator.beforeInput(element, text);

    return true;
}

// NOTE: Typing can be prevented in Chrome/Edge but can not be prevented in IE11 or Firefox
// Firefox does not support TextInput event
// Safari supports the TextInput event but has a bug: e.data is added to the node value.
// So in Safari we need to call preventDefault in the last textInput handler but not prevent the Input event

function simulateTextInput (element, text) {
    let forceInputInSafari;

    function onSafariTextInput (e) {
        e.preventDefault();

        forceInputInSafari = true;
    }

    function onSafariPreventTextInput (e) {
        if (e.type === 'textInput')
            forceInputInSafari = false;
    }

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

function _typeTextToContentEditable (element, text) {
    let currentSelection    = _getSelectionInElement(element);
    let startNode           = currentSelection.startPos.node;
    const endNode           = currentSelection.endPos.node;
    let needProcessInput    = true;
    let needRaiseInputEvent = true;
    const textInputData     = text;

    text = text.replace(WHITE_SPACES_RE, String.fromCharCode(160));

    // NOTE: some browsers raise the 'input' event after the element
    // content is changed, but in others we should do it manually.

    const onInput = () => {
        needRaiseInputEvent = false;
    };

    // NOTE: IE11 raises the 'textinput' event many times after the element changed.
    // The 'textinput' should be called only once

    function onTextInput (event, dispatched, preventEvent) {
        preventEvent();
    }

    // NOTE: IE11 does not raise input event when type to contenteditable

    const beforeContentChanged = () => {
        needProcessInput    = simulateTextInput(element, textInputData);
        needRaiseInputEvent = needProcessInput && !browserUtils.isIE11;

        listeners.addInternalEventListener(window, ['input'], onInput);
        listeners.addInternalEventListener(window, ['textinput'], onTextInput);
    };

    const afterContentChanged = () => {
        nextTick()
            .then(() => {
                if (needRaiseInputEvent)
                    eventSimulator.input(element);

                listeners.removeInternalEventListener(window, ['input'], onInput);
                listeners.removeInternalEventListener(window, ['textinput'], onTextInput);
            });
    };

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

    if (!simulateBeforeInput(element, text, browserUtils.isChrome))
        return;

    beforeContentChanged();

    if (needProcessInput)
        needProcessInput = simulateBeforeInput(element, text, browserUtils.isSafari);

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
    const elementValue      = domUtils.getElementValue(element);
    const textLength        = text.length;
    let startSelection      = textSelection.getSelectionStart(element);
    let endSelection        = textSelection.getSelectionEnd(element);
    const isInputTypeNumber = domUtils.isInputElement(element) && element.type === 'number';

    if (!simulateBeforeInput(element, text, browserUtils.isChrome))
        return;

    let needProcessInput = simulateTextInput(element, text);

    if (needProcessInput)
        needProcessInput = simulateBeforeInput(element, text, browserUtils.isSafari);

    if (!needProcessInput)
        return;

    // NOTE: the 'maxlength' attribute doesn't work in all browsers. IE still doesn't support input with the 'number' type
    let elementMaxLength = !browserUtils.isIE && isInputTypeNumber ? null : parseInt(element.maxLength, 10);

    if (elementMaxLength < 0)
        elementMaxLength = browserUtils.isIE && browserUtils.version < 17 ? 0 : null;

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
        const elementValue = domUtils.getElementValue(element);

        domUtils.setElementValue(element, elementValue.substr(0, caretPos) + text + elementValue.substr(caretPos + text.length));
    }
    else
        domUtils.setElementValue(element, text);

    eventSimulator.change(element);
    eventSimulator.input(element);
}

export default function (element, text, caretPos) {
    if (domUtils.isContentEditableElement(element))
        _typeTextToContentEditable(element, text);

    if (!domUtils.isElementReadOnly(element)) {
        if (domUtils.isTextEditableElement(element))
            _typeTextToTextEditable(element, text);

        else if (domUtils.isInputElement(element))
            _typeTextToNonTextEditable(element, text, caretPos);
    }
}
