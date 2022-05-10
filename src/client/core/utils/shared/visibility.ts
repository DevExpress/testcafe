import adapter from './adapter/index';
import { isNotVisibleNode, hasDimensions } from './style';

export function isIframeVisible (el: Node): boolean {
    return adapter.style.get(el, 'visibility') !== 'hidden';
}

export function isElementVisible (el: Node): boolean {
    if (adapter.dom.isTextNode(el))
        return !isNotVisibleNode(el);

    if (!adapter.dom.isContentEditableElement(el)) {
        const elementRectangle = adapter.position.getElementRectangle(el);

        if (elementRectangle.width === 0 || elementRectangle.height === 0)
            return false;
    }

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
        if (adapter.style.get(el, 'visibility') === 'hidden' || adapter.style.get(el, 'display') === 'none')
            return false;

        const parent = adapter.dom.findParent(el);

        return parent ? isElementVisible(parent) : true;
    }

    return hasDimensions(el as HTMLElement) && adapter.style.get(el, 'visibility') !== 'hidden';
}
