export default {
    getSentenceSubject: (isRecursive: boolean): string => {
        return isRecursive ? 'container' : 'action target';
    },
    chainMessage: (originalInput:string) => {
        originalInput = originalInput.trimStart();
        return originalInput.replace(/The/, 'its') || '';
    },
    notElementOrTextNode: (target: string) => `
    The action target (${target}) is neither a DOM element nor a text node.
  `,
    elOutsideBounds: (target: string) => `
    The action target (${target}) is located outside the the layout viewport.
  `,
    elHasWidthOrHeightZero: (target: string, width: number, height: number, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is too small to be visible: ${width}px x ${height}px
  `,
    elHasDisplayNone: (target: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible. 
    The value of its 'display' property is 'none'.
  `,
    parentHasDisplayNone: (target: string, parent: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible. 
    It descends from an element that has the 'display: none' property (${parent}).
  `,
    elHasVisibilityHidden: (target: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible.
    The value of its 'visibility' property is 'hidden'.
  `,
    parentHasVisibilityHidden: (target: string, parent: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible.
    It descends from an element that has the 'visibility: hidden' property ('${parent}').
  `,
    elHasVisibilityCollapse: (target: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible.
    The value of its 'visibility' property is 'collapse'.
  `,
    parentHasVisibilityCollapse: (target: string, parent: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible.
    It descends from an element that has the 'visibility: collapse' property ('${parent}).
  `,
    elNotRendered: (target: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) has not been rendered.
  `,
    optionNotVisible: (target: string, parent: string, sentenceSubject: string) => `
    The ${sentenceSubject} (${target}) is invisible. 
    The parent element (${parent}) is collapsed, and its length is shorter than 2.
  `,
    mapContainerNotVisible: (target: string, containerHiddenReason: string) => {
        return `
            The action target (${target}) is invisible because ${containerHiddenReason}
        `;
    },
};
