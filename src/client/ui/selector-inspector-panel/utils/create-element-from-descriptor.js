import hammerhead from '../../deps/hammerhead';

const shadowUI      = hammerhead.shadowUI;
const nativeMethods = hammerhead.nativeMethods;

export function createElementFromDescriptor (descriptor) {
    // eslint-disable-next-line no-restricted-properties
    const { tag = 'div', class: className, src, text, type, value } = descriptor;

    const element = document.createElement(tag);

    if (type)
        nativeMethods.setAttribute.call(element, 'type', type);

    if (value)
        nativeMethods.inputValueSetter.call(element, value);

    if (src)
        nativeMethods.setAttribute.call(element, 'src', src);

    if (className)
        shadowUI.addClass(element, className);

    if (text)
        nativeMethods.nodeTextContentSetter.call(element, text);

    return element;
}
