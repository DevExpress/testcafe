import { adapter } from '../adapter';
import isIframeWindow from '../utils/is-window-iframe';
import { AxisValuesData } from '../utils/values/axis-values';
import { Window } from '../types';


function ensureImageMap<E> (imgElement: E, areaElement: E): Promise<E> {
    return adapter.PromiseCtor.resolve(adapter.dom.closest(areaElement, 'map'))
        .then(mapElement => {
            return mapElement && mapElement.name === adapter.dom.getImgMapName(imgElement) ? areaElement : imgElement;
        });
}

function findElementOrNonEmptyChildFromPoint<E> (point: AxisValuesData<number>, element?: E): Promise<E | null> {
    return adapter.PromiseCtor.resolve(adapter.position.getElementFromPoint(point))
        .then(topElement => {
            return adapter.PromiseCtor.resolve(adapter.dom.containsElement(element, topElement))
                .then(containsEl => containsEl && adapter.dom.getNodeText(topElement))
                .then(isNonEmptyChild => isNonEmptyChild || topElement && adapter.dom.isNodeEqual(topElement, element) ? topElement : null);
        });
}

function correctTopElementByExpectedElement<E> (topElement: E, expectedElement?: E): Promise<E> | E {
    if (!expectedElement || !topElement || adapter.dom.isNodeEqual(topElement, expectedElement))
        return topElement;

    const isTREFElement = adapter.dom.getTagName(expectedElement) === 'tref';

    // NOTE: 'document.elementFromPoint' can't find these types of elements
    if (isTREFElement)
        return expectedElement;

    // NOTE: T299665 - Incorrect click automation for images with an associated map element in Firefox
    // All browsers return the <area> element from document.getElementFromPoint, but
    // Firefox returns the <img> element. We should accomplish this for Firefox as well.
    const isImageMapArea = adapter.dom.getTagName(expectedElement) === 'area' && adapter.dom.isImgElement(topElement);

    if (adapter.browser.isFirefox && isImageMapArea)
        return ensureImageMap(topElement, expectedElement);

    // NOTE: try to find a multi-line link by its rectangle (T163678)
    return adapter.PromiseCtor.resolve(adapter.dom.closest(expectedElement, 'a'))
        .then(anchor => !!anchor)
        .then(isLinkOrChildExpected => {
            if (!isLinkOrChildExpected)
                return false;

            return adapter.PromiseCtor.resolve(adapter.dom.containsElement(expectedElement, topElement))
                .then(containsElement => containsElement && adapter.dom.getNodeText(topElement))
                .then(isTopElementChildOfLink => !isTopElementChildOfLink && adapter.dom.getNodeText(expectedElement));
        })
        .then(shouldSearchForMultilineLink => {
            if (!shouldSearchForMultilineLink)
                return topElement;

            return adapter.PromiseCtor.resolve(adapter.position.getClientDimensions(expectedElement))
                .then(linkRect => findElementOrNonEmptyChildFromPoint({ x: linkRect.right - 1, y: linkRect.top + 1 }, expectedElement)
                    .then(el => el || findElementOrNonEmptyChildFromPoint({ x: linkRect.left + 1, y: linkRect.bottom - 1 }, expectedElement))
                    .then(el => el || topElement));
        });
}

export default function getElementFromPoint<E, W extends Window> (point: AxisValuesData<number>, win: W, expectedEl?: E): Promise<E> {
    return adapter.getElementExceptUI(point)
        .then((topElement: E) => {
            // NOTE: when trying to get an element by elementFromPoint in iframe and the target
            // element is under any of shadow-ui elements, you will get null (only in IE).
            // In this case, you should hide a top window's shadow-ui root to obtain an element.
            let resChain = adapter.PromiseCtor.resolve(topElement);

            if (!topElement && isIframeWindow(win) && point.x > 0 && point.y > 0)
                resChain = resChain.then(() => adapter.getElementExceptUI(point, true));

            return resChain.then((element: E) => correctTopElementByExpectedElement(element, expectedEl));
        });
}
