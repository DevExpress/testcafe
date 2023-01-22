import { shadowUI, nativeMethods } from './deps/hammerhead';

const PANELS_CONTAINER_CLASS = 'panels-container';

export default {
    uiRoot:    null,
    container: null,

    element () {
        if (!this.uiRoot) {
            this.uiRoot = document.createElement('div');

            shadowUI.getRoot().appendChild(this.uiRoot);
        }

        return this.uiRoot;
    },

    panelsContainer () {
        if (!this.container) {
            this.container = document.createElement('div');

            shadowUI.addClass(this.container, PANELS_CONTAINER_CLASS);

            this.element().appendChild(this.container);
        }

        return this.container;
    },

    insertFirstChildToPanelsContainer (element) {
        const panelsContainer = this.panelsContainer();
        const firstChild      = nativeMethods.nodeFirstChildGetter.call(panelsContainer);

        panelsContainer.insertBefore(element, firstChild);
    },

    hide () {
        if (!this.uiRoot)
            return;

        this.uiRoot.style.visibility = 'hidden';
    },

    show () {
        if (!this.uiRoot)
            return;

        this.uiRoot.style.visibility = '';
    },

    remove () {
        const shadowRoot = shadowUI.getRoot();
        const parent     = nativeMethods.nodeParentNodeGetter.call(shadowRoot);

        parent.removeChild(shadowRoot);
    },
};
