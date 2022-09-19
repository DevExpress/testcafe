import hammerhead from '../deps/hammerhead';

const htmlUtils        = hammerhead.utils.html;
const nativeMethods    = hammerhead.nativeMethods;

const MAX_TEXT_CONTENT_LENGTH = 10;

export default function stringifyElement (element: HTMLElement | null): string {
    if (!element)
        return '';

    const emptyElement = nativeMethods.cloneNode.call(element);
    const outerHtml    = htmlUtils.cleanUpHtml(nativeMethods.elementOuterHTMLGetter.call(emptyElement));
    const textContent  = nativeMethods.nodeTextContentGetter.call(element).substr(0, MAX_TEXT_CONTENT_LENGTH);
    const children     = nativeMethods.elementChildrenGetter.call(element);

    if (nativeMethods.htmlCollectionLengthGetter.call(children) > 0)
        return outerHtml.replace('></', '>...</');

    if (textContent)
        return outerHtml.replace('></', `>${textContent}</`);

    return outerHtml;
}
