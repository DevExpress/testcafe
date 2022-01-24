import adapter from './adapter/index';
import BoundaryValues, { BoundaryValuesData } from '../../../../shared/utils/values/boundary-values';
import Dimensions from '../../../../shared/utils/values/dimensions';
import AxisValues, { AxisValuesData } from '../../../../shared/utils/values/axis-values';

export function getClientDimensions (target: Element): Dimensions {
    const isHtmlElement     = adapter.dom.isHtmlElement(target);
    const body              = isHtmlElement ? target.getElementsByTagName('body')[0] : null;
    const elementRect       = target.getBoundingClientRect();
    const elBorders         = BoundaryValues.create(adapter.style.getBordersWidth(target));
    const elScroll          = adapter.style.getElementScroll(target);
    const isElementInIframe = adapter.dom.isElementInIframe(target);
    const isCompatMode      = target.ownerDocument.compatMode === 'BackCompat';
    const elPosition        = isHtmlElement ? new AxisValues(0, 0) : AxisValues.create(elementRect);

    let elHeight   = elementRect.height;
    let elWidth    = elementRect.width;

    if (isHtmlElement) {
        if (body && isCompatMode) {
            elHeight = body.clientHeight;
            elWidth  = body.clientWidth;
        }
        else {
            elHeight = target.clientHeight;
            elWidth  = target.clientWidth;
        }
    }

    if (isElementInIframe) {
        const iframeElement = adapter.dom.getIframeByElement(target);

        if (iframeElement) {
            const iframeOffset  = adapter.position.getOffsetPosition(iframeElement);
            const clientOffset  = adapter.position.offsetToClientCoords(AxisValues.create(iframeOffset));
            const iframeBorders = adapter.style.getBordersWidth(iframeElement);

            elPosition.add(clientOffset).add(AxisValues.create(iframeBorders));

            if (isHtmlElement)
                elBorders.add(iframeBorders);
        }
    }

    const hasRightScrollbar  = !isHtmlElement && adapter.style.getInnerWidth(target) !== target.clientWidth;
    const hasBottomScrollbar = !isHtmlElement && adapter.style.getInnerHeight(target) !== target.clientHeight;

    const scrollbar = {
        right:  hasRightScrollbar ? adapter.dom.getScrollbarSize() : 0,
        bottom: hasBottomScrollbar ? adapter.dom.getScrollbarSize() : 0,
    };

    return new Dimensions(elWidth, elHeight, elPosition, elBorders, elScroll, scrollbar);
}

export function getElementFromPoint ({ x, y }: AxisValuesData<number>): Element | null {
    // @ts-ignore
    const ieFn = document.getElementFromPoint;
    const func = ieFn || document.elementFromPoint;

    let el: Element | null = null;

    try {
        // Permission denied to access property 'getElementFromPoint' error in iframe
        el = func.call(document, x, y);
    }
    catch {
        return null;
    }

    //NOTE: elementFromPoint returns null when is's a border of an iframe
    if (el === null)
        el = func.call(document, x - 1, y - 1);

    while (el && el.shadowRoot && el.shadowRoot.elementFromPoint) {
        const shadowEl = el.shadowRoot.elementFromPoint(x, y);

        if (!shadowEl || el === shadowEl)
            break;

        el = shadowEl;
    }

    return el;
}

export function calcRelativePosition (dimensions: Dimensions, toDimensions: Dimensions): BoundaryValuesData {
    const pos = BoundaryValues.create({
        top:    dimensions.top - toDimensions.top,
        left:   dimensions.left - toDimensions.left,
        right:  toDimensions.right - dimensions.right,
        bottom: toDimensions.bottom - dimensions.bottom,
    });

    return pos.sub(toDimensions.border).sub(toDimensions.scrollbar).round(Math.ceil, Math.floor);
}
