let lastHoveredElement = null;

export default {
    get () {
        return lastHoveredElement;
    },

    set (element) {
        lastHoveredElement = element;
    }
};
