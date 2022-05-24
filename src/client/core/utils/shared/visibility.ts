import adapter from './adapter/index';
import { isNotVisibleNode, hasDimensions } from './style';

function hiddenUsingStyles (el: HTMLElement): boolean {
    return adapter.style.get(el, 'visibility') === 'hidden' ||
        adapter.style.get(el, 'display') === 'none';
}

function hiddenByRectangle (el: HTMLElement): boolean {
    const elementRectangle = adapter.position.getElementRectangle(el);

    return elementRectangle.width === 0 ||
        elementRectangle.height === 0;
}

export function isElementVisible (el: Node): boolean {
    if (adapter.dom.isTextNode(el))
        return !isNotVisibleNode(el);

    if (!adapter.dom.isContentEditableElement(el) &&
        !adapter.dom.isSVGElement(el) &&
        hiddenByRectangle(el as HTMLElement))
        return false;

    if (adapter.dom.isMapElement(el)) {
        const mapContainer = adapter.dom.getMapContainer(adapter.dom.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (adapter.style.isSelectVisibleChild(el)) {
        const select              = adapter.dom.getSelectParent(el) as HTMLSelectElement;
        const childRealIndex      = adapter.dom.getChildVisibleIndex(select, el);
        const realSelectSizeValue = adapter.style.getSelectElementSize(select);
        const topVisibleIndex     = Math.max(adapter.style.getScrollTop(select) / adapter.style.getOptionHeight(select), 0);
        const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (adapter.dom.isSVGElement(el)) {
        const hiddenParent = adapter.dom.findParent(el, true, (parent: Node) => {
            return hiddenUsingStyles(parent as unknown as HTMLElement);
        });

        if (!hiddenParent)
            return !hiddenByRectangle(el as unknown as HTMLElement);

        return false;
    }

    return hasDimensions(el as HTMLElement) && !hiddenUsingStyles(el as unknown as HTMLElement);
}
