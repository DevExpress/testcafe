export default {
    notElementOrTextNode: (targetType: string) => `
        The ${targetType} is neither a DOM element nor a text node.
    `,
    elOutsideBounds: (target: string, targetType: string) => `
        The ${targetType} (${target}) is located outside the the layout viewport.
    `,
    elHasWidthOrHeightZero: (target: string, targetType: string, width: number, height: number) => `
        The ${targetType} (${target}) is too small to be visible: ${width}px x ${height}px.
    `,
    elHasDisplayNone: (target: string, targetType: string) => `
        The ${targetType} (${target}) is invisible. 
        The value of its 'display' property is 'none'.
    `,
    parentHasDisplayNone: (target: string, targetType: string, parent: string) => `
        The ${targetType} (${target}) is invisible. 
        It descends from an element that has the 'display: none' property (${parent}).
    `,
    elHasVisibilityHidden: (target: string, targetType: string) => `
        The ${targetType} (${target}) is invisible.
        The value of its 'visibility' property is 'hidden'.
    `,
    parentHasVisibilityHidden: (target: string, targetType: string, parent: string) => `
        The ${targetType} (${target}) is invisible.
        It descends from an element that has the 'visibility: hidden' property (${parent}).
    `,
    elHasVisibilityCollapse: (target: string, targetType: string) => `
        The ${targetType} (${target}) is invisible.
        The value of its 'visibility' property is 'collapse'.
    `,
    parentHasVisibilityCollapse: (target: string, targetType: string, parent: string) => `
        The ${targetType} (${target}) is invisible.
        It descends from an element that has the 'visibility: collapse' property (${parent}).
    `,
    elNotRendered: (target: string, targetType: string) => `
        The ${targetType} (${target}) has not been rendered.
    `,
    optionNotVisible: (target: string, targetType: string, parent: string) => `
        The ${targetType} (${target}) is invisible. 
        The parent element (${parent}) is collapsed, and its length is shorter than 2.
    `,
    mapContainerNotVisible: (target: string, containerHiddenReason: string) => `
        The action target (${target}) is invisible because ${containerHiddenReason}
    `,
};
