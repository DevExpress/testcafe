import { shadowUI, nativeMethods } from './deps/hammerhead';


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
        const shadowRoot = shadowUI.getRoot();
        const parent     = nativeMethods.nodeParentNodeGetter.call(shadowRoot);

        parent.removeChild(shadowRoot);
    }
};
