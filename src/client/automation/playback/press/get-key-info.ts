import isLetterKey from '../../utils/is-letter';
// @ts-ignore
import { getSanitizedKey, KEY_MAPS } from '../../deps/testcafe-core';
import getKeyIdentifier from '../../utils/get-key-identifier';
import getKeyCode from '../../utils/get-key-code';

export interface KeyInfo {
    sanitizedKey: string;
    isChar: boolean;
    modifierKeyCode: string;
    specialKeyCode: string;
    isLetter: boolean;
    isEnter: boolean;
    keyIdentifierProperty: string;
    keyProperty: string;
    keyCode: string | null;
}

export default function (key: string, eventKeyProperty?: string): KeyInfo {
    const sanitizedKey    = getSanitizedKey(key);
    const isChar          = key.length === 1 || key === 'space';
    const isEnter         = key === 'enter';
    const modifierKeyCode = KEY_MAPS.modifiers[sanitizedKey];
    const specialKeyCode  = KEY_MAPS.specialKeys[sanitizedKey];

    eventKeyProperty = eventKeyProperty || key;

    return {
        sanitizedKey,
        isChar,
        modifierKeyCode,
        specialKeyCode,
        isEnter,
        isLetter:              isLetterKey(key),
        keyIdentifierProperty: getKeyIdentifier(eventKeyProperty),
        keyProperty:           KEY_MAPS.keyProperty[eventKeyProperty] || eventKeyProperty,
        keyCode:               getResultKeyCode(key, isChar, sanitizedKey, modifierKeyCode, specialKeyCode),
    };
}

function getResultKeyCode (key: string, isChar: boolean, sanitizedKey: string, modifierKeyCode: string, specialKeyCode: string): string | null {
    let keyCode = null;

    if (isChar && key !== 'space')
        keyCode = getKeyCode(sanitizedKey);
    else if (modifierKeyCode)
        keyCode = modifierKeyCode;
    else if (specialKeyCode)
        keyCode = specialKeyCode;

    return keyCode;
}
