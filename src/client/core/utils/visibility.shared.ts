import adapter from './adapter/index';
import * as styleUtils from './style.shared';


export function isElementVisible (el: Node): boolean {
    if (adapter.isTextNode(el))
        return !styleUtils.isNotVisibleNode(el);

    if (!adapter.isContentEditableElement(el)) {
        const elementRectangle = adapter.getElementRectangle(el);

        if (elementRectangle.width === 0 || elementRectangle.height === 0)
            return false;
    }

    if (adapter.isMapElement(el)) {
        const mapContainer = adapter.getMapContainer(adapter.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (adapter.isSelectVisibleChild(el)) {
        const select              = adapter.getSelectParent(el) as HTMLSelectElement;
        const childRealIndex      = adapter.getChildVisibleIndex(select, el);
        const realSelectSizeValue = adapter.getSelectElementSize(select);
        const topVisibleIndex     = Math.max(adapter.getScrollTop(select) / adapter.getOptionHeight(select), 0);
        const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (adapter.isSVGElement(el))
        return adapter.getStyle(el, 'visibility') !== 'hidden' && adapter.getStyle(el, 'display') !== 'none';

    return styleUtils.hasDimensions(el as HTMLElement) && adapter.getStyle(el, 'visibility') !== 'hidden';
}
