import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';
import cursor from './cursor';
import isIframeWindow from '../../utils/is-window-in-iframe';

const browserUtils  = hammerhead.utils.browser;
const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;
const positionUtils = testCafeCore.positionUtils;
const domUtils      = testCafeCore.domUtils;


function getElementFromPoint (x, y, underTopShadowUIElement) {
    let topElement = null;

    return testCafeUI.hide(underTopShadowUIElement)
        .then(() => {
            topElement = positionUtils.getElementFromPoint(x, y);

            return testCafeUI.show(underTopShadowUIElement);
        })
        .then(() => topElement);
}

function ensureImageMap (imgElement, areaElement) {
    const mapElement = domUtils.closest(areaElement, 'map');

    return mapElement && mapElement.name === imgElement.useMap.substring(1) ? areaElement : imgElement;
}

function findElementOrNonEmptyChildFromPoint (x, y, element) {
    const topElement      = positionUtils.getElementFromPoint(x, y);
    const isNonEmptyChild = domUtils.containsElement(element, topElement) &&
                          nativeMethods.nodeTextContentGetter.call(topElement).length;

    if (topElement && topElement === element || isNonEmptyChild)
        return topElement;

    return null;
}

function correctTopElementByExpectedElement (topElement, expectedElement) {
    const expectedElementDefined = expectedElement && domUtils.isDomElement(expectedElement);

    if (!expectedElementDefined || !topElement || topElement === expectedElement)
        return topElement;

    const isTREFElement = domUtils.getTagName(expectedElement) === 'tref';

    // NOTE: 'document.elementFromPoint' can't find these types of elements
    if (isTREFElement)
        return expectedElement;

    // NOTE: T299665 - Incorrect click automation for images with an associated map element in Firefox
    // All browsers return the <area> element from document.getElementFromPoint, but
    // Firefox returns the <img> element. We should accomplish this for Firefox as well.
    const isImageMapArea = domUtils.getTagName(expectedElement) === 'area' && domUtils.isImgElement(topElement);

    if (browserUtils.isFirefox && isImageMapArea)
        return ensureImageMap(topElement, expectedElement);


    // NOTE: try to find a multi-line link by its rectangle (T163678)
    const isLinkOrChildExpected = domUtils.isAnchorElement(expectedElement) ||
                                domUtils.getParents(expectedElement, 'a').length;

    const isTopElementChildOfLink = isLinkOrChildExpected &&
                                  domUtils.containsElement(expectedElement, topElement) &&
                                  nativeMethods.nodeTextContentGetter.call(topElement).length;

    const shouldSearchForMultilineLink = isLinkOrChildExpected && !isTopElementChildOfLink &&
                                       nativeMethods.nodeTextContentGetter.call(expectedElement).length;

    if (!shouldSearchForMultilineLink)
        return topElement;

    const linkRect = expectedElement.getBoundingClientRect();

    return findElementOrNonEmptyChildFromPoint(linkRect.right - 1, linkRect.top + 1, expectedElement) ||
           findElementOrNonEmptyChildFromPoint(linkRect.left + 1, linkRect.bottom - 1, expectedElement) ||
           topElement;
}

export function fromPoint (x, y, expectedElement) {
    let foundElement = null;

    return getElementFromPoint(x, y)
        .then(topElement => {
            foundElement = topElement;

            // NOTE: when trying to get an element by elementFromPoint in iframe and the target
            // element is under any of shadow-ui elements, you will get null (only in IE).
            // In this case, you should hide a top window's shadow-ui root to obtain an element.
            let resChain = Promise.resolve(topElement);

            if (!foundElement && isIframeWindow(window) && x > 0 && y > 0) {
                resChain = resChain
                    .then(() => getElementFromPoint(x, y, true))
                    .then(element => {
                        foundElement = element;

                        return element;
                    });
            }

            return resChain
                .then(element => correctTopElementByExpectedElement(element, expectedElement))
                .then(correctedElement => {
                    return { element: correctedElement, corrected: correctedElement !== foundElement };
                });
        });
}

export function underCursor () {
    const cursorPosition = cursor.position;

    return fromPoint(cursorPosition.x, cursorPosition.y).then(({ element }) => element);
}
