import BoundaryValues, { BoundaryValuesData } from '../../../../shared/utils/values/boundary-values';
import Dimensions from '../../../../shared/utils/values/dimensions';
import AxisValues, { AxisValuesData } from '../../../../shared/utils/values/axis-values';
import * as domUtils from '../dom';
import * as styleUtils from '../style';
import * as positionUtils from '../position';

export function getClientDimensions (target: Element): Dimensions {
    const isHtmlElement     = domUtils.isHtmlElement(target);
    const body              = isHtmlElement ? target.getElementsByTagName('body')[0] : null;
    const elementRect       = target.getBoundingClientRect();
    const elBorders         = BoundaryValues.create(styleUtils.getBordersWidth(target));
    const elScroll          = styleUtils.getElementScroll(target);
    const isElementInIframe = domUtils.isElementInIframe(target);
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
        const iframeElement = domUtils.getIframeByElement(target);

        if (iframeElement) {
            const iframeOffset  = positionUtils.getOffsetPosition(iframeElement);
            const clientOffset  = positionUtils.offsetToClientCoords(AxisValues.create(iframeOffset));
            const iframeBorders = styleUtils.getBordersWidth(iframeElement);

            elPosition.add(clientOffset).add(AxisValues.create(iframeBorders));

            if (isHtmlElement)
                elBorders.add(iframeBorders);
        }
    }

    const hasRightScrollbar  = !isHtmlElement && styleUtils.getInnerWidth(target) !== target.clientWidth;
    const hasBottomScrollbar = !isHtmlElement && styleUtils.getInnerHeight(target) !== target.clientHeight;

    const scrollbar = {
        right:  hasRightScrollbar ? domUtils.getScrollbarSize() : 0,
        bottom: hasBottomScrollbar ? domUtils.getScrollbarSize() : 0,
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
