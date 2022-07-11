import * as domUtils from './dom';
import * as styleUtils from './style';
import * as positionUtils from './position';

export function isIframeVisible (el: Node): boolean {
    return !hiddenUsingStyles(el as HTMLElement);
}

function hiddenUsingStyles (el: HTMLElement): boolean {
    return styleUtils.get(el, 'visibility') === 'hidden' ||
        styleUtils.get(el, 'display') === 'none';
}

function hiddenByRectangle (el: HTMLElement): boolean {
    const elementRectangle = positionUtils.getElementRectangle(el);

    return elementRectangle.width === 0 ||
        elementRectangle.height === 0;
}

export function isElementVisible (el: Node): boolean {
    if (domUtils.isTextNode(el))
        return !styleUtils.isNotVisibleNode(el);

    if (!domUtils.isContentEditableElement(el) &&
        !domUtils.isSVGElement(el) &&
        hiddenByRectangle(el as HTMLElement))
        return false;

    if (domUtils.isMapElement(el)) {
        const mapContainer = domUtils.getMapContainer(domUtils.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (styleUtils.isSelectVisibleChild(el)) {
        const select              = domUtils.getSelectParent(el) as HTMLSelectElement;
        const childRealIndex      = domUtils.getChildVisibleIndex(select, el);
        const realSelectSizeValue = styleUtils.getSelectElementSize(select);
        const topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
        const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (domUtils.isSVGElement(el)) {
        const hiddenParent = domUtils.findParent(el, true, (parent: Node) => {
            return hiddenUsingStyles(parent as unknown as HTMLElement);
        });

        if (!hiddenParent)
            return !hiddenByRectangle(el as unknown as HTMLElement);

        return false;
    }

    return styleUtils.hasDimensions(el as HTMLElement) && !hiddenUsingStyles(el as unknown as HTMLElement);
}
