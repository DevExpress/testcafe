import testCafeCore from '../../../deps/testcafe-core';
import isLetter from '../../../utils/is-letter';
import KEY_MAPS from '../../../utils/key-maps';

var arrayUtils = testCafeCore.arrayUtils;
var domUtils   = testCafeCore.domUtils;


function changeLetterCase (letter) {
    var isLowCase = letter === letter.toLowerCase();

    return isLowCase ? letter.toUpperCase() : letter.toLowerCase();
}

export function getKeyArray (keyCombination) {
    // NOTE: we should separate the '+' symbol that concats other
    // keys and the '+'  key to support commands like the 'ctrl++'
    var keys = keyCombination.replace(/^\+/g, 'plus').replace(/\+\+/g, '+plus').split('+');

    return arrayUtils.map(keys, key => key.replace('plus', '+'));
}

export function getSanitizedKey (key) {
    var isChar       = key.length === 1 || key === 'space';
    var sanitizedKey = isChar ? key : key.toLowerCase();

    if (KEY_MAPS.modifiersMap[sanitizedKey])
        sanitizedKey = KEY_MAPS.modifiersMap[sanitizedKey];

    return sanitizedKey;
}

export function excludeShiftModifiedKeys (keyArray) {
    //NOTE: check 'shift' modifier in keys
    for (var i = 0; i < keyArray.length; i++) {
        var key = keyArray[i];

        if (key.toLowerCase() === 'shift') {
            var nextKey = keyArray[i + 1];

            if (!nextKey)
                continue;

            if (KEY_MAPS.shiftMap[nextKey])
                keyArray[i + 1] = KEY_MAPS.shiftMap[nextKey];
        }

        if (KEY_MAPS.shiftMap[key] && (!keyArray[i - 1] || keyArray[i - 1].toLowerCase() !== 'shift')) {
            keyArray[i] = KEY_MAPS.shiftMap[key];
            keyArray.splice(i, 0, 'shift');
            i++;
        }
    }

    return keyArray;
}

export function getChar (key, shiftModified) {
    if (key === 'space')
        return ' ';

    if (shiftModified) {
        if (isLetter(key))
            return changeLetterCase(key);

        if (KEY_MAPS.reversedShiftMap[key])
            return KEY_MAPS.reversedShiftMap[key];
    }

    return key;
}

export function getDeepActiveElement (currentDocument) {
    var doc                   = currentDocument || document;
    var activeElementInIframe = null;
    var activeElement         = doc.activeElement &&
                                domUtils.isDomElement(doc.activeElement) ? doc.activeElement : doc.body;

    if (activeElement && domUtils.isIframeElement(activeElement) && activeElement.contentDocument) {
        try {
            activeElementInIframe = getDeepActiveElement(activeElement.contentDocument);
        }
            /*eslint-disable no-empty */
        catch (e) {
        }
        /*eslint-enable no-empty */
    }

    return activeElementInIframe || activeElement;
}

