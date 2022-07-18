import { AxisValuesData } from '../core/utils/values/axis-values';
// @ts-ignore
import { Promise, utils } from '../driver/deps/hammerhead';
import * as domUtils from '../core/utils/dom';
import * as positionUtils from '../core/utils/position';
import getElementExceptUI from './utils/get-element-except-ui';

function ensureImageMap (imgElement: Element, areaElement: Element): Promise<HTMLElement> {
    return Promise.resolve(domUtils.closest(areaElement, 'map'))
        .then((mapElement: HTMLMapElement) => {
            return mapElement && mapElement.name === domUtils.getImgMapName(imgElement) ? areaElement : imgElement;
        });
}

function findElementOrNonEmptyChildFromPoint (point: AxisValuesData<number>, element?: HTMLElement): Promise<HTMLElement | null> {
    return Promise.resolve(positionUtils.getElementFromPoint(point))
        .then((topElement: HTMLElement) => {
            return Promise.resolve(domUtils.containsElement(element, topElement))
                .then((containsEl: HTMLElement) => containsEl && domUtils.getNodeText(topElement))
                .then((isNonEmptyChild: HTMLElement) => isNonEmptyChild || topElement && domUtils.isNodeEqual(topElement, element) ? topElement : null);
        });
}

function correctTopElementByExpectedElement (topElement: Element, expectedElement?: HTMLElement): Promise<HTMLElement> | HTMLElement {
    if (!expectedElement || !topElement || domUtils.isNodeEqual(topElement, expectedElement))
        return topElement;

    const isTREFElement = domUtils.getTagName(expectedElement) === 'tref';

    // NOTE: 'document.elementFromPoint' can't find these types of elements
    if (isTREFElement)
        return expectedElement;

    // NOTE: T299665 - Incorrect click automation for images with an associated map element in Firefox
    // All browsers return the <area> element from document.getElementFromPoint, but
    // Firefox returns the <img> element. We should accomplish this for Firefox as well.
    const isImageMapArea = domUtils.getTagName(expectedElement) === 'area' && domUtils.isImgElement(topElement);

    if (utils.browser.isFirefox && isImageMapArea)
        return ensureImageMap(topElement, expectedElement);

    // NOTE: try to find a multi-line link by its rectangle (T163678)
    return Promise.resolve(domUtils.closest(expectedElement, 'a'))
        .then((anchor: any) => !!anchor)
        .then((isLinkOrChildExpected: boolean) => {
            if (!isLinkOrChildExpected)
                return false;

            return Promise.resolve(domUtils.containsElement(expectedElement, topElement))
                .then((containsElement: HTMLElement) => containsElement && domUtils.getNodeText(topElement))
                .then((isTopElementChildOfLink: HTMLElement) => !isTopElementChildOfLink && domUtils.getNodeText(expectedElement));
        })
        .then((shouldSearchForMultilineLink: boolean) => {
            if (!shouldSearchForMultilineLink)
                return topElement;

            return Promise.resolve(positionUtils.getClientDimensions(expectedElement))
                .then((linkRect: any) => findElementOrNonEmptyChildFromPoint({ x: linkRect.right - 1, y: linkRect.top + 1 }, expectedElement)
                    .then((el: any) => el || findElementOrNonEmptyChildFromPoint({ x: linkRect.left + 1, y: linkRect.bottom - 1 }, expectedElement))
                    .then((el: any) => el || topElement));
        });
}

export default function getElementFromPoint (point: AxisValuesData<number>, win?: Window, expectedEl?: HTMLElement): Promise<HTMLElement> {
    return getElementExceptUI(point)
        .then((topElement: HTMLElement) => {
            // NOTE: when trying to get an element by elementFromPoint in iframe and the target
            // element is under any of shadow-ui elements, you will get null (only in IE).
            // In this case, you should hide a top window's shadow-ui root to obtain an element.
            let resChain = Promise.resolve(topElement);

            if (!topElement && utils.dom.isIframeWindow(win || window) && point.x > 0 && point.y > 0)
                resChain = resChain.then(() => getElementExceptUI(point, true));

            return resChain.then((element: HTMLElement) => correctTopElementByExpectedElement(element, expectedEl));
        });
}
