import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { ClickOptions } from '../../../../test-run/commands/options';
import ClickAutomation from '../click';
import typeText from './type-text';
import getKeyCode from '../../utils/get-key-code';
import getKeyIdentifier from '../../utils/get-key-identifier';
import { getDefaultAutomationOffsets } from '../../utils/offsets';
import AutomationSettings from '../../settings';
import getKeyProperties from '../../utils/get-key-properties';

const Promise               = hammerhead.Promise;
const extend                = hammerhead.utils.extend;
const browserUtils          = hammerhead.utils.browser;
const eventSimulator        = hammerhead.eventSandbox.eventSimulator;
const elementEditingWatcher = hammerhead.eventSandbox.elementEditingWatcher;

const domUtils        = testCafeCore.domUtils;
const promiseUtils    = testCafeCore.promiseUtils;
const contentEditable = testCafeCore.contentEditable;
const textSelection   = testCafeCore.textSelection;
const delay           = testCafeCore.delay;
const SPECIAL_KEYS    = testCafeCore.KEY_MAPS.specialKeys;


export default class TypeAutomation {
    constructor (element, text, typeOptions) {
        this.element = TypeAutomation.findTextEditableChild(element) || element;
        this.typingText    = text.toString();

        this.modifiers = typeOptions.modifiers;
        this.caretPos  = typeOptions.caretPos;
        this.replace   = typeOptions.replace;
        this.paste     = typeOptions.paste;
        this.offsetX   = typeOptions.offsetX;
        this.offsetY   = typeOptions.offsetY;
        this.speed     = typeOptions.speed;

        this.automationSettings = new AutomationSettings(this.speed);

        this.elementChanged       = element !== this.element;
        this.currentPos           = 0;
        this.currentKeyCode       = null;
        this.currentCharCode      = null;
        this.currentKey           = null;
        this.currentKeyIdentifier = null;

        this.ignoreChangeEvent = true;

        this.eventArgs = {
            options: null,
            element: null
        };

        this.eventState = {
            skipType:         false,
            simulateKeypress: true,
            simulateTypeChar: true
        };
    }

    static findTextEditableChild (element) {
        let innerElement = null;

        if (!domUtils.isEditableElement(element)) {
            const allChildren = element.querySelectorAll('*');

            for (let i = 0; i < allChildren.length; i++) {
                if (domUtils.isTextEditableElementAndEditingAllowed(allChildren[i])) {
                    innerElement = allChildren[i];
                    break;
                }
            }
        }

        return innerElement;
    }

    _calculateEventArguments (isPressEvent) {
        const activeElement     = domUtils.getActiveElement();
        const isContentEditable = domUtils.isContentEditableElement(this.element);
        let element           = this.eventArgs.element || this.element;

        // T162478: Wrong typing and keys pressing in editor
        if (!isContentEditable && activeElement !== element)
            element = TypeAutomation.findTextEditableChild(activeElement) || activeElement;

        const options = extend({
            keyCode: isPressEvent ? this.currentCharCode : this.currentKeyCode
        }, this.modifiers);

        if (isPressEvent)
            options.charCode = this.currentCharCode;

        extend(options, getKeyProperties(isPressEvent, this.currentKey, this.currentKeyIdentifier));

        return { element, options };
    }

    _calculateTargetElement () {
        const activeElement     = domUtils.getActiveElement();
        const isContentEditable = domUtils.isContentEditableElement(this.element);

        if (isContentEditable) {
            if (activeElement !== contentEditable.findContentEditableParent(this.element)) {
                this.eventState.skipType = true;

                return;
            }
        }
        else if (activeElement !== this.element) {
            this.eventState.skipType = true;

            return;
        }

        this.element = isContentEditable ? this.element : activeElement;
    }

    _click (useStrictElementCheck) {
        const activeElement     = domUtils.getActiveElement();
        const isTextEditable    = domUtils.isTextEditableElementAndEditingAllowed(this.element);
        const isContentEditable = domUtils.isContentEditableElement(this.element);

        if (activeElement !== this.element) {
            const { offsetX, offsetY } = getDefaultAutomationOffsets(this.element);
            const clickOptions         = new ClickOptions({
                offsetX:   this.elementChanged ? offsetX : this.offsetX,
                offsetY:   this.elementChanged ? offsetY : this.offsetY,
                speed:     this.speed,
                caretPos:  this.caretPos,
                modifiers: this.modifiers
            });

            const clickAutomation = new ClickAutomation(this.element, clickOptions);

            return clickAutomation
                .run(useStrictElementCheck)
                .then(() => delay(this.automationSettings.mouseActionStepDelay));
        }

        if (isTextEditable)
            elementEditingWatcher.watchElementEditing(this.element);

        const isEditableElement = isTextEditable || isContentEditable;

        if (isEditableElement) {
            const selectionStart = textSelection.getSelectionStart(this.element);

            if (!isNaN(parseInt(this.caretPos, 10)) && this.caretPos !== selectionStart)
                textSelection.select(this.element, this.caretPos, this.caretPos);
        }

        return Promise.resolve();
    }

    _type () {
        if (this.eventState.skipType)
            return Promise.resolve();

        const isContentEditable = domUtils.isContentEditableElement(this.element);

        if (this.replace) {
            if (domUtils.isTextEditableElementAndEditingAllowed(this.element))
                textSelection.select(this.element);
            else if (isContentEditable)
                textSelection.deleteSelectionContents(this.element, true);
        }

        return promiseUtils.whilst(() => !this._isTypingFinished(), () => this._typingStep());
    }

    _isTypingFinished () {
        return this.currentPos === this.typingText.length;
    }

    _typingStep () {
        const char = this.typingText.charAt(this.currentPos);

        this.currentKeyCode       = getKeyCode(char);
        this.currentCharCode      = this.typingText.charCodeAt(this.currentPos);
        this.currentKey           = this.currentKeyCode === SPECIAL_KEYS['enter'] ? 'Enter' : char;
        this.currentKeyIdentifier = getKeyIdentifier(this.currentKey);

        this.ignoreChangeEvent = domUtils.getElementValue(this.element) === elementEditingWatcher.getElementSavedValue(this.element);

        this._keydown();
        this._keypress();

        return this._keyup();
    }

    _keydown () {
        this.eventArgs = this._calculateEventArguments();

        this.eventState.simulateKeypress = eventSimulator.keydown(this.eventArgs.element, this.eventArgs.options);
    }

    _keypress () {
        if (this.eventState.simulateKeypress === false)
            return;

        this.eventArgs = this._calculateEventArguments(true);

        this.eventState.simulateTypeChar = browserUtils.isAndroid || eventSimulator.keypress(this.eventArgs.element, this.eventArgs.options);
    }

    _keyup () {
        const elementForTyping = this.eventArgs.element;

        this.eventArgs = this._calculateEventArguments();

        const isTextEditableElement = domUtils.isTextEditableElement(this.element);
        const isContentEditable     = domUtils.isContentEditableElement(this.element);

        const shouldTypeAllText = this.paste || !isTextEditableElement && !isContentEditable;

        return Promise
            .resolve()
            .then(() => {
                return shouldTypeAllText ? this._typeAllText(elementForTyping) : this._typeChar(elementForTyping);
            })
            .then(() => {
                eventSimulator.keyup(this.eventArgs.element, this.eventArgs.options);

                if (shouldTypeAllText)
                    this.currentPos = this.typingText.length;
                else
                    this.currentPos++;
            });
    }

    _typeChar (element) {
        // NOTE: change event must not be raised after prevented keydown
        // or keypress even if element value was changed (B253816)
        if (this.eventState.simulateKeypress === false || this.eventState.simulateTypeChar === false) {
            // NOTE: change event should still be raised if element value
            // was changed before the prevented keypress or keydown (GH-4881)
            if (this.ignoreChangeEvent)
                elementEditingWatcher.restartWatchingElementEditing(element);

            return delay(this.automationSettings.keyActionStepDelay);
        }

        let currentChar         = this.typingText.charAt(this.currentPos);
        const isDigit           = /^\d$/.test(currentChar);
        const prevChar          = this.currentPos === 0 ? null : this.typingText.charAt(this.currentPos - 1);
        const isInputTypeNumber = domUtils.isInputElement(element) && element.type === 'number';

        if (isInputTypeNumber) {
            const selectionStart      = textSelection.getSelectionStart(element);
            const valueLength         = domUtils.getInputValue(element).length;
            const textHasDigits       = /^\d/.test(this.typingText);
            const isPermissibleSymbol = currentChar === '.' || currentChar === '-' && valueLength;

            if (!isDigit && (textHasDigits || !isPermissibleSymbol || selectionStart !== 0))
                return delay(this.automationSettings.keyActionStepDelay);

            // NOTE: allow to type '.' or '-' only if it is the first symbol and the input already has
            // a value, or if '.' or '-' are added to a digit. Otherwise, the value won't be set.
            if (isDigit && (prevChar === '.' || prevChar === '-' && !valueLength))
                currentChar = prevChar + currentChar;
        }

        typeText(element, currentChar, null);

        return delay(this.automationSettings.keyActionStepDelay);
    }

    _typeAllText (element) {
        typeText(element, this.typingText, this.caretPos);
        return delay(this.automationSettings.keyActionStepDelay);
    }

    run (useStrictElementCheck) {
        return this
            ._click(useStrictElementCheck)
            .then(() => this._calculateTargetElement())
            .then(() => this._type());
    }
}
