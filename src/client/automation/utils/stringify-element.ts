import hammerhead from '../deps/hammerhead';

const htmlUtils        = hammerhead.utils.html;
const nativeMethods    = hammerhead.nativeMethods;

const MAX_TEXT_CONTENT_LENGTH = 10;

function truncateString (str: string, length: number, omission = '...'): string {
    if (str.length < length)
        return str;

    return str.substring(0, length - omission.length) + omission;
}

export default function stringifyElement (element: HTMLElement | null): string {
    if (!element)
        return '';

    const emptyElement = nativeMethods.cloneNode.call(element);
    const outerHtml    = htmlUtils.cleanUpHtml(nativeMethods.elementOuterHTMLGetter.call(emptyElement));
    const text         = truncateString(nativeMethods.nodeTextContentGetter.call(element), MAX_TEXT_CONTENT_LENGTH);
    const children     = nativeMethods.elementChildrenGetter.call(element);

    if (nativeMethods.htmlCollectionLengthGetter.call(children) > 0)
        return outerHtml.replace('></', '>...</');

    if (text)
        return outerHtml.replace('></', `>${text}</`);

    return outerHtml;
}
