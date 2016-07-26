import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';
import cursor from './cursor';

var browserUtils  = hammerhead.utils.browser;
var positionUtils = testCafeCore.positionUtils;
var domUtils      = testCafeCore.domUtils;


function getElementFromPoint (x, y) {
    testCafeUI.hide();

    var topElement = positionUtils.getElementFromPoint(x, y);

    testCafeUI.show();

    return topElement;
}

function ensureImageMap (imgElement, areaElement) {
    var mapElement = domUtils.closest(areaElement, 'map');

    return mapElement && mapElement.name === imgElement.useMap.substring(1) ? areaElement : imgElement;
}

function findElementOrNonEmptyChildFromPoint (x, y, element) {
    var topElement      = positionUtils.getElementFromPoint(x, y);
    var isNonEmptyChild = domUtils.containsElement(element, topElement) && topElement.textContent.length;

    if (topElement && topElement === element || isNonEmptyChild)
        return topElement;

    return null;
}

export function fromPoint (x, y, expectedElement) {
    var topElement             = getElementFromPoint(x, y);
    var expectedElementDefined = expectedElement && domUtils.isDomElement(expectedElement);

    if (!expectedElementDefined || !topElement || topElement === expectedElement)
        return topElement;

    var isTREFElement = domUtils.getTagName(expectedElement) === 'tref';

    // NOTE: 'document.elementFromPoint' can't find these types of elements
    if (isTREFElement)
        return expectedElement;

    // NOTE: T299665 - Incorrect click automation for images with an associated map element in Firefox
    // All browsers return the <area> element from document.getElementFromPoint, but
    // Firefox returns the <img> element. We should accomplish this for Firefox as well.
    var isImageMapArea = domUtils.getTagName(expectedElement) === 'area' && domUtils.isImgElement(topElement);

    if (browserUtils.isFirefox && isImageMapArea)
        return ensureImageMap(topElement, expectedElement);


    // NOTE: try to find a multi-line link by its rectangle (T163678)
    var isLinkOrChildExpected = domUtils.isAnchorElement(expectedElement) ||
                                domUtils.getParents(expectedElement, 'a').length;

    var isTopElementChildOfLink = isLinkOrChildExpected &&
                                  domUtils.containsElement(expectedElement, topElement) &&
                                  topElement.textContent.length;

    var shouldSearchForMultilineLink = isLinkOrChildExpected && !isTopElementChildOfLink &&
                                       expectedElement.textContent.length;

    if (!shouldSearchForMultilineLink)
        return topElement;

    var linkRect = expectedElement.getBoundingClientRect();

    return findElementOrNonEmptyChildFromPoint(linkRect.right - 1, linkRect.top + 1, expectedElement) ||
           findElementOrNonEmptyChildFromPoint(linkRect.left + 1, linkRect.bottom - 1, expectedElement) ||
           topElement;
}

export function underCursor () {
    var cursorPosition = cursor.position;

    return fromPoint(cursorPosition.x, cursorPosition.y);
}
