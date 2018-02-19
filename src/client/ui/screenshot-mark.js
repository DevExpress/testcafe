import { shadowUI } from './deps/hammerhead';


export default {
    screenshotMark: null,

    _createMark () {
        this.screenshotMark = document.createElement('img');

        shadowUI.addClass(this.screenshotMark, 'screenshot-mark');

        this.screenshotMark.style.width = 5 / window.devicePixelRatio + 'px';
        this.screenshotMark.style.height = 1 / window.devicePixelRatio + 'px';

        this.hide();

        shadowUI.getRoot().appendChild(this.screenshotMark);
    },

    hide () {
        if (!this.screenshotMark)
            return;

        this.screenshotMark.style.visibility = 'hidden';

    },

    show (url) {
        if (!this.screenshotMark)
            this._createMark();

        this.screenshotMark.src = url;

        this.screenshotMark.style.visibility = '';
    }
};
