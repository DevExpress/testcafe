import hammerhead from '../../deps/hammerhead';
import {
    arrayUtils,
    domUtils,
    promiseUtils,
    delay,
    getKeyArray,
    sendRequestToFrame
} from '../../deps/testcafe-core';
import KeyPressSimulator from './key-press-simulator';
import supportedShortcutHandlers from './shortcuts';
import { getActualKeysAndEventKeyProperties, getDeepActiveElement } from './utils';
import AutomationSettings from '../../settings';
import isIframeWindow from '../../../../utils/is-window-in-iframe';

const Promise        = hammerhead.Promise;
const browserUtils   = hammerhead.utils.browser;
const messageSandbox = hammerhead.eventSandbox.message;
const nativeMethods  = hammerhead.nativeMethods;


const PRESS_REQUEST_CMD  = 'automation|press|request';
const PRESS_RESPONSE_CMD = 'automation|press|response';


// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === PRESS_REQUEST_CMD) {
        hammerhead.on(hammerhead.EVENTS.beforeUnload, () => messageSandbox.sendServiceMsg({ cmd: PRESS_RESPONSE_CMD }, e.source));

        const pressAutomation = new PressAutomation(e.message.keyCombinations, e.message.options);

        pressAutomation
            .run()
            .then(() => messageSandbox.sendServiceMsg({ cmd: PRESS_RESPONSE_CMD }, e.source));
    }
});

export default class PressAutomation {
    constructor (keyCombinations, options) {
        this.keyCombinations       = keyCombinations;
        this.isSelectElement       = false;
        this.pressedKeyString      = '';
        this.modifiersState        = null;
        this.shortcutHandlers      = null;
        this.topSameDomainDocument = domUtils.getTopSameDomainWindow(window).document;
        this.automationSettings    = new AutomationSettings(options.speed);
        this.options               = options;
    }

    static _getKeyPressSimulators (keyCombination) {
        const keysArray = getKeyArray(keyCombination);

        // NOTE: symbols may have the same keyCode, but their "event.key" will be different, so we
        // need to get the "event.key" property for each key, and add the 'shift' key where needed.
        const { actualKeys, eventKeyProperties } = getActualKeysAndEventKeyProperties(keysArray);

        return arrayUtils.map(actualKeys, (key, index) => new KeyPressSimulator(key, eventKeyProperties[index]));
    }

    static _getShortcuts (keyCombination) {
        const keys               = getKeyArray(keyCombination.toLowerCase());
        const shortcuts          = [];
        let curFullCombination = [];
        let curCombination     = [];

        for (let i = 0; i < keys.length; i++) {
            curFullCombination.push(keys[i]);

            curCombination = curFullCombination.slice();

            while (curCombination.length) {
                const keyString = curCombination.join('+');

                if (supportedShortcutHandlers[keyString]) {
                    shortcuts.push(keyString);
                    curFullCombination = curCombination = [];
                }
                else
                    curCombination.shift();
            }
        }

        return shortcuts;
    }

    static _getShortcutHandlers (keyCombination) {
        const shortcuts          = PressAutomation._getShortcuts(keyCombination.toLowerCase());
        const shortcutHandlers   = {};
        let stringWithShortcut = '';
        let shortcut           = null;
        let shortcutPosition   = null;
        let shortcutLength     = null;

        for (let i = 0; i < shortcuts.length; i++) {
            shortcut         = shortcuts[i];
            shortcutPosition = keyCombination.indexOf(shortcut);
            shortcutLength   = shortcut.length;

            stringWithShortcut += keyCombination.substring(0, shortcutPosition + shortcutLength);

            shortcutHandlers[stringWithShortcut] = supportedShortcutHandlers[shortcut];

            keyCombination = keyCombination.substring(shortcutPosition + shortcutLength);
        }


        return shortcutHandlers;
    }

    _down (keyPressSimulator) {
        this.pressedKeyString += (this.pressedKeyString ? '+' : '') + keyPressSimulator.key;

        const keyDownPrevented = !keyPressSimulator.down(this.modifiersState);

        return Promise.resolve(keyDownPrevented);
    }

    _press (keyPressSimulator, keyEventPrevented) {
        // NOTE: preventing the 'keydown' and 'keypress' events for the select element does not
        // affect the assignment of the new selectedIndex. So, we should execute a shortcut
        // for the select element without taking into account that 'key' events are suppressed
        if (keyEventPrevented && !this.isSelectElement)
            return delay(this.automationSettings.keyActionStepDelay);

        const currentShortcutHandler = this.shortcutHandlers[this.pressedKeyString];
        let keyPressPrevented      = false;

        // NOTE: B254435
        if (!currentShortcutHandler || browserUtils.isFirefox || keyPressSimulator.key === 'enter')
            keyPressPrevented = !keyPressSimulator.press(this.modifiersState);

        if ((!keyPressPrevented || this.isSelectElement) && currentShortcutHandler) {
            return currentShortcutHandler(getDeepActiveElement(this.topSameDomainDocument))
                .then(() => delay(this.automationSettings.keyActionStepDelay));
        }

        return delay(this.automationSettings.keyActionStepDelay);
    }

    _up (keyPressSimulator) {
        keyPressSimulator.up(this.modifiersState);

        return delay(this.automationSettings.keyActionStepDelay);
    }

    _runCombination (keyCombination) {
        this.modifiersState   = { ctrl: false, alt: false, shift: false, meta: false };
        this.isSelectElement  = domUtils.isSelectElement(getDeepActiveElement(this.topSameDomainDocument));
        this.pressedKeyString = '';
        this.shortcutHandlers = PressAutomation._getShortcutHandlers(keyCombination);

        const keyPressSimulators = PressAutomation._getKeyPressSimulators(keyCombination);

        return promiseUtils.each(keyPressSimulators, keySimulator => {
            return this
                ._down(keySimulator)
                .then(keyEventPrevented => this._press(keySimulator, keyEventPrevented));
        })
            .then(() => {
                arrayUtils.reverse(keyPressSimulators);

                return promiseUtils.each(keyPressSimulators, keySimulator => this._up(keySimulator));
            });
    }

    run () {
        const activeElement         = domUtils.getActiveElement();
        const activeElementIsIframe = domUtils.isIframeElement(activeElement);

        if (!isIframeWindow(window) && activeElementIsIframe && nativeMethods.contentWindowGetter.call(activeElement)) {
            const msg = {
                cmd:             PRESS_REQUEST_CMD,
                keyCombinations: this.keyCombinations,
                options:         this.options
            };

            return sendRequestToFrame(msg, PRESS_RESPONSE_CMD, nativeMethods.contentWindowGetter.call(activeElement));
        }

        return promiseUtils.each(this.keyCombinations, combination => {
            return this
                ._runCombination(combination)
                .then(() => delay(this.automationSettings.keyActionStepDelay));
        });
    }
}


