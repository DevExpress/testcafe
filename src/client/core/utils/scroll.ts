import AxisValues from './values/axis-values';
// @ts-ignore
import { utils, nativeMethods } from '../deps/hammerhead';
import * as domUtils from './dom';
import * as styleUtils from './style';

const SCROLLABLE_OVERFLOW_STYLE_RE = /auto|scroll|hidden/i;

function getScrollable (el: Element): AxisValues<boolean> {
    const overflowX              = styleUtils.get(el, 'overflowX') as string;
    const overflowY              = styleUtils.get(el, 'overflowY') as string;
    const scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    const scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    return new AxisValues(scrollableHorizontally, scrollableVertically);
}

function hasBodyScroll (el: HTMLBodyElement): boolean {
    const overflowX              = styleUtils.get(el, 'overflowX') as string;
    const overflowY              = styleUtils.get(el, 'overflowY') as string;
    const scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    const scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    const documentElement = domUtils.findDocument(el).documentElement;

    let bodyScrollHeight = el.scrollHeight;

    if (utils.browser.isChrome || utils.browser.isFirefox || utils.browser.isSafari) {
        const { top: bodyTop }     = el.getBoundingClientRect();
        const { top: documentTop } = documentElement.getBoundingClientRect();

        bodyScrollHeight = bodyScrollHeight - documentTop + bodyTop;
    }

    return (scrollableHorizontally || scrollableVertically) &&
           bodyScrollHeight > documentElement.scrollHeight;
}

function hasHTMLElementScroll (el: HTMLHtmlElement): boolean {
    const overflowX = styleUtils.get(el, 'overflowX') as string;
    const overflowY = styleUtils.get(el, 'overflowY') as string;

    //T303226
    if (overflowX === 'hidden' && overflowY === 'hidden')
        return false;

    const hasHorizontalScroll = el.scrollHeight > el.clientHeight;
    const hasVerticalScroll   = el.scrollWidth > el.clientWidth;

    if (hasHorizontalScroll || hasVerticalScroll)
        return true;

    //T174562 - wrong scrolling in iframes without src and others iframes
    const body = el.getElementsByTagName('body')[0];

    if (!body)
        return false;

    if (hasBodyScroll(body))
        return false;

    const clientWidth  = Math.min(el.clientWidth, body.clientWidth);
    const clientHeight = Math.min(el.clientHeight, body.clientHeight);

    return body.scrollHeight > clientHeight || body.scrollWidth > clientWidth;
}

export function hasScroll (el: Element): boolean {
    if (domUtils.isBodyElement(el))
        return hasBodyScroll(el as HTMLBodyElement);

    if (domUtils.isHtmlElement(el))
        return hasHTMLElementScroll(el as HTMLHtmlElement);

    const scrollable = getScrollable(el);

    if (!scrollable.x && !scrollable.y)
        return false;

    const hasVerticalScroll   = scrollable.y && el.scrollHeight > el.clientHeight;
    const hasHorizontalScroll = scrollable.x && el.scrollWidth > el.clientWidth;

    return hasHorizontalScroll || hasVerticalScroll;
}

export function getScrollableParents (element: HTMLElement): HTMLElement[] {
    const parentsArray = domUtils.getParents(element);

    // if (domUtils.isElementInIframe(element)) {
    //     const iframe = domUtils.getIframeByElement(element);

    //     if (iframe) {
    //         const iFrameParents = domUtils.getParents(iframe);

    //         parentsArray.concat(iFrameParents);
    //     }
    // }

    return nativeMethods.arrayFilter.call(parentsArray, hasScroll);
}
