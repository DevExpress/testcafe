import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import typeCharPlaybackAutomation from '../playback/type-char';
import async from '../../deps/async';


var browserUtils          = hammerhead.utils.browser;
var extend                = hammerhead.utils.extend;
var eventSimulator        = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox      = hammerhead.eventSandbox.focusBlur;
var elementEditingWatcher = hammerhead.eventSandbox.elementEditingWatcher;

var domUtils      = testCafeCore.domUtils;
var keyCharUtils  = testCafeCore.keyCharUtils;
var textSelection = testCafeCore.textSelection;
var eventUtils    = testCafeCore.eventUtils;
var arrayUtils    = testCafeCore.arrayUtils;


const KEY_PRESS_DELAY = 80;


//utils
var keyHelper = function (key) {
    var isChar                      = key.length === 1 || key === 'space',
        sanitizedKey                = isChar ? key : key.toLowerCase(),
        beforeKeydownActiveElement  = null,
        beforeKeypressActiveElement = null;

    if (keyCharUtils.KEYS_MAPS.MODIFIERS_MAP[sanitizedKey])
        sanitizedKey = keyCharUtils.KEYS_MAPS.MODIFIERS_MAP[sanitizedKey];

    var keyCode         = null,
        modifierKeyCode = keyCharUtils.KEYS_MAPS.MODIFIERS[sanitizedKey],
        specialKeyCode  = keyCharUtils.KEYS_MAPS.SPECIAL_KEYS[sanitizedKey];

    if (isChar && key !== 'space')
        keyCode = keyCharUtils.getKeyCodeByChar(sanitizedKey);
    else if (modifierKeyCode)
        keyCode = modifierKeyCode;
    else if (specialKeyCode)
        keyCode = specialKeyCode;

    return {
        down: function (modifiersState) {
            var activeElement          = domUtils.getActiveElement();
            beforeKeydownActiveElement = activeElement;

            if (modifierKeyCode)
                modifiersState[sanitizedKey] = true;
            return eventSimulator.keydown(activeElement, extend({ keyCode: keyCode }, modifiersState));
        },

        press: function (modifiersState) {
            var activeElement = domUtils.getActiveElement();

            if (!(isChar || specialKeyCode))
                return true;

            function getChar (key) {
                if (key === 'space')
                    return ' ';

                if (modifiersState.shift) {
                    if (keyCharUtils.isLetter(key))
                        return keyCharUtils.changeLetterCase(key);

                    if (keyCharUtils.KEYS_MAPS.REVERSED_SHIFT_MAP[key])
                        return keyCharUtils.KEYS_MAPS.REVERSED_SHIFT_MAP[key];
                }
                return key;
            }

            var character = isChar ? getChar(sanitizedKey) : null,
                charCode  = specialKeyCode || character.charCodeAt(0);

            if (browserUtils.isWebKit && activeElement !== beforeKeydownActiveElement &&
                domUtils.isElementInIframe(activeElement) !== domUtils.isElementInIframe(beforeKeydownActiveElement))
                return true;

            beforeKeypressActiveElement = activeElement;
            var raiseDefault            = eventSimulator.keypress(
                activeElement,
                extend({ keyCode: charCode, charCode: charCode }, modifiersState)
            );

            activeElement = domUtils.getActiveElement();

            var caretPos = domUtils.isInputWithoutSelectionPropertiesInFirefox(activeElement) ? activeElement.value.length : null;

            if (raiseDefault) {
                if (character && !(modifiersState.ctrl || modifiersState.alt)) {
                    //T210448 - Unnecessary typing occurs if element was changed after keydown/keypress event
                    try {
                        if (beforeKeypressActiveElement === activeElement ||
                            (!(browserUtils.isFirefox && !domUtils.isEditableElement(beforeKeypressActiveElement)) &&
                             !(browserUtils.isWebKit && domUtils.isElementInIframe(activeElement) !==
                                                        domUtils.isElementInIframe(beforeKeypressActiveElement) &&
                             !domUtils.isEditableElement(beforeKeypressActiveElement)))) {
                            var elementForTyping = activeElement;

                            if (!browserUtils.isIE && activeElement !== beforeKeypressActiveElement &&
                                domUtils.isEditableElement(beforeKeypressActiveElement) &&
                                domUtils.isEditableElement(activeElement))
                                elementForTyping = beforeKeypressActiveElement;

                            typeCharPlaybackAutomation(elementForTyping, character, caretPos);
                        }
                    }
                    catch (err) {
                    }
                }

                if (sanitizedKey === 'enter' && activeElement.tagName &&
                    activeElement.tagName.toLowerCase() === 'input' && /button|submit|reset/.test(activeElement.type)) {
                    activeElement.click();
                }
            }

            return raiseDefault;
        },

        up: function (modifiersState) {
            if (modifierKeyCode)
                modifiersState[sanitizedKey] = false;

            var raiseDefault  = eventSimulator.keyup(domUtils.getActiveElement(), extend({ keyCode: keyCode }, modifiersState)),

                activeElement = domUtils.getActiveElement();

            if (raiseDefault && sanitizedKey === 'space' && activeElement.tagName &&
                activeElement.tagName.toLowerCase() === 'input' &&
                /button|submit|reset|radio|checkbox/.test(activeElement.type)) {
                activeElement.click();
            }

            return raiseDefault;
        },

        getKey: function () {
            return sanitizedKey;
        }
    };
};

function getLineIndentInTextarea (textarea) {
    var textareaValue    = textarea.value,
        inverseSelection = textSelection.hasInverseSelection(textarea),
        cursorPosition   = inverseSelection ?
                           textSelection.getSelectionStart(textarea) :
                           textSelection.getSelectionEnd(textarea);

    if (!textareaValue || !cursorPosition)
        return 0;

    return domUtils.getTextareaIndentInLine(textarea, cursorPosition);
}

//api
var supportedShortcutHandlers = (function () {
    //utils
    var curTextareaElement      = null,
        curTextareaCursorIndent = null;

    function onTextAreaBlur () {
        curTextareaElement      = null;
        curTextareaCursorIndent = null;
        eventUtils.unbind(this, 'blur', onTextAreaBlur, true);
    }

    function updateTextAreaIndent (element) {
        if (element.tagName.toLowerCase() === 'textarea') {
            if (curTextareaElement !== element) {
                eventUtils.bind(element, 'blur', onTextAreaBlur, true);
                curTextareaElement = element;
            }

            curTextareaCursorIndent = getLineIndentInTextarea(element);
        }
    }

    function moveTextAreaCursorUp (element, withSelection) {
        var textareaValue = element.value;

        if (textareaValue) {
            var hasInverseSelection = textSelection.hasInverseSelection(element),
                start               = textSelection.getSelectionStart(element),
                end                 = textSelection.getSelectionEnd(element),
                partBeforeSelection = textareaValue.substring(0, hasInverseSelection ? start : end),
                topIndex            = partBeforeSelection.lastIndexOf('\n'),
                top                 = partBeforeSelection.substring(0, topIndex);

            if (curTextareaCursorIndent === null || curTextareaElement !== element)
                updateTextAreaIndent(element);

            var newPosition = Math.min(top.lastIndexOf('\n') + 1 + curTextareaCursorIndent, top.length);

            moveTextAreaCursor(element, start, end, hasInverseSelection, newPosition, withSelection);
        }
    }

    function moveTextAreaCursorDown (element, withSelection) {
        var textareaValue = element.value;

        if (textareaValue) {
            var hasInverseSelection = textSelection.hasInverseSelection(element),
                start               = textSelection.getSelectionStart(element),
                end                 = textSelection.getSelectionEnd(element),
                last                = textareaValue.substring(hasInverseSelection ? start : end),
                nextIndex           = last.indexOf('\n') === -1 ? last.length : last.indexOf('\n') + 1,
                bottom              = last.substring(nextIndex),
                newPosition         = (hasInverseSelection ? start : end) + nextIndex,
                maxIndent           = bottom.indexOf('\n') === -1 ? bottom.length : bottom.indexOf('\n');

            if (curTextareaCursorIndent === null || curTextareaElement !== element)
                updateTextAreaIndent(element);

            if (curTextareaCursorIndent >= maxIndent)
                newPosition += maxIndent;
            else
                newPosition += curTextareaCursorIndent;

            moveTextAreaCursor(element, start, end, hasInverseSelection, newPosition, withSelection);
        }
    }

    function moveTextAreaCursor (element, start, end, hasInverseSelection, newPosition, withSelection) {
        var newStart = null,
            newEnd   = null,
            inverse  = null;

        if (withSelection) {
            if (start === end) {
                if (newPosition < start) {
                    newStart = newPosition;
                    newEnd   = start;
                    inverse  = true;
                }
                else {
                    newStart = start;
                    newEnd   = newPosition;
                }
            }
            else {
                if (!hasInverseSelection) {
                    if (newPosition < start) {
                        newStart = newPosition;
                        newEnd   = start;
                        inverse  = true;
                    }
                    else {
                        newStart = start;
                        newEnd   = newPosition;
                    }
                }
                else {
                    if (newPosition > end) {
                        newStart = end;
                        newEnd   = newPosition;
                    }
                    else {
                        newStart = newPosition;
                        newEnd   = end;
                        inverse  = true;
                    }
                }
            }
        }
        else
            newEnd = newStart = newPosition;

        textSelection.select(element, newStart, newEnd, inverse);
    }

    function setElementValue (element, value) {
        element.value = value;
        eventSimulator.input(element);
    }

    //shortcuts
    function selectAll (element, callback) {
        if (domUtils.isEditableElement(element))
            textSelection.select(element);

        callback();
    }

    function backspace (element, callback) {
        if (domUtils.isTextEditableElementAndEditingAllowed(element)) {
            var startSelection = textSelection.getSelectionStart(element),
                endSelection   = textSelection.getSelectionEnd(element),

                value          = element.value.replace(/\r\n/g, '\n');


            if (endSelection === startSelection) {
                if (startSelection > 0) {
                    setElementValue(element, value.substring(0, startSelection - 1) +
                                             value.substring(endSelection, value.length));
                    textSelection.select(element, startSelection - 1, startSelection - 1);
                }
            }
            else {
                setElementValue(element, value.substring(0, startSelection) +
                                         value.substring(endSelection, value.length));
                textSelection.select(element, startSelection, startSelection);
            }
        }
        else if (domUtils.isContentEditableElement(element))
            textSelection.deleteSelectionContents(element);

        callback();
    }

    function del (element, callback) {
        if (domUtils.isTextEditableElementAndEditingAllowed(element)) {
            var startSelection = textSelection.getSelectionStart(element),
                endSelection   = textSelection.getSelectionEnd(element),

                value          = element.value.replace(/\r\n/g, '\n');

            if (endSelection === startSelection) {
                if (startSelection < value.length) {
                    setElementValue(element, value.substring(0, startSelection) +
                                             value.substring(endSelection + 1, value.length));
                    textSelection.select(element, startSelection, startSelection);
                }
            }
            else {
                setElementValue(element, value.substring(0, startSelection) +
                                         value.substring(endSelection, value.length));
                textSelection.select(element, startSelection, startSelection);
            }
        }
        else if (domUtils.isContentEditableElement(element))
            textSelection.deleteSelectionContents(element);

        callback();
    }

    function left (element, callback) {
        var startSelection = null,
            endSelection   = null;

        if (domUtils.isTextEditableElement(element)) {
            startSelection = textSelection.getSelectionStart(element);
            endSelection   = textSelection.getSelectionEnd(element);

            var newPosition = startSelection ?
                              startSelection === endSelection ? startSelection - 1 : startSelection :
                              0;

            textSelection.select(element, newPosition, newPosition);
            updateTextAreaIndent(element);
        }
        else if (domUtils.isContentEditableElement(element)) {
            startSelection = textSelection.getSelectionStart(element);
            endSelection   = textSelection.getSelectionEnd(element);

            //NOTE: we only remove selection
            if (startSelection !== endSelection) {
                var selection        = textSelection.getSelectionByElement(element),
                    inverseSelection = textSelection.hasInverseSelectionContentEditable(element),
                    startNode        = inverseSelection ? selection.focusNode : selection.anchorNode,
                    startOffset      = inverseSelection ? selection.focusOffset : selection.anchorOffset;

                textSelection.selectByNodesAndOffsets(startNode, startOffset, startNode, startOffset, true, false);
            }
        }

        callback();
    }

    function right (element, callback) {
        var startSelection = null,
            endSelection   = null;

        if (domUtils.isTextEditableElement(element)) {
            startSelection = textSelection.getSelectionStart(element);
            endSelection   = textSelection.getSelectionEnd(element);

            var newPosition = startSelection === element.value.length ?
                              startSelection :
                              startSelection === endSelection ? startSelection + 1 : endSelection;

            textSelection.select(element, newPosition, newPosition);
            updateTextAreaIndent(element);
        }
        else if (domUtils.isContentEditableElement(element)) {
            startSelection = textSelection.getSelectionStart(element);
            endSelection   = textSelection.getSelectionEnd(element);

            //NOTE: we only remove selection
            if (startSelection !== endSelection) {
                var selection        = textSelection.getSelectionByElement(element),
                    inverseSelection = textSelection.hasInverseSelectionContentEditable(element),
                    endNode          = inverseSelection ? selection.anchorNode : selection.focusNode,
                    endOffset        = inverseSelection ? selection.anchorOffset : selection.focusOffset;

                textSelection.selectByNodesAndOffsets(endNode, endOffset, endNode, endOffset, true, false);
            }
        }

        callback();
    }

    function up (element, callback) {
        if (browserUtils.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
            home(element, callback);
            return;
        }

        if (element.tagName && element.tagName.toLowerCase() === 'textarea')
            moveTextAreaCursorUp(element, false);

        callback();
    }

    function down (element, callback) {
        if (browserUtils.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
            end(element, callback);
            return;
        }

        if (element.tagName && element.tagName.toLowerCase() === 'textarea') {
            moveTextAreaCursorDown(element, false);
        }

        callback();
    }

    function home (element, callback, withSelection) {
        if (domUtils.isTextEditableElement(element)) {
            var elementValue           = element.value,
                selectionStartPosition = textSelection.getSelectionStart(element),
                selectionEndPosition   = textSelection.getSelectionEnd(element),
                inverseSelection       = textSelection.hasInverseSelection(element),

                isSingleLineSelection  = element.tagName.toLocaleLowerCase() !== 'textarea' ? true :
                                         domUtils.getTextareaLineNumberByPosition(element, selectionStartPosition) ===
                                         domUtils.getTextareaLineNumberByPosition(element, selectionEndPosition),

                referencePosition      = null;

            if (isSingleLineSelection)
                referencePosition = inverseSelection ? selectionEndPosition : selectionStartPosition;
            else
                referencePosition = inverseSelection ? selectionStartPosition : selectionEndPosition;

            var partBefore  = elementValue.substring(0, referencePosition),
                newPosition = partBefore.lastIndexOf('\n') === -1 ? 0 : partBefore.lastIndexOf('\n') + 1;

            if (isSingleLineSelection)
                textSelection.select(element, newPosition, withSelection ? referencePosition : newPosition, withSelection);
            else
                textSelection.select(element, inverseSelection ? newPosition : selectionStartPosition, inverseSelection ? selectionEndPosition : newPosition, inverseSelection);
        }

        callback();
    }

    function end (element, callback, withSelection) {
        if (domUtils.isTextEditableElement(element)) {
            var elementValue           = element.value,
                selectionStartPosition = textSelection.getSelectionStart(element),
                selectionEndPosition   = textSelection.getSelectionEnd(element),
                inverseSelection       = textSelection.hasInverseSelection(element),

                isSingleLineSelection  = element.tagName.toLocaleLowerCase() !== 'textarea' ? true :
                                         domUtils.getTextareaLineNumberByPosition(element, selectionStartPosition) ===
                                         domUtils.getTextareaLineNumberByPosition(element, selectionEndPosition),

                referencePosition      = null;

            if (isSingleLineSelection)
                referencePosition = inverseSelection ? selectionEndPosition : selectionStartPosition;
            else
                referencePosition = inverseSelection ? selectionStartPosition : selectionEndPosition;

            var partAfter   = elementValue.substring(referencePosition),
                newPosition = referencePosition;

            newPosition += partAfter.indexOf('\n') === -1 ? partAfter.length : partAfter.indexOf('\n');

            if (isSingleLineSelection)
                textSelection.select(element, withSelection ? referencePosition : newPosition, newPosition);
            else
                textSelection.select(element, inverseSelection ? newPosition : selectionStartPosition, inverseSelection ? selectionEndPosition : newPosition, inverseSelection);
        }
        callback();
    }

    function shiftUp (element, callback) {
        if (browserUtils.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
            shiftHome(element, callback);
            return;
        }

        if (element.tagName && element.tagName.toLowerCase() === 'textarea')
            moveTextAreaCursorUp(element, true);

        callback();
    }

    function shiftDown (element, callback) {
        if (browserUtils.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
            shiftEnd(element, callback);
            return;
        }

        if (element.tagName && element.tagName.toLowerCase() === 'textarea')
            moveTextAreaCursorDown(element, true);

        callback();
    }

    function shiftLeft (element, callback) {
        if (domUtils.isTextEditableElement(element)) {
            var start = textSelection.getSelectionStart(element),
                end   = textSelection.getSelectionEnd(element);

            if (start === end || textSelection.hasInverseSelection(element))
                textSelection.select(element, Math.max(start - 1, 0), end, true);
            else
                textSelection.select(element, start, Math.max(end - 1, 0), end - 1 < start);

            updateTextAreaIndent(element);
        }

        callback();
    }

    function shiftRight (element, callback) {
        if (domUtils.isTextEditableElement(element)) {
            var start = textSelection.getSelectionStart(element),
                end   = textSelection.getSelectionEnd(element);

            if (start === end || !textSelection.hasInverseSelection(element))
                textSelection.select(element, start, Math.min(end + 1, element.value.length));
            else
                textSelection.select(element, Math.min(start + 1, element.value.length), end, start + 1 < end);

            updateTextAreaIndent(element);
        }

        callback();
    }

    function shiftHome (element, callback) {
        home(element, callback, true);
    }

    function shiftEnd (element, callback) {
        end(element, callback, true);
    }

    function enter (element, callback) {
        //submit form on enter pressed
        if (/input/i.test(element.tagName)) {
            if (!browserUtils.isIE)
                elementEditingWatcher.processElementChanging(element);

            var form = domUtils.getParents(element, 'form')[0];

            if (form) {
                //if user presses enter when form input is focused, and the form has a submit button,
                //  browser sends click event to the submit button
                var buttons      = form.querySelectorAll('input, button');
                var submitButton = null;

                for (var i = 0; i < buttons.length; i++) {
                    if (!submitButton && buttons[i].type === 'submit' && !buttons[i].disabled) {
                        submitButton = buttons[i];
                        break;
                    }
                }

                if (submitButton)
                    eventSimulator.click(submitButton);
                else {
                    if (domUtils.blocksImplicitSubmission(element)) {
                        var formInputs = form.getElementsByTagName('input');
                        var textInputs = [];

                        for (var i = 0; i < formInputs.length; i++) {
                            if (domUtils.blocksImplicitSubmission(formInputs[i]))
                                textInputs.push(formInputs[i]);
                        }

                        if (textInputs.length === 1 && textInputs[0] === element &&
                            (browserUtils.isSafari || !element.validity || element.validity.valid)) {
                            if (eventSimulator.submit(form))
                                form.submit();
                        }
                    }
                }
            }
        }
        else if (element.tagName && element.tagName.toLowerCase() === 'textarea') {
            var startSelection = textSelection.getSelectionStart(element),
                elementValue   = element.value,
                newPosition    = textSelection.getSelectionStart(element) + 1;

            setElementValue(element, elementValue.substring(0, startSelection) + String.fromCharCode(10) +
                                     elementValue.substring(startSelection));
            textSelection.select(element, newPosition, newPosition);
        }
        //S173120
        else if (element.tagName && element.tagName.toLowerCase() === 'a')
            eventSimulator.click(element);

        callback();
    }

    function focusNextElement (element, callback) {
        var nextElement = domUtils.getNextFocusableElement(element);

        if (!nextElement)
            return;

        focusBlurSandbox.focus(nextElement, function () {
            if (domUtils.isTextEditableInput(nextElement))
                textSelection.select(nextElement);

            callback();
        });
    }

    function focusPrevElement (element, callback) {
        var prevElement = domUtils.getNextFocusableElement(element, true);

        if (!prevElement)
            return;

        focusBlurSandbox.focus(prevElement, function () {
            if (domUtils.isTextEditableInput(prevElement))
                textSelection.select(prevElement);

            callback();
        });
    }

    return {
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
        'shift+tab':   focusPrevElement
    };
})();

export default function (keysString, actionCallback) {
    var shortcuts               = keyCharUtils.getShortcutsByKeyCombination(supportedShortcutHandlers, keysString.toLowerCase()),
        keysCombinationHandlers = {},
        processedString         = '',
        notProcessedString      = keysString,

        i                       = 0;

    for (i = 0; i < shortcuts.length; i++) {
        var shortcut = shortcuts[i].toLowerCase(),
            position = notProcessedString.indexOf(shortcut),
            length   = shortcut.length;

        processedString += notProcessedString.substring(0, position + length);

        keysCombinationHandlers[processedString] = keyCharUtils.getShortcutHandlerByKeyCombination(supportedShortcutHandlers, shortcut);

        notProcessedString = notProcessedString.substring(position + length);
    }

    var modifiersState = { ctrl: false, alt: false, shift: false, meta: false },
        keys           = keyCharUtils.getArrayByKeyCombination(keysString);

    //NOTE: check 'shift' modifier in keys
    for (i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key.toLowerCase() === 'shift') {
            var nextKey = keys[i + 1];

            if (!nextKey)
                continue;

            if (keyCharUtils.KEYS_MAPS.SHIFT_MAP[nextKey])
                keys[i + 1] = keyCharUtils.KEYS_MAPS.SHIFT_MAP[nextKey];
        }

        if (keyCharUtils.KEYS_MAPS.SHIFT_MAP[key] && (!keys[i - 1] || keys[i - 1].toLowerCase() !== 'shift')) {
            keys[i] = keyCharUtils.KEYS_MAPS.SHIFT_MAP[key];
            keys.splice(i, 0, 'shift');
            i++;
        }
    }

    var keysHelpers = arrayUtils.map(keys, keyHelper);

    //press keys
    var pressedKeyHelpers  = [],
        currentCombination = '';

    async.series({
        keydown: function (seriesCallback) {
            async.forEachSeries(
                keysHelpers,
                function (helper, helperCallback) {
                    var preventDefault = !helper.down(modifiersState),
                        key            = helper.getKey();

                    pressedKeyHelpers.push(helper);
                    currentCombination += (currentCombination ? '+' : '') + key;

                    var callback = function () {
                        window.setTimeout(helperCallback, KEY_PRESS_DELAY);
                    };

                    if (preventDefault)
                        callback();
                    else {
                        var currentShortcutHandler = keysCombinationHandlers[currentCombination];

                        if (!currentShortcutHandler || browserUtils.isFirefox || key === 'enter')  //B254435
                            preventDefault = !helper.press(modifiersState);

                        if (!preventDefault && currentShortcutHandler)
                            currentShortcutHandler(domUtils.getActiveElement(), callback);
                        else
                            callback();
                    }
                },
                function () {
                    seriesCallback();
                }
            );
        },

        keyup: function () {
            async.whilst(
                function () {
                    return pressedKeyHelpers.length;
                },
                function (callback) {
                    pressedKeyHelpers.pop().up(modifiersState);
                    setTimeout(callback, KEY_PRESS_DELAY);
                },
                function () {
                    actionCallback();
                }
            );
        }
    });
};
