let lastHoveredElement: Element | null = null;

export default {
    get () {
        return lastHoveredElement;
    },

    set (element: Element) {
        lastHoveredElement = element;
    },
};
