import * as hammerheadAPI from '../deps/hammerhead';
import $ from '../deps/jquery';
import * as domUtils from './dom';


var browserUtils = hammerheadAPI.Util.Browser;


export const KEYS_MAPS = {
    MODIFIERS: {
        alt:   18,
        ctrl:  17,
        meta:  91,
        shift: 16
    },

    MODIFIERS_MAP: {
        option: 'alt'
    },

    SHIFT_MAP: {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        '{': '[',
        '}': ']',
        ':': ';',
        '"': '\'',
        '|': '\\',
        '<': ',',
        '>': '.',
        '?': '/'
    },

    SPECIAL_KEYS: {
        backspace: 8,
        capslock:  20,
        delete:    46,
        down:      40,
        end:       35,
        enter:     13,
        esc:       27,
        home:      36,
        ins:       45,
        left:      37,
        pagedown:  34,
        pageup:    33,
        right:     39,
        space:     32,
        tab:       9,
        up:        38
    },

    SYMBOL_CHAR_CODE_TO_KEY_CODE: {
        96: 192,    // `
        91: 219,    // [
        93: 221,    // ]
        92: 220,    // \
        59: 186,    // ;
        39: 222,    // '
        44: 188,    // ,
        45: browserUtils.isMozilla ? 173 : 189,    // -
        46: 190,    // .
        47: 191     // /
    },

    SYMBOLS_KEYS_CHAR_CODES: {
        109: 45,
        173: 45,
        186: 59,
        187: 61,
        188: 44,
        189: 45,
        190: 46,
        191: 47,
        192: 96,
        219: 91,
        220: 92,
        221: 93,
        222: 39,

        110: 46,
        96:  48,
        97:  49,
        98:  50,
        99:  51,
        100: 52,
        101: 53,
        102: 54,
        103: 55,
        104: 56,
        105: 57,
        107: 43,
        106: 42,
        111: 47
    }
};

function reverseMap (map) {
    var reversed = {};

    for (var key in map) {
        if (map.hasOwnProperty(key))
            reversed[map[key]] = key;
    }

    return reversed;
}

KEYS_MAPS.REVERSED_MODIFIERS    = reverseMap(KEYS_MAPS.MODIFIERS);
KEYS_MAPS.REVERSED_SHIFT_MAP    = reverseMap(KEYS_MAPS.SHIFT_MAP);
KEYS_MAPS.REVERSED_SPECIAL_KEYS = reverseMap(KEYS_MAPS.SPECIAL_KEYS);

export function changeLetterCase (letter) {
    var isLowCase = letter === letter.toLowerCase();

    return isLowCase ? letter.toUpperCase() : letter.toLowerCase();
}

export function getArrayByKeyCombination (keysCombination) {
    //NOTE: we should separate symbol '+' that concats other keys and key '+' to support commands like the 'ctrl++'
    var keys = keysCombination.replace(/^\+/g, 'plus').replace(/\+\+/g, '+plus').split('+');

    $.map(keys, function (key, index) {
        keys[index] = key.replace('plus', '+');
    });

    return keys;
}

export function getKeyCodeByChar (keyChar) {
    if (isLetter(keyChar))
        return keyChar.toUpperCase().charCodeAt(0);

    var res = KEYS_MAPS.SHIFT_MAP[keyChar] ? KEYS_MAPS.SHIFT_MAP[keyChar].charCodeAt(0) : keyChar.charCodeAt(0);

    return KEYS_MAPS.SYMBOL_CHAR_CODE_TO_KEY_CODE[res] || res;
}

export function getShortcutHandlerByKeyCombination (shortcutHandlers, keysCombination) {
    var keys = getArrayByKeyCombination(keysCombination.toLowerCase());

    while (keys.length) {
        var combination = keys.join('+');

        if (shortcutHandlers[combination])
            return shortcutHandlers[combination];

        keys.shift();
    }

    return null;
}

export function getShortcutsByKeyCombination (shortcutHandlers, keysCombination) {
    var keys               = getArrayByKeyCombination(keysCombination.toLowerCase()),
        shortcuts          = [],
        curFullCombination = [];

    for (var i = 0; i < keys.length; i++) {
        curFullCombination.push(keys[i]);

        var curCombination = curFullCombination.concat();

        while (curCombination.length) {
            var keyString = curCombination.join('+');

            if (shortcutHandlers[keyString]) {
                shortcuts.push(keyString);
                curFullCombination = curCombination = [];
            }
            else
                curCombination.shift();
        }
    }

    return shortcuts;
}

export function isArrowKey (keyCode) {
    return keyCode === KEYS_MAPS.SPECIAL_KEYS.right || keyCode === KEYS_MAPS.SPECIAL_KEYS.left ||
           keyCode === KEYS_MAPS.SPECIAL_KEYS.up || keyCode === KEYS_MAPS.SPECIAL_KEYS.down;
}

export function isCharByKeyCode (keyCode) {
    if (KEYS_MAPS.SYMBOLS_KEYS_CHAR_CODES[keyCode])
        return true;

    var activeElement        = domUtils.getActiveElement(),
        isLetter             = ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || keyCode === 32), //digits, letters and space
        isNumPadKey          = (keyCode === 42 || keyCode === 43 || (keyCode >= 47 && keyCode <= 57) || keyCode === 78),
        isSymbol             = (keyCode === 59 || keyCode === 61),
        isEnterKeyInTextArea = activeElement && activeElement.tagName.toLowerCase() === 'textarea' &&
                               !domUtils.isShadowUIElement(activeElement) && keyCode === KEYS_MAPS.SPECIAL_KEYS.enter;

    return isLetter || isNumPadKey || isSymbol || isEnterKeyInTextArea;
}

export function isLetter (key) {
    return key.length === 1 && (key >= 'a' && key <= 'z') || (key >= 'A' && key <= 'Z');
}

export function parseKeysString (keysString) {
    var error           = false,
        keyStringLength = keysString.length;

    keysString = $.trim(keysString).replace(/\s+/g, ' ');

    //NOTE: trim last connecting '+'
    if (keyStringLength > 1 && keysString.charAt(keyStringLength - 1) === '+' &&
        !(/[\+ ]/.test(keysString.charAt(keyStringLength - 2))))
        keysString = keysString.substring(0, keysString.length - 1);

    var commands = keysString.split(' ');

    $.map(commands, function (command) {
        var keys = getArrayByKeyCombination(command);

        $.map(keys, function (key) {
            var isChar       = key.length === 1 || key === 'space',
                sanitizedKey = isChar ? key : key.toLowerCase();

            if (KEYS_MAPS.MODIFIERS_MAP[sanitizedKey])
                sanitizedKey = KEYS_MAPS.MODIFIERS_MAP[sanitizedKey];

            var modifierKeyCode = KEYS_MAPS.MODIFIERS[sanitizedKey],
                specialKeyCode  = KEYS_MAPS.SPECIAL_KEYS[sanitizedKey];

            if (!(isChar || modifierKeyCode || specialKeyCode)) {
                error = true;

                return false;
            }
        });

        if (error)
            return false;
    });

    return {
        commands: commands,
        error:    error,
        keys:     keysString
    };
}
