export default {
    undefined: () => `
        Element is undefined.
    `,
    notElementOrTextNode: () => `
        Element is not dom element or text node.
    `,
    elOutsideBounds: (target: string) => `
        The element:
        '${target}'
        is outside the visible bounds of the document.
    `,
    elHasWidthOrHeightZero: (target: string, width: number, height: number) => `
        The element:
        '${target}'
        is not visible because it has an effective width and height of: '${width} x ${height}' pixels.
    `,
    elHasDisplayNone: (target: string) => `
        The element:
        '${target}'
        is not visible because it has CSS property: 'display: none'
    `,
    parentHasDisplayNone: (target: string, parent: string) => `
        The element:
        '${target}'
        is not visible because its parent:
        '${parent}'
        has CSS property: 'display: none'
    `,
    elHasVisibilityHidden: (target: string) => `
        The element:
        '${target}'
        is not visible because it has CSS property: 'visibility: hidden'
    `,
    parentHasVisibilityHidden: (target: string, parent: string) => `
        The element:
        '${target}'
        is not visible because its parent:
        '${parent}'
        has CSS property: 'visibility: hidden'
    `,
    elNotRendered: (target: string) => `
        The element:
        '${target}'
        is not visible because it is not rendered'
    `,
    optionNotVisible: (target: string, parent: string) => `
        The option:
        '${target}'
        is not visible because its parent:
        '${parent}'
        is not expended and has size less than 2.
    `,
};
