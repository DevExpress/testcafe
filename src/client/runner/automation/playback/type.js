import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import * as automationSettings from '../settings';
import typeCharPlaybackAutomation from './type-char';
import clickPlaybackAutomation from './click';
import getKeyCode from '../../utils/get-key-code';
import async from '../../deps/async';

var browserUtils          = hammerhead.utils.browser;
var extend                = hammerhead.utils.extend;
var eventSimulator        = hammerhead.eventSandbox.eventSimulator;
var elementEditingWatcher = hammerhead.eventSandbox.elementEditingWatcher;

var SETTINGS        = testCafeCore.SETTINGS;
var positionUtils   = testCafeCore.positionUtils;
var domUtils        = testCafeCore.domUtils;
var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;


function findTextEditableChild (el) {
    var isContentEditable = domUtils.isContentEditableElement(el);
    var innerInputElement = null;

    if (!domUtils.isTextEditableElement(el) && !isContentEditable) {
        var children = el.querySelectorAll('*');

        for (var i = 0; i < children.length; i++) {
            if (domUtils.isTextEditableElementAndEditingAllowed(children[i])) {
                innerInputElement = children[i];
                break;
            }
        }
    }

    return innerInputElement;
}

export default function (el, text, options, actionCallback) {
    text = text.toString();

    var length                            = text.length,
        curElement                        = null,
        elementForTyping                  = null,
        currPos                           = 0,
        isTextEditable                    = null,
        isContentEditable                 = domUtils.isContentEditableElement(el),
        notPrevented                      = true;

    if (typeof options.offsetX === 'number')
        options.offsetX = Math.round(options.offsetX);
    if (typeof options.offsetY === 'number')
        options.offsetY = Math.round(options.offsetY);

    curElement                        = findTextEditableChild(el) || el;
    isTextEditable                    = domUtils.isTextEditableElementAndEditingAllowed(curElement);

    if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(curElement)) {
        actionCallback();
        return;
    }

    async.series({
        click: function (seriaCallback) {
            if (domUtils.getActiveElement() !== curElement)
                clickPlaybackAutomation(curElement, options, function () {
                    window.setTimeout(seriaCallback, automationSettings.ACTION_STEP_DELAY);
                });
            else {
                if (isTextEditable)
                    elementEditingWatcher.watchElementEditing(curElement);

                if (isTextEditable || isContentEditable) {
                    if (!isNaN(parseInt(options.caretPos)) &&
                        options.caretPos !== textSelection.getSelectionStart(curElement))
                        textSelection.select(curElement, options.caretPos, options.caretPos);
                }
                seriaCallback();
            }
        },

        clearText: function (seriaCallback) {
            if ((!isContentEditable && domUtils.getActiveElement() !== curElement) ||
                (isContentEditable &&
                 domUtils.getActiveElement() !== contentEditable.findContentEditableParent(curElement))) {
                actionCallback();
                return;
            }

            curElement = isContentEditable ? el : domUtils.getActiveElement();

            if (options.replace) {
                if (isTextEditable) {
                    textSelection.select(curElement);
                    typeCharPlaybackAutomation(curElement, '');
                }
                else if (isContentEditable)
                    textSelection.deleteSelectionContents(curElement, true);
            }

            seriaCallback();
        },

        type: function () {
            var caretPosition = null;

            async.whilst(
                //are not all symbols typed
                function () {
                    return currPos < length;
                },

                //typing symbol
                function (typingCallback) {
                    var keyCode  = getKeyCode(text.charAt(currPos)),
                        charCode = text.charCodeAt(currPos);

                    async.series({
                        startTypeSymbol: function (seriaCallback) {
                            notPrevented = eventSimulator.keydown(curElement, extend(options, { keyCode: keyCode }));
                            delete options['keyCode'];

                            if (notPrevented !== false) {
                                //T162478: Wrong typing and keys pressing in editor
                                if (!isContentEditable && curElement !== domUtils.getActiveElement()) {
                                    curElement                        = domUtils.getActiveElement();
                                    curElement                        = findTextEditableChild(curElement) || curElement;
                                    isTextEditable                    = domUtils.isTextEditableElementAndEditingAllowed(curElement);
                                }

                                //Element for typing can change last time only after keydown event
                                elementForTyping = curElement;

                                notPrevented = eventSimulator.keypress(curElement, extend(options, {
                                    keyCode:  charCode,
                                    charCode: charCode
                                }));
                                delete options['charCode'];

                                //T162478: Wrong typing and keys pressing in editor
                                if (!isContentEditable && curElement !== domUtils.getActiveElement()) {
                                    curElement = domUtils.getActiveElement();
                                    curElement = findTextEditableChild(curElement) || curElement;
                                }

                                if (notPrevented === false)
                                //change event must not be raised after prevented keypress even if element value was changed (B253816)
                                    elementEditingWatcher.restartWatchingElementEditing(elementForTyping);
                                else {
                                    var currentChar = text.charAt(currPos);
                                    var prevChar    = currPos === 0 ? null : text.charAt(currPos - 1);

                                    var isInputTypeNumber = domUtils.isInputElement(elementForTyping) &&
                                                            elementForTyping.type === 'number';

                                    var problematicBrowsers = (browserUtils.isFirefox ||
                                                               (browserUtils.isWebKit && !browserUtils.isSafari));
                                    var hasProblemWithDot   = problematicBrowsers && isInputTypeNumber;

                                    if (hasProblemWithDot && currentChar === '.') {
                                        window.setTimeout(seriaCallback, automationSettings.ACTION_STEP_DELAY);
                                        return;
                                    }

                                    if (prevChar && (hasProblemWithDot && /(\.|-)/.test(prevChar) ||
                                                     !browserUtils.isIE9 && isInputTypeNumber && prevChar === '-'))
                                        typeCharPlaybackAutomation(elementForTyping,
                                            prevChar + currentChar, caretPosition + currPos - 1);
                                    else
                                        typeCharPlaybackAutomation(elementForTyping, currentChar,
                                            caretPosition + currPos);
                                }
                            }

                            window.setTimeout(seriaCallback, automationSettings.ACTION_STEP_DELAY);
                        },

                        endTypeSymbol: function () {
                            eventSimulator.keyup(curElement, extend(options, { keyCode: keyCode }));
                            delete options['keyCode'];
                            currPos++;

                            typingCallback();
                        }
                    });
                },

                //callback
                function () {
                    actionCallback();
                });
        }
    });
};
