import hammerhead from '../../deps/hammerhead';
import { KEY_MAPS, domUtils } from '../../deps/testcafe-core';
import isLetter from '../../utils/is-letter';
import { findDocument, isRadioButtonElement } from '../../../core/utils/dom';
import * as arrayUtils from '../../../core/utils/array';

const nativeMethods    = hammerhead.nativeMethods;
const browserUtils     = hammerhead.utils.browser;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;
const Promise          = hammerhead.Promise;

export function changeLetterCase (letter) {
    const isLowCase = letter === letter.toLowerCase();

    return isLowCase ? letter.toUpperCase() : letter.toLowerCase();
}

export function getActualKeysAndEventKeyProperties (keyArray) {
    const eventKeyProperties = keyArray.slice();

    //NOTE: check 'shift' modifier in keys
    for (let i = 0; i < keyArray.length; i++) {
        const key = keyArray[i];

        if (key.toLowerCase() === 'shift') {
            const nextKey = keyArray[i + 1];

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
    const doc                 = currentDocument || document;
    let activeElementInIframe = null;
    let activeElement         = nativeMethods.documentActiveElementGetter.call(doc);

    if (!activeElement || !domUtils.isDomElement(activeElement))
        activeElement = doc.body;

    if (activeElement && domUtils.isIframeElement(activeElement) &&
        nativeMethods.contentDocumentGetter.call(activeElement)) {
        try {
            activeElementInIframe = getDeepActiveElement(nativeMethods.contentDocumentGetter.call(activeElement));
        }
        catch (e) { // eslint-disable-line no-empty
        }
    }

    return activeElementInIframe || activeElement;
}

export function focusNextElement (element, reverse, skipRadioGroups) {
    return new Promise(resolve => {
        const nextElement = getNextFocusableElement(element, reverse, skipRadioGroups);

        if (nextElement)
            focusBlurSandbox.focus(nextElement, () => resolve(nextElement));
        else
            resolve();
    });
}

function getFocusableElementsFilter (sourceElement, skipRadioGroups) {
    let filter = null;

    if (skipRadioGroups) {
        // NOTE: in all browsers except Mozilla and Opera focus sets on one radio set from group only.
        // in Mozilla and Opera focus sets on any radio set.
        if (sourceElement.name !== '' && !browserUtils.isFirefox)
            filter = item => !item.name || item === sourceElement || item.name !== sourceElement.name;
    }
    // NOTE arrow navigations works with radio buttons in all browsers only between radio buttons with same names
    // Navigation between radio buttons without name just moves focus between radio buttons in Chrome
    // In other browsers navigation between radio buttons without name does not work
    else if (sourceElement.name !== '')
        filter = item => isRadioButtonElement(item) && item.name === sourceElement.name;
    else if (browserUtils.isChrome)
        filter = item => isRadioButtonElement(item) && !item.name;

    return filter;
}

function filterFocusableElements (elements, sourceElement, skipRadioGroups) {
    if (!isRadioButtonElement(sourceElement))
        return elements;

    if (!skipRadioGroups && !sourceElement.name && !browserUtils.isChrome)
        return [sourceElement];

    const filterFn = getFocusableElementsFilter(sourceElement, skipRadioGroups);

    if (filterFn)
        elements = arrayUtils.filter(elements, filterFn);

    return elements;
}

function correctFocusableElement (elements, element, skipRadioGroups) {
    const isNotCheckedRadioButtonElement      = isRadioButtonElement(element) && element.name && !element.checked;
    let checkedRadioButtonElementWithSameName = null;

    if (skipRadioGroups && isNotCheckedRadioButtonElement) {
        checkedRadioButtonElementWithSameName = arrayUtils.find(elements, el => {
            return isRadioButtonElement(el) && el.name === element.name && el.checked;
        });
    }

    return checkedRadioButtonElementWithSameName || element;
}

export function getNextFocusableElement (element, reverse, skipRadioGroups) {
    const offset     = reverse ? -1 : 1;
    let allFocusable = domUtils.getFocusableElements(findDocument(element), true);

    allFocusable = filterFocusableElements(allFocusable, element, skipRadioGroups);

    const isRadioInput         = isRadioButtonElement(element);
    const currentIndex         = arrayUtils.indexOf(allFocusable, element);
    const isLastElementFocused = reverse ? currentIndex === 0 : currentIndex === allFocusable.length - 1;

    if (isLastElementFocused)
        return skipRadioGroups || !isRadioInput ? document.body : allFocusable[allFocusable.length - 1 - currentIndex];

    if (reverse && currentIndex === -1)
        return allFocusable[allFocusable.length - 1];

    return correctFocusableElement(allFocusable, allFocusable[currentIndex + offset], skipRadioGroups);
}
