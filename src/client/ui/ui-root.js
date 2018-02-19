import { shadowUI } from './deps/hammerhead';


export default {
    uiRoot: null,

    element () {
        if (!this.uiRoot) {
            this.uiRoot = document.createElement('div');

            shadowUI.getRoot().appendChild(this.uiRoot);
        }

        return this.uiRoot;
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
        var shadowRoot = shadowUI.getRoot();

        shadowRoot.parentNode.removeChild(shadowRoot);
    }
};
