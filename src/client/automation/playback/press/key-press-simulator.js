import hammerhead from '../../deps/hammerhead';
import { KEY_MAPS, domUtils, getSanitizedKey } from '../../deps/testcafe-core';
import typeText from '../type/type-text';
import { getChar, getDeepActiveElement, changeLetterCase } from './utils';
import getKeyCode from '../../utils/get-key-code';
import getKeyIdentifier from '../../utils/get-key-identifier';
import isLetterKey from '../../utils/is-letter';
import getKeyProperties from '../../utils/get-key-properties';

const browserUtils   = hammerhead.utils.browser;
const extend         = hammerhead.utils.extend;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;


export default class KeyPressSimulator {
    constructor (key, eventKeyProperty) {
        this.isLetter              = isLetterKey(key);
        this.isChar                = key.length === 1 || key === 'space';
        this.sanitizedKey          = getSanitizedKey(key);
        this.modifierKeyCode       = KEY_MAPS.modifiers[this.sanitizedKey];
        this.specialKeyCode        = KEY_MAPS.specialKeys[this.sanitizedKey];
        this.keyCode               = null;
        this.keyIdentifierProperty = getKeyIdentifier(eventKeyProperty);
        this.topSameDomainDocument = domUtils.getTopSameDomainWindow(window).document;
        this.keyProperty           = KEY_MAPS.keyProperty[eventKeyProperty] || eventKeyProperty;

        if (this.isChar && key !== 'space')
            this.keyCode = getKeyCode(this.sanitizedKey);
        else if (this.modifierKeyCode)
            this.keyCode = this.modifierKeyCode;
        else if (this.specialKeyCode)
            this.keyCode = this.specialKeyCode;

        this.storedActiveElement = null;
    }

    static _isKeyActivatedInputElement (el) {
        return domUtils.isInputElement(el) && /button|submit|reset|radio|checkbox/.test(el.type);
    }

    _type (element, char) {
        const elementChanged          = element !== this.storedActiveElement;
        let shouldType              = !elementChanged;
        let elementForTyping        = element;
        const isActiveElementEditable = domUtils.isEditableElement(element);
        const isStoredElementEditable = domUtils.isEditableElement(this.storedActiveElement);

        // Unnecessary typing happens if an element was changed after the keydown/keypress event (T210448)
        // In IE, this error may occur when we try to determine if the removed element is in an iframe
        try {
            if (elementChanged) {
                const isActiveElementInIframe = domUtils.isElementInIframe(element);
                const isStoredElementInIframe = domUtils.isElementInIframe(this.storedActiveElement);

                const shouldTypeInWebKit = isActiveElementInIframe === isStoredElementInIframe || isStoredElementEditable;

                shouldType = (!browserUtils.isFirefox || isStoredElementEditable) &&
                             (!browserUtils.isWebKit || shouldTypeInWebKit);
            }
        }
        /*eslint-disable no-empty */
        catch (err) {
        }
        /*eslint-disable no-empty */


        if (shouldType) {
            if (!browserUtils.isIE && elementChanged && isStoredElementEditable && isActiveElementEditable)
                elementForTyping = this.storedActiveElement;

            typeText(elementForTyping, char);
        }
    }

    _addKeyPropertyToEventOptions (eventOptions) {
        extend(eventOptions, getKeyProperties(eventOptions.type === 'keypress', this.keyProperty, this.keyIdentifierProperty));

        return eventOptions;
    }

    down (modifiersState) {
        this.storedActiveElement = getDeepActiveElement(this.topSameDomainDocument);

        if (this.modifierKeyCode)
            modifiersState[this.sanitizedKey] = true;

        if (modifiersState.shift && this.isLetter)
            this.keyProperty = changeLetterCase(this.keyProperty);

        const eventOptions = { keyCode: this.keyCode, type: 'keydown' };

        this._addKeyPropertyToEventOptions(eventOptions);

        return eventSimulator.keydown(this.storedActiveElement, extend(eventOptions, modifiersState));
    }

    press (modifiersState) {
        if (!(this.isChar || this.specialKeyCode))
            return true;

        let activeElement = getDeepActiveElement(this.topSameDomainDocument);

        const character      = this.isChar ? getChar(this.sanitizedKey, modifiersState.shift) : null;
        const charCode       = this.specialKeyCode || character.charCodeAt(0);
        const elementChanged = activeElement !== this.storedActiveElement;

        if (browserUtils.isWebKit && elementChanged) {
            const isActiveElementInIframe = domUtils.isElementInIframe(activeElement);
            const isStoredElementInIframe = domUtils.isElementInIframe(this.storedActiveElement);

            if (isActiveElementInIframe !== isStoredElementInIframe)
                return true;
        }

        this.storedActiveElement = activeElement;

        const eventOptions = { keyCode: charCode, charCode: charCode, type: 'keypress' };

        this._addKeyPropertyToEventOptions(eventOptions);

        const raiseDefault = browserUtils.isAndroid || eventSimulator.keypress(activeElement, extend(eventOptions, modifiersState));

        if (!raiseDefault)
            return raiseDefault;

        activeElement = getDeepActiveElement(this.topSameDomainDocument);

        if (character && !(modifiersState.ctrl || modifiersState.alt))
            this._type(activeElement, character);

        const isKeyActivatedInput = KeyPressSimulator._isKeyActivatedInputElement(activeElement);
        const isButton            = domUtils.isButtonElement(activeElement);

        const isSafariWithAutoRaisedClick = browserUtils.isSafari &&
                                           browserUtils.compareVersions([browserUtils.webkitVersion, '603.1.30']) >= 0;

        const raiseClickOnEnter = !browserUtils.isFirefox && !isSafariWithAutoRaisedClick
                                && (isKeyActivatedInput || isButton);

        if (raiseClickOnEnter && this.sanitizedKey === 'enter')
            activeElement.click();

        return raiseDefault;
    }

    up (modifiersState) {
        if (this.modifierKeyCode)
            modifiersState[this.sanitizedKey] = false;

        const eventOptions = { keyCode: this.keyCode, type: 'keyup' };

        this._addKeyPropertyToEventOptions(eventOptions);

        const raiseDefault  = eventSimulator.keyup(getDeepActiveElement(this.topSameDomainDocument), extend(eventOptions, modifiersState));
        const activeElement = getDeepActiveElement(this.topSameDomainDocument);


        // NOTE: in some browsers we should emulate click on active input element while pressing "space" key
        const emulateClick = !browserUtils.isFirefox && !browserUtils.isSafari &&
                           (!browserUtils.isChrome || browserUtils.version >= 53);

        if (emulateClick && raiseDefault && this.sanitizedKey === 'space' &&
            KeyPressSimulator._isKeyActivatedInputElement(activeElement))
            activeElement.click();

        return raiseDefault;
    }

    get key () {
        return this.sanitizedKey;
    }
}
