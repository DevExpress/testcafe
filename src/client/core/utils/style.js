import hammerhead from '../deps/hammerhead';

export * from './shared/style';
export { hasScroll } from './shared/scroll';


const styleUtils = hammerhead.utils.style;

export const getBordersWidth      = hammerhead.utils.style.getBordersWidth;
export const getComputedStyle     = hammerhead.utils.style.getComputedStyle;
export const getElementMargin     = hammerhead.utils.style.getElementMargin;
export const getElementPadding    = hammerhead.utils.style.getElementPadding;
export const getElementScroll     = hammerhead.utils.style.getElementScroll;
export const getOptionHeight      = hammerhead.utils.style.getOptionHeight;
export const getSelectElementSize = hammerhead.utils.style.getSelectElementSize;
export const isElementVisible     = hammerhead.utils.style.isElementVisible;
export const isSelectVisibleChild = hammerhead.utils.style.isVisibleChild;
export const getWidth             = hammerhead.utils.style.getWidth;
export const getHeight            = hammerhead.utils.style.getHeight;
export const getInnerWidth        = hammerhead.utils.style.getInnerWidth;
export const getInnerHeight       = hammerhead.utils.style.getInnerHeight;
export const getScrollLeft        = hammerhead.utils.style.getScrollLeft;
export const getScrollTop         = hammerhead.utils.style.getScrollTop;
export const setScrollLeft        = hammerhead.utils.style.setScrollLeft;
export const setScrollTop         = hammerhead.utils.style.setScrollTop;
export const get                  = hammerhead.utils.style.get;


export function set (el, style, value) {
    if (typeof style === 'string')
        styleUtils.set(el, style, value);

    for (const property in style) {
        if (style.hasOwnProperty(property))
            styleUtils.set(el, property, style[property]);
    }
}

function getViewportDimension (windowDimension, documentDimension, bodyDimension) {
    if (documentDimension > windowDimension)
        return bodyDimension;

    if (bodyDimension > windowDimension)
        return documentDimension;

    return Math.max(bodyDimension, documentDimension);
}

export function getViewportDimensions () {
    return {
        width:  getViewportDimension(window.innerWidth, document.documentElement.clientWidth, document.body.clientWidth),
        height: getViewportDimension(window.innerHeight, document.documentElement.clientHeight, document.body.clientHeight),
    };
}

