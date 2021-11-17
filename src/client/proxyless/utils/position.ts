import * as domUtils from './dom';
import * as styleUtils from './style';
import nativeMethods from '../native-methods';
import { ElementRectangle } from '../../core/utils/shared/types';
import { BoundaryValuesData } from '../../../shared/utils/values/boundary-values';
import AxisValues, { AxisValuesData, LeftTopValues } from '../../../shared/utils/values/axis-values';


function calcOffsetPosition (el: Element, borders: BoundaryValuesData, offsetPosition: LeftTopValues<number>): LeftTopValues<number> {
    if (domUtils.isSVGElementOrChild(el)) {
        const relativeRectangle = getSvgElementRelativeRectangle(el);

        return {
            left: relativeRectangle.left + borders.left,
            top:  relativeRectangle.top + borders.top,
        };
    }

    return {
        left: offsetPosition.left + borders.left,
        top:  offsetPosition.top + borders.top,
    };
}

export function offsetToClientCoords (coords: AxisValuesData<number>, currentDocument?: Document): AxisValuesData<number> {
    const doc            = currentDocument || document;
    const docScrollLeft  = styleUtils.getScrollLeft(doc);
    const docScrollTop   = styleUtils.getScrollTop(doc);
    const bodyScrollLeft = styleUtils.getScrollLeft(doc.body);
    const bodyScrollTop  = styleUtils.getScrollTop(doc.body);
    const scroll         = {
        x: docScrollLeft === 0 && bodyScrollLeft !== 0 ? bodyScrollLeft : docScrollLeft,
        y: docScrollTop === 0 && bodyScrollTop !== 0 ? bodyScrollTop : docScrollTop,
    };

    return AxisValues.create(coords).sub(scroll);
}

function getOffsetParent (el: Element): Element | null {
    if (!el)
        return null;

    let offsetParent = (el as HTMLElement).offsetParent as HTMLElement || document.body;

    while (offsetParent && (!/^(?:body|html)$/i.test(offsetParent.nodeName) &&
        styleUtils.get(offsetParent, 'position') === 'static'))
        offsetParent = offsetParent.offsetParent as HTMLElement;

    return offsetParent;
}

function getSvgElementRelativeRectangle (el: SVGElement): ElementRectangle {
    const tagName            = domUtils.getTagName(el);
    const isSvgTextElement   = tagName === 'tspan' || tagName === 'tref' || tagName === 'textpath';
    const boundingClientRect = el.getBoundingClientRect();
    const elementRect        = {
        left:   boundingClientRect.left + (document.body.scrollLeft || document.documentElement.scrollLeft),
        top:    boundingClientRect.top + (document.body.scrollTop || document.documentElement.scrollTop),
        width:  boundingClientRect.width,
        height: boundingClientRect.height,
    };

    if (isSvgTextElement) {
        // @ts-ignore
        const htmlEl = el as HTMLElement;

        const offsetParent       = getOffsetParent(el) as Element;
        const elOffset           = styleUtils.getOffset(el) as LeftTopValues<number>;
        const offsetParentOffset = styleUtils.getOffset(offsetParent) as LeftTopValues<number>;
        const offsetParentIsBody = domUtils.getTagName(offsetParent) === 'body';

        return {
            height: elementRect.height,
            left:   offsetParentIsBody ? htmlEl.offsetLeft || elOffset.left : offsetParentOffset.left + htmlEl.offsetLeft,
            top:    offsetParentIsBody ? htmlEl.offsetTop || elOffset.top : offsetParentOffset.top + htmlEl.offsetTop,
            width:  elementRect.width,
        };
    }

    const strokeWidthValue = nativeMethods.getAttribute.call(el, 'stroke-width');

    // NOTE: We assume that the 'stroke-width' attribute can only be set in pixels.
    let strokeWidth = strokeWidthValue ? +strokeWidthValue.replace(/px|em|ex|pt|pc|cm|mm|in/, '') : 1;

    if (strokeWidth && +strokeWidth % 2 !== 0)
        strokeWidth = +strokeWidth + 1;

    if ((tagName === 'line' || tagName === 'polyline' || tagName === 'polygon' || tagName === 'path') &&
        (!elementRect.width || !elementRect.height)) {
        if (!elementRect.width && elementRect.height) {
            elementRect.left  -= strokeWidth / 2;
            elementRect.width = strokeWidth;
        }
        else if (elementRect.width && !elementRect.height) {
            elementRect.height = strokeWidth;
            elementRect.top    -= strokeWidth / 2;
        }
    }
    else {
        if (tagName === 'polygon') {
            elementRect.height += 2 * strokeWidth;
            elementRect.left -= strokeWidth;
            elementRect.top -= strokeWidth;
            elementRect.width += 2 * strokeWidth;
        }

        elementRect.height += strokeWidth;
        elementRect.left -= strokeWidth / 2;
        elementRect.top -= strokeWidth / 2;
        elementRect.width += strokeWidth;
    }

    return elementRect;
}

function calcOffsetPositionInIframe (el: Element, borders: BoundaryValuesData, offsetPosition: LeftTopValues<number>,
    doc: Document, currentIframe: HTMLIFrameElement | HTMLFrameElement): LeftTopValues<number> {

    const iframeBorders = styleUtils.getBordersWidth(currentIframe);

    borders.left += iframeBorders.left;
    borders.top  += iframeBorders.top;

    const iframeOffset  = getOffsetPosition(currentIframe);
    const iframePadding = styleUtils.getElementPadding(currentIframe);
    let clientPosition;

    if (domUtils.isSVGElementOrChild(el)) {
        const relativeRectangle = getSvgElementRelativeRectangle(el);

        clientPosition = {
            x: relativeRectangle.left - (document.body.scrollLeft || document.documentElement.scrollLeft) + borders.left,
            y: relativeRectangle.top - (document.body.scrollTop || document.documentElement.scrollTop) + borders.top,
        };
    }
    else {
        clientPosition = offsetToClientCoords({
            x: offsetPosition.left + borders.left,
            y: offsetPosition.top + borders.top,
        }, doc);
    }

    return {
        left: iframeOffset.left + clientPosition.x + iframePadding.left,
        top:  iframeOffset.top + clientPosition.y + iframePadding.top,
    };
}

function getSelectChildRectangle (el: HTMLElement): ElementRectangle {
    const select = domUtils.getSelectParent(el);

    if (select) {
        const selectRectangle      = getElementRectangle(select);
        const selectBorders        = styleUtils.getBordersWidth(select);
        const selectRightScrollbar = styleUtils.getInnerWidth(select) === select.clientWidth ? 0 : domUtils.getScrollbarSize();
        const optionHeight         = styleUtils.getOptionHeight(select);
        const optionRealIndex      = domUtils.getChildVisibleIndex(select, el);
        const optionVisibleIndex   = Math.max(optionRealIndex - styleUtils.getScrollTop(select) / optionHeight, 0);

        return {
            height: optionHeight,
            left:   selectRectangle.left + selectBorders.left,
            top:    selectRectangle.top + selectBorders.top + styleUtils.getElementPadding(select).top +
                optionVisibleIndex * optionHeight,
            width: selectRectangle.width - (selectBorders.left + selectBorders.right) - selectRightScrollbar,
        };
    }

    return getElementRectangle(el);
}

export function getOffsetPosition (el: Element | Document, roundFn = Math.round): LeftTopValues<number> {
    if (domUtils.isMapElement(el)) {
        const rectangle = getMapElementRectangle(el);

        return {
            left: rectangle.left,
            top:  rectangle.top,
        };
    }

    const doc            = domUtils.findDocument(el);
    const isInIframe     = domUtils.isElementInIframe(el, doc);
    const currentIframe  = isInIframe ? domUtils.getIframeByElement(doc) : null;
    const offsetPosition = doc === el ? styleUtils.getOffset(doc.documentElement) : styleUtils.getOffset(el);
    const borders        = styleUtils.getBordersWidth(doc.body);

    let left;
    let top;

    if (!isInIframe || !currentIframe)
        ({ left, top } = calcOffsetPosition(el as Element, borders, offsetPosition as LeftTopValues<number>));
    else
        ({ left, top } = calcOffsetPositionInIframe(el as Element, borders, offsetPosition as LeftTopValues<number>, doc, currentIframe));

    if (typeof roundFn === 'function') {
        left = roundFn(left);
        top  = roundFn(top);
    }

    return { left, top };
}

function getAreaElementRectangle (el: HTMLAreaElement, mapContainer: Element): ElementRectangle | null {
    const shapeAttr  = nativeMethods.getAttribute.call(el, 'shape');
    const coordsAttr = nativeMethods.getAttribute.call(el, 'coords');

    if (shapeAttr === 'default')
        return getElementRectangle(mapContainer);

    if (!shapeAttr || !coordsAttr)
        return null;

    const coordsStrings = coordsAttr.split(',');
    const coords        = [];

    if (!coords.length)
        return null;

    for (let i = 0; i < coords.length; i++) {
        coords[i] = parseInt(coordsStrings[i], 10);

        if (isNaN(coords[i]))
            return null;
    }

    let rectangle: ElementRectangle | null = null;

    switch (shapeAttr) {
        case 'rect':
            if (coords.length === 4) {
                rectangle = {
                    height: coords[3] - coords[1],
                    left:   coords[0],
                    top:    coords[1],
                    width:  coords[2] - coords[0],
                };

            }
            break;

        case 'circle':
            if (coords.length === 3) {
                rectangle = {
                    height: coords[2] * 2,
                    left:   coords[0] - coords[2],
                    top:    coords[1] - coords[2],
                    width:  coords[2] * 2,
                };
            }

            break;

        case 'poly':
            if (coords.length >= 6 && coords.length % 2 === 0) {
                let left   = coords[0];
                let right  = coords[0];
                let top    = coords[1];
                let bottom = coords[1];

                for (let i = 2; i < coords.length; i += 2) {
                    left  = coords[i] < left ? coords[i] : left;
                    right = coords[i] > right ? coords[i] : right;
                }

                for (let i = 3; i < coords.length; i += 2) {
                    top    = coords[i] < top ? coords[i] : top;
                    bottom = coords[i] > bottom ? coords[i] : bottom;
                }

                rectangle = {
                    left, top,
                    height: bottom - top,
                    width:  right - left,
                };
            }

            break;
    }

    if (rectangle) {
        const containerOffset = getOffsetPosition(mapContainer);

        rectangle.left += containerOffset.left;
        rectangle.top  += containerOffset.top;
    }

    return rectangle;
}

function getMapElementRectangle (el: HTMLMapElement | HTMLAreaElement): ElementRectangle {
    const mapContainer = domUtils.getMapContainer(el);

    if (mapContainer) {
        const tagName = domUtils.getTagName(el);

        if (tagName === 'map')
            return getElementRectangle(mapContainer);
        else if (tagName === 'area') {
            const areaElementRectangle = getAreaElementRectangle(el as HTMLAreaElement, mapContainer);

            if (areaElementRectangle)
                return areaElementRectangle;
        }
    }

    return {
        height: 0,
        left:   0,
        top:    0,
        width:  0,
    };
}

export function getElementRectangle (el: Node): ElementRectangle {
    let rectangle: ElementRectangle;

    if (domUtils.isMapElement(el))
        rectangle = getMapElementRectangle(el);
    else if (styleUtils.isSelectVisibleChild(el))
        rectangle = getSelectChildRectangle(el);
    else {
        const element           = el as Element;
        const elementOffset     = getOffsetPosition(element);
        const relativeRectangle = domUtils.isSVGElementOrChild(element)
            ? getSvgElementRelativeRectangle(el as SVGElement)
            : element.getBoundingClientRect();

        rectangle = {
            height: relativeRectangle.height,
            left:   elementOffset.left,
            top:    elementOffset.top,
            width:  relativeRectangle.width,
        };
    }

    rectangle.height = Math.round(rectangle.height);
    rectangle.left   = Math.round(rectangle.left);
    rectangle.top    = Math.round(rectangle.top);
    rectangle.width  = Math.round(rectangle.width);

    return rectangle;
}
