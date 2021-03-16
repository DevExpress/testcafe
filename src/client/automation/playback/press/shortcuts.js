import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';

import SHORTCUT_TYPE from './shortcut-type';
import { focusNextElement } from './utils';

const Promise               = hammerhead.Promise;
const browserUtils          = hammerhead.utils.browser;
const eventSimulator        = hammerhead.eventSandbox.eventSimulator;
const elementEditingWatcher = hammerhead.eventSandbox.elementEditingWatcher;

const textSelection = testCafeCore.textSelection;
const eventUtils    = testCafeCore.eventUtils;
const domUtils      = testCafeCore.domUtils;
const selectElement = testCafeUI.selectElement;


let currentTextarea             = null;
let currentTextareaCursorIndent = null;

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
    const inverseSelection = textSelection.hasInverseSelection(textarea);
    const textareaValue    = domUtils.getTextAreaValue(textarea);

    const cursorPosition = inverseSelection ?
        textSelection.getSelectionStart(textarea) :
        textSelection.getSelectionEnd(textarea);

    if (!textareaValue || !cursorPosition)
        return 0;

    return domUtils.getTextareaIndentInLine(textarea, cursorPosition);
}

function moveTextAreaCursorUp (element, withSelection) {
    const textareaValue = domUtils.getTextAreaValue(element);

    if (!textareaValue)
        return;

    const startPos                = textSelection.getSelectionStart(element);
    const endPos                  = textSelection.getSelectionEnd(element);
    const hasInverseSelection     = textSelection.hasInverseSelection(element);
    const partBeforeCursor        = textareaValue.substring(0, hasInverseSelection ? startPos : endPos);
    let lastLineBreakIndex      = partBeforeCursor.lastIndexOf('\n');
    const partBeforeLastLineBreak = partBeforeCursor.substring(0, lastLineBreakIndex);

    if (currentTextareaCursorIndent === null || currentTextarea !== element)
        updateTextAreaIndent(element);

    lastLineBreakIndex = partBeforeLastLineBreak.lastIndexOf('\n');
    const newPosition    = Math.min(lastLineBreakIndex + 1 + currentTextareaCursorIndent, partBeforeLastLineBreak.length);

    moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
}

function moveTextAreaCursorDown (element, withSelection) {
    const textareaValue = domUtils.getTextAreaValue(element);

    if (!textareaValue)
        return;

    const startPos            = textSelection.getSelectionStart(element);
    const endPos              = textSelection.getSelectionEnd(element);
    const hasInverseSelection = textSelection.hasInverseSelection(element);
    const cursorPosition      = hasInverseSelection ? startPos : endPos;
    const partAfterCursor     = textareaValue.substring(cursorPosition);
    let firstLineBreakIndex = partAfterCursor.indexOf('\n');
    const nextLineStartIndex  = firstLineBreakIndex === -1 ? partAfterCursor.length : firstLineBreakIndex + 1;
    const partAfterNewIndent  = partAfterCursor.substring(nextLineStartIndex);
    let newPosition         = cursorPosition + nextLineStartIndex;

    firstLineBreakIndex = partAfterNewIndent.indexOf('\n');
    const maxIndent       = firstLineBreakIndex === -1 ? partAfterNewIndent.length : firstLineBreakIndex;

    if (currentTextareaCursorIndent === null || currentTextarea !== element)
        updateTextAreaIndent(element);

    newPosition = Math.min(newPosition + currentTextareaCursorIndent, newPosition + maxIndent);

    moveTextAreaCursor(element, startPos, endPos, hasInverseSelection, newPosition, withSelection);
}

function moveTextAreaCursor (element, startPos, endPos, hasInverseSelection, newPosition, withSelection) {
    let newStart = null;
    let newEnd   = null;

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
    const buttons      = form.querySelectorAll('input, button');
    let submitButton = null;
    let i            = null;

    for (i = 0; i < buttons.length; i++) {
        if (!submitButton && buttons[i].type === 'submit' && !buttons[i].disabled) {
            submitButton = buttons[i];
            break;
        }
    }

    if (submitButton)
        eventSimulator.click(submitButton);
    else if (domUtils.blocksImplicitSubmission(inputElement)) {
        const formInputs = form.getElementsByTagName('input');
        const textInputs = [];

        for (i = 0; i < formInputs.length; i++) {
            if (domUtils.blocksImplicitSubmission(formInputs[i]))
                textInputs.push(formInputs[i]);
        }

        // NOTE: the form is submitted on enter press if there is only one input of the following types on it
        //  and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
        if (textInputs.length === 1 && textInputs[0] === inputElement) {
            const isInputValid = inputElement.validity.valid;

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
        const startPos = textSelection.getSelectionStart(element);
        const endPos   = textSelection.getSelectionEnd(element);
        const value    = domUtils.getElementValue(element).replace(/\r\n/g, '\n');

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
        const startPos = textSelection.getSelectionStart(element);
        const endPos   = textSelection.getSelectionEnd(element);
        const value    = domUtils.getElementValue(element).replace(/\r\n/g, '\n');

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
    let startPosition = null;
    let endPosition   = null;

    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'left');

    if (isRadioButtonNavigationRequired(element))
        return focusAndCheckNextRadioButton(element, true);

    if (domUtils.isTextEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element) || 0;
        endPosition   = textSelection.getSelectionEnd(element);

        const newPosition = startPosition === endPosition ? startPosition - 1 : startPosition;

        textSelection.select(element, newPosition, newPosition);
        updateTextAreaIndent(element);
    }

    if (domUtils.isContentEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element);
        endPosition   = textSelection.getSelectionEnd(element);

        // NOTE: we only remove selection
        if (startPosition !== endPosition) {
            const selection        = textSelection.getSelectionByElement(element);
            const inverseSelection = textSelection.hasInverseSelectionContentEditable(element);
            const startNode        = inverseSelection ? selection.focusNode : selection.anchorNode;
            const startOffset      = inverseSelection ? selection.focusOffset : selection.anchorOffset;
            const startPos         = { node: startNode, offset: startOffset };

            textSelection.selectByNodesAndOffsets(startPos, startPos, true);
        }
    }

    return Promise.resolve();
}

function right (element) {
    let startPosition = null;
    let endPosition   = null;

    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'right');

    if (isRadioButtonNavigationRequired(element))
        return focusAndCheckNextRadioButton(element, false);

    if (domUtils.isTextEditableElement(element)) {
        startPosition = textSelection.getSelectionStart(element);
        endPosition   = textSelection.getSelectionEnd(element);

        let newPosition = startPosition === endPosition ? endPosition + 1 : endPosition;

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
            const selection        = textSelection.getSelectionByElement(element);
            const inverseSelection = textSelection.hasInverseSelectionContentEditable(element);
            const endNode          = inverseSelection ? selection.anchorNode : selection.focusNode;
            const endOffset        = inverseSelection ? selection.anchorOffset : selection.focusOffset;
            const startPos         = { node: endNode, offset: endOffset };

            textSelection.selectByNodesAndOffsets(startPos, startPos, true);
        }
    }

    return Promise.resolve();
}

function up (element) {
    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'up');

    if (isRadioButtonNavigationRequired(element))
        return focusAndCheckNextRadioButton(element, true);

    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return home(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorUp(element, false);

    return Promise.resolve();
}

function down (element) {
    if (domUtils.isSelectElement(element))
        selectElement.switchOptionsByKeys(element, 'down');

    if (isRadioButtonNavigationRequired(element))
        return focusAndCheckNextRadioButton(element, false);

    if (browserUtils.isWebKit && domUtils.isInputElement(element))
        return end(element);

    if (domUtils.isTextAreaElement(element))
        moveTextAreaCursorDown(element, false);

    return Promise.resolve();
}

function home (element, withSelection) {
    if (domUtils.isTextEditableElement(element)) {
        const startPos          = textSelection.getSelectionStart(element);
        const endPos            = textSelection.getSelectionEnd(element);
        const inverseSelection  = textSelection.hasInverseSelection(element);
        let referencePosition = null;

        const isSingleLineSelection = !domUtils.isTextAreaElement(element) ? true :
            domUtils.getTextareaLineNumberByPosition(element, startPos) ===
                                    domUtils.getTextareaLineNumberByPosition(element, endPos);

        if (isSingleLineSelection)
            referencePosition = inverseSelection ? endPos : startPos;
        else
            referencePosition = inverseSelection ? startPos : endPos;

        const valueBeforeCursor  = domUtils.getElementValue(element).substring(0, referencePosition);
        const lastLineBreakIndex = valueBeforeCursor.lastIndexOf('\n');
        const newPosition        = lastLineBreakIndex === -1 ? 0 : lastLineBreakIndex + 1;
        let newStartPos        = null;
        let newEndPos          = null;

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
        const startPos          = textSelection.getSelectionStart(element);
        const endPos            = textSelection.getSelectionEnd(element);
        const inverseSelection  = textSelection.hasInverseSelection(element);
        let referencePosition = null;

        const isSingleLineSelection = !domUtils.isTextAreaElement(element) ? true :
            domUtils.getTextareaLineNumberByPosition(element, startPos) ===
                                    domUtils.getTextareaLineNumberByPosition(element, endPos);


        if (isSingleLineSelection)
            referencePosition = inverseSelection ? endPos : startPos;
        else
            referencePosition = inverseSelection ? startPos : endPos;

        const valueAsterCursor    = domUtils.getElementValue(element).substring(referencePosition);
        const firstLineBreakIndex = valueAsterCursor.indexOf('\n');
        let newPosition         = referencePosition;
        let newStartPos         = null;
        let newEndPos           = null;

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
        const startPos = textSelection.getSelectionStart(element);
        const endPos   = textSelection.getSelectionEnd(element);

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
        const startPos    = textSelection.getSelectionStart(element);
        const endPos      = textSelection.getSelectionEnd(element);
        const valueLength = domUtils.getElementValue(element).length;

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

        const form = domUtils.getParents(element, 'form')[0];

        // NOTE: if a user presses enter when a form input is focused and the form has
        // a submit button, the browser sends the click event to the submit button
        if (form)
            submitFormOnEnterPressInInput(form, element);
    }
    else if (domUtils.isTextAreaElement(element)) {
        const startPos          = textSelection.getSelectionStart(element);
        const value             = domUtils.getTextAreaValue(element);
        const valueBeforeCursor = value.substring(0, startPos);
        const valueAfterCursor  = value.substring(startPos);
        const newPosition       = startPos + 1;

        setElementValue(element, valueBeforeCursor + String.fromCharCode(10) + valueAfterCursor, newPosition);
    }
    //S173120
    else if (element.tagName && domUtils.isAnchorElement(element))
        eventSimulator.click(element);

    return Promise.resolve();
}

function isRadioButtonNavigationRequired (element) {
    return domUtils.isRadioButtonElement(element) && !browserUtils.isFirefox;
}

function focusAndCheckNextRadioButton (element, reverse) {
    return focusNextElementOnNavigationButton(element, reverse, false)
        .then(focusedElement => {
            if (focusedElement)
                focusedElement.checked = true;
        });
}

function focusNextElementOnNavigationButton (element, reverse, skipRadioGroups = true) {
    if (!element)
        return Promise.resolve();

    if (domUtils.isSelectElement(element))
        selectElement.collapseOptionList();


    return focusNextElement(element, reverse, skipRadioGroups)
        .then(nextElement => {
            if (nextElement && domUtils.isTextEditableInput(nextElement))
                textSelection.select(nextElement);
            return nextElement;
        });
}

export default {
    [SHORTCUT_TYPE.ctrlA]:      selectAll,
    [SHORTCUT_TYPE.backspace]:  backspace,
    [SHORTCUT_TYPE.delete]:     del,
    [SHORTCUT_TYPE.left]:       left,
    [SHORTCUT_TYPE.right]:      right,
    [SHORTCUT_TYPE.up]:         up,
    [SHORTCUT_TYPE.down]:       down,
    [SHORTCUT_TYPE.shiftLeft]:  shiftLeft,
    [SHORTCUT_TYPE.shiftRight]: shiftRight,
    [SHORTCUT_TYPE.shiftUp]:    shiftUp,
    [SHORTCUT_TYPE.shiftDown]:  shiftDown,
    [SHORTCUT_TYPE.shiftHome]:  shiftHome,
    [SHORTCUT_TYPE.shiftEnd]:   shiftEnd,
    [SHORTCUT_TYPE.home]:       home,
    [SHORTCUT_TYPE.end]:        end,
    [SHORTCUT_TYPE.enter]:      enter,
    [SHORTCUT_TYPE.tab]:        element => focusNextElementOnNavigationButton(element, false),
    [SHORTCUT_TYPE.shiftTab]:   element => focusNextElementOnNavigationButton(element, true),
    [SHORTCUT_TYPE.esc]:        esc
};
