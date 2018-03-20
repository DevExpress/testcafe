import hammerhead from '../../deps/hammerhead';
import { KEY_MAPS, domUtils } from '../../deps/testcafe-core';
import isLetter from '../../utils/is-letter';

var nativeMethods = hammerhead.nativeMethods;

export function changeLetterCase (letter) {
    var isLowCase = letter === letter.toLowerCase();

    return isLowCase ? letter.toUpperCase() : letter.toLowerCase();
}

export function getActualKeysAndEventKeyProperties (keyArray) {
    var eventKeyProperties = keyArray.slice();

    //NOTE: check 'shift' modifier in keys
    for (var i = 0; i < keyArray.length; i++) {
        var key = keyArray[i];

        if (key.toLowerCase() === 'shift') {
            var nextKey = keyArray[i + 1];

            if (!nextKey)
                continue;

            if (KEY_MAPS.shiftMap[nextKey])
                keyArray[i + 1] = KEY_MAPS.shiftMap[nextKey];
            else if (KEY_MAPS.reversedShiftMap[nextKey])
                eventKeyProperties[i + 1] = KEY_MAPS.reversedShiftMap[nextKey];
        }

        if (KEY_MAPS.shiftMap[key] && (!keyArray[i - 1] || keyArray[i - 1].toLowerCase() !== 'shift')) {
            keyArray[i] = KEY_MAPS.shiftMap[key];
            keyArray.splice(i, 0, 'shift');
            eventKeyProperties.splice(i, 0, 'shift');
            i++;
        }
    }

    return { actualKeys: keyArray, eventKeyProperties };
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
    var activeElement         = nativeMethods.documentActiveElementGetter.call(doc);

    if (!activeElement || !domUtils.isDomElement(activeElement))
        activeElement = doc.body;

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

