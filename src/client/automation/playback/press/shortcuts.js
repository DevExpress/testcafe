import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';

var Promise               = hammerhead.Promise;
var browserUtils          = hammerhead.utils.browser;
var eventSimulator        = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox      = hammerhead.eventSandbox.focusBlur;
var elementEditingWatcher = hammerhead.eventSandbox.elementEditingWatcher;

var textSelection = testCafeCore.textSelection;
var eventUtils    = testCafeCore.eventUtils;
var domUtils      = testCafeCore.domUtils;
var selectElement = testCafeUI.selectElement;


var currentTextarea             = null;
var currentTextareaCursorIndent = null;

function onTextAreaBlur () {
    currentTextarea             = null;
    currentTextareaCursorIndent = null;

    eventUtils.unbind(this, 'blur', onTextAreaBlur, true);
}

function updateTextAreaIndent (element) {
    if (domUtils.isTextAreaElement(element)) {
        if (currentTextarea !== element) {
            eventUtils.bind(element, 'blur', onTextAreaBlur, true);
            currentTextarea = element;
        }

        currentTextareaCursorIndent = getLineIndentInTextarea(element);
    }
}

function getLineIndentInTextarea (textarea) {
    var inverseSelection = textSelection.hasInverseSelection(textarea);
    var textareaValue    = domUtils.getTextAreaValue(textarea);

    var cursorPosition = inverseSelection ?
        textSelection.getSelectionStart(textarea) :
        textSelection.getSelectionEnd(textarea);

    if (!textareaValue || !cursorPosition)
        return 0;

    return domUtils.getTextareaIndentInLine(textarea, cursorPosition);
}

function moveTextAreaCursorUp (element, withSelection) {
    var textareaValue = domUtils.getTextAreaValue(element);

    if (!textareaValue)
        return;

    var startPos                = textSelection.getSelectionStart(element);
    var endPos                  = textSelection.getSelectionEnd(element);
    var hasInverseSelection     = textSelection.hasInverseSelection(element);
    var partBeforeCursor        = textareaValue.substring(0, hasInverseSelection ? startPos : endPos);
    var lastLineBreakIndex      = partBeforeCursor.lastIndexOf('\n');
    var partBeforeLastLineBreak = partBeforeCursor.substring(0, lastLineBreakIndex);

    if (currentTextareaCursorIndent === null || currentTextarea !== element)
        updateTextAreaIndent(element);

    lastLineBreakIndex = partBeforeLastLineBreak.lastIndexOf('\n');
    var newPosition    = Math.min(lastLineBreakIndex + 1 + currentTextareaCursorIndent, partBeforeLastLineBreak.length);

    moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
}

function moveTextAreaCursorDown (element, withSelection) {
    var textareaValue = domUtils.getTextAreaValue(element);

    if (!textareaValue)
        return;

    var startPos            = textSelection.getSelectionStart(element);
    var endPos              = textSelection.getSelectionEnd(element);
    var hasInverseSelection = textSelection.hasInverseSelection(element);
    var cursorPosition      = hasInverseSelection ? startPos : endPos;
    var partAfterCursor     = textareaValue.substring(cursorPosition);
    var firstLineBreakIndex = partAfterCursor.indexOf('\n');
    var nextLineStartIndex  = firstLineBreakIndex === -1 ? partAfterCursor.length : firstLineBreakIndex + 1;
    var partAfterNewIndent  = partAfterCursor.substring(nextLineStartIndex);
    var newPosition         = cursorPosition + nextLineStartIndex;

    firstLineBreakIndex = partAfterNewIndent.indexOf('\n');
    var maxIndent       = firstLineBreakIndex === -1 ? partAfterNewIndent.length : firstLineBreakIndex;

    if (currentTextareaCursorIndent === null || currentTextarea !== element)
        updateTextAreaIndent(element);

    newPosition = Math.min(newPosition + currentTextareaCursorIndent, newPosition + maxIndent);

    moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
}

function moveTextAreaCursor (element, startPos, endPos, hasInverseSelection, newPosition, withSelection) {
    var newStart = null;
    var newEnd   = null;

    if (withSelection) {
        if (startPos === endPos) {
            newStart = startPos;
            newEnd   = newPosition;
        }
        else if (!hasInverseSelection) {
            newStart = startPos;
            newEnd   = newPosition;
        }
        else {
            newStart = endPos;
            newEnd   = newPosition;
        }
    }
    else
        newEnd = newStart = newPosition;

    textSelection.select(element, newStart, newEnd);
}

function setElementValue (element, value, position) {
    if (domUtils.isInputElement(element) && element.type === 'number') {
        if (value.charAt(0) === '-' && value.charAt(1) === '.')
            value = value.substring(1);

        if (value.charAt(value.length - 1) === '.')
            value = value.substring(0, value.length - 1);
    }

    domUtils.setElementValue(element, value);

    textSelection.select(element, position, position);
    eventSimulator.input(element);
}

function submitFormOnEnterPressInInput (form, inputElement) {
    var buttons      = form.querySelectorAll('input, button');
    var submitButton = null;
    var i            = null;

    for (i = 0; i < buttons.length; i++) {
        if (!submitButton && buttons[i].type === 'submit' && !buttons[i].disabled) {
            submitButton = buttons[i];
            break;
        }
    }

    if (submitButton)
        eventSimulator.click(submitButton);
    else if (domUtils.blocksImplicitSubmission(inputElement)) {
        var formInputs = form.getElementsByTagName('input');
        var textInputs = [];

        for (i = 0; i < formInputs.length; i++) {
            if (domUtils.blocksImplicitSubmission(formInputs[i]))
                textInputs.push(formInputs[i]);
        }

        // NOTE: the form is submitted on enter press if there is only one input of the following types on it
        //  and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
        if (textInputs.length === 1 && textInputs[0] === inputElement) {
            var isInputValid = inputElement.validity.valid;

            if (isInputValid && eventSimulator.submit(form))
                form.submit();
        }
    }
}

//shortcuts
function selectAll (element) {
    if (domUtils.isEditableElement(element))
        textSelection.select(element);

    return Promise.resolve();
}

function backspace (element) {
    if (domUtils.isTextEditableElementAndEditingAllowed(element)) {
        var startPos = textSelection.getSelectionStart(element);
        var endPos   = textSelection.getSelectionEnd(element);
        var value    = domUtils.getElementValue(element).replace(/\r\n/g, '\n');

        if (endPos === startPos) {
            if (startPos > 0) {
                setElementValue(element, value.substring(0, startPos - 1) +
                                         value.substring(endPos, value.length), startPos - 1);
            }
        }
        else
            setElementValue(element, value.substring(0, startPos) + value.substring(endPos, value.length), startPos);
    }

    if (domUtils.isContentEditableElement(element))
        textSelection.deleteSelectionContents(element);

    return Promise.resolve();
}

function del (element) {
    if (domUtils.isTextEditableElementAndEditingAllowed(element)) {
        var startPos = textSelection.getSelectionStart(element);
        var endPos   = textSelection.getSelectionEnd(element);
        var value    = domUtils.getElementValue(element).replace(/\r\n/g, '\n');

        if (endPos === startPos) {
            if (startPos < value.length) {
                setElementValue(element, value.substring(0, startPos) +
                                         value.substring(endPos + 1, value.length), startPos);
            }
        }
        else {
            setElementValue(element, value.substring(0, startPos) +
                                     value.substring(endPos, value.length), startPos);
        }
    }

    if (domUtils.isContentEditableElement(element))
        textSelection.deleteSelectionContents(element);

    return Promise.resolve();
}

function left (element) {
    var startPosition = null;
    var endPosition   = null;

    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'left');

    if (domUtils.isTextEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element) || 0;
        endPosition   = textSelection.getSelectionEnd(element);

        var newPosition = startPosition === endPosition ? startPosition - 1 : startPosition;

        textSelection.select(element, newPosition, newPosition);
        updateTextAreaIndent(element);
    }

    if (domUtils.isContentEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element);
        endPosition   = textSelection.getSelectionEnd(element);

        // NOTE: we only remove selection
        if (startPosition !== endPosition) {
            var selection        = textSelection.getSelectionByElement(element);
            var inverseSelection = textSelection.hasInverseSelectionContentEditable(element);
            var startNode        = inverseSelection ? selection.focusNode : selection.anchorNode;
            var startOffset      = inverseSelection ? selection.focusOffset : selection.anchorOffset;
            var startPos         = { node: startNode, offset: startOffset };

            textSelection.selectByNodesAndOffsets(startPos, startPos, true);
        }
    }

    return Promise.resolve();
}

function right (element) {
    var startPosition = null;
    var endPosition   = null;

    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'right');

    if (domUtils.isTextEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element);
        endPosition   = textSelection.getSelectionEnd(element);

        var newPosition = startPosition === endPosition ? endPosition + 1 : endPosition;

        if (startPosition === domUtils.getElementValue(element).length)
            newPosition = startPosition;

        textSelection.select(element, newPosition, newPosition);
        updateTextAreaIndent(element);
    }

    if (domUtils.isContentEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element);
        endPosition   = textSelection.getSelectionEnd(element);

        //NOTE: we only remove selection
        if (startPosition !== endPosition) {
            var selection        = textSelection.getSelectionByElement(element);
            var inverseSelection = textSelection.hasInverseSelectionContentEditable(element);
            var endNode          = inverseSelection ? selection.anchorNode : selection.focusNode;
            var endOffset        = inverseSelection ? selection.anchorOffset : selection.focusOffset;
            var startPos         = { node: endNode, offset: endOffset };

            textSelection.selectByNodesAndOffsets(startPos, startPos, true);
        }
    }

    return Promise.resolve();
}

function up (element) {
    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'up');

    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return home(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorUp(element, false);

    return Promise.resolve();
}

function down (element) {
    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'down');

    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return end(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorDown(element, false);

    return Promise.resolve();
}

function home (element, withSelection) {
    if (domUtils.isTextEditableElement(element)) {
        var startPos          = textSelection.getSelectionStart(element);
        var endPos            = textSelection.getSelectionEnd(element);
        var inverseSelection  = textSelection.hasInverseSelection(element);
        var referencePosition = null;

        var isSingleLineSelection = !domUtils.isTextAreaElement(element) ? true :
            domUtils.getTextareaLineNumberByPosition(element, startPos) ===
                                    domUtils.getTextareaLineNumberByPosition(element, endPos);

        if (isSingleLineSelection)
            referencePosition = inverseSelection ? endPos : startPos;
        else
            referencePosition = inverseSelection ? startPos : endPos;

        var valueBeforeCursor  = domUtils.getElementValue(element).substring(0, referencePosition);
        var lastLineBreakIndex = valueBeforeCursor.lastIndexOf('\n');
        var newPosition        = lastLineBreakIndex === -1 ? 0 : lastLineBreakIndex + 1;
        var newStartPos        = null;
        var newEndPos          = null;

        if (isSingleLineSelection) {
            newStartPos = newPosition;
            newEndPos   = withSelection ? referencePosition : newPosition;

            textSelection.select(element, newEndPos, newStartPos);
        }
        else if (!inverseSelection)
            textSelection.select(element, startPos, newPosition);
        else
            textSelection.select(element, endPos, newPosition);
    }

    return Promise.resolve();
}

function end (element, withSelection) {
    if (domUtils.isTextEditableElement(element)) {
        var startPos          = textSelection.getSelectionStart(element);
        var endPos            = textSelection.getSelectionEnd(element);
        var inverseSelection  = textSelection.hasInverseSelection(element);
        var referencePosition = null;

        var isSingleLineSelection = !domUtils.isTextAreaElement(element) ? true :
            domUtils.getTextareaLineNumberByPosition(element, startPos) ===
                                    domUtils.getTextareaLineNumberByPosition(element, endPos);


        if (isSingleLineSelection)
            referencePosition = inverseSelection ? endPos : startPos;
        else
            referencePosition = inverseSelection ? startPos : endPos;

        var valueAsterCursor    = domUtils.getElementValue(element).substring(referencePosition);
        var firstLineBreakIndex = valueAsterCursor.indexOf('\n');
        var newPosition         = referencePosition;
        var newStartPos         = null;
        var newEndPos           = null;

        newPosition += firstLineBreakIndex === -1 ? valueAsterCursor.length : firstLineBreakIndex;

        if (isSingleLineSelection) {
            newStartPos = withSelection ? referencePosition : newPosition;
            newEndPos   = newPosition;

            textSelection.select(element, newStartPos, newEndPos);
        }
        else if (!inverseSelection)
            textSelection.select(element, startPos, newPosition);
        else
            textSelection.select(element, endPos, newPosition);
    }

    return Promise.resolve();
}

function esc (element) {
    if (domUtils.isSelectElement(element))
        selectElement.collapseOptionList();

    return Promise.resolve();
}

function shiftUp (element) {
    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return shiftHome(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorUp(element, true);

    return Promise.resolve();
}

function shiftDown (element) {
    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return shiftEnd(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorDown(element, true);

    return Promise.resolve();
}

function shiftLeft (element) {
    if (domUtils.isTextEditableElement(element)) {
        var startPos = textSelection.getSelectionStart(element);
        var endPos   = textSelection.getSelectionEnd(element);

        if (startPos === endPos || textSelection.hasInverseSelection(element))
            textSelection.select(element, endPos, Math.max(startPos - 1, 0));
        else
            textSelection.select(element, startPos, Math.max(endPos - 1, 0));

        updateTextAreaIndent(element);
    }

    return Promise.resolve();
}

function shiftRight (element) {
    if (domUtils.isTextEditableElement(element)) {
        var startPos    = textSelection.getSelectionStart(element);
        var endPos      = textSelection.getSelectionEnd(element);
        var valueLength = domUtils.getElementValue(element).length;

        if (startPos === endPos || !textSelection.hasInverseSelection(element))
            textSelection.select(element, startPos, Math.min(endPos + 1, valueLength));
        else
            textSelection.select(element, endPos, Math.min(startPos + 1, valueLength));

        updateTextAreaIndent(element);
    }

    return Promise.resolve();
}

function shiftHome (element) {
    return home(element, true);
}

function shiftEnd (element) {
    return end(element, true);
}

function enter (element) {
    if (domUtils.isSelectElement(element))
        selectElement.collapseOptionList();

    //submit form on enter pressed
    if (domUtils.isInputElement(element)) {
        if (!browserUtils.isIE)
            elementEditingWatcher.processElementChanging(element);

        var form = domUtils.getParents(element, 'form')[0];

        // NOTE: if a user presses enter when a form input is focused and the form has
        // a submit button, the browser sends the click event to the submit button
        if (form)
            submitFormOnEnterPressInInput(form, element);
    }
    else if (domUtils.isTextAreaElement(element)) {
        var startPos          = textSelection.getSelectionStart(element);
        var value             = domUtils.getTextAreaValue(element);
        var valueBeforeCursor = value.substring(0, startPos);
        var valueAfterCursor  = value.substring(startPos);
        var newPosition       = startPos + 1;

        setElementValue(element, valueBeforeCursor + String.fromCharCode(10) + valueAfterCursor, newPosition);
    }
    //S173120
    else if (element.tagName && domUtils.isAnchorElement(element))
        eventSimulator.click(element);

    return Promise.resolve();
}

function focusNextElement (element) {
    return new Promise(resolve => {
        if (domUtils.isSelectElement(element)) {
            selectElement.collapseOptionList();
            resolve();
        }

        var nextElement = domUtils.getNextFocusableElement(element);

        if (!nextElement)
            resolve();

        focusBlurSandbox.focus(nextElement, () => {
            if (domUtils.isTextEditableInput(nextElement))
                textSelection.select(nextElement);

            resolve();
        });
    });
}

function focusPrevElement (element) {
    return new Promise(resolve => {
        if (domUtils.isSelectElement(element)) {
            selectElement.collapseOptionList();
            resolve();
        }

        var prevElement = domUtils.getNextFocusableElement(element, true);

        if (!prevElement)
            resolve();

        focusBlurSandbox.focus(prevElement, () => {
            if (domUtils.isTextEditableInput(prevElement))
                textSelection.select(prevElement);

            resolve();
        });
    });
}

export default {
    'ctrl+a':      selectAll,
    'backspace':   backspace,
    'delete':      del,
    'left':        left,
    'right':       right,
    'up':          up,
    'down':        down,
    'shift+left':  shiftLeft,
    'shift+right': shiftRight,
    'shift+up':    shiftUp,
    'shift+down':  shiftDown,
    'shift+home':  shiftHome,
    'shift+end':   shiftEnd,
    'home':        home,
    'end':         end,
    'enter':       enter,
    'tab':         focusNextElement,
    'shift+tab':   focusPrevElement,
    'esc':         esc
};
