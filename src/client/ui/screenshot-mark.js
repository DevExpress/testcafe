import { shadowUI, nativeMethods } from './deps/hammerhead';
import { MARK_LENGTH, MARK_HEIGHT, MARK_RIGHT_MARGIN } from '../../screenshots/constants';


export default {
    screenshotMark: null,

    _createMark () {
        this.screenshotMark = document.createElement('img');

        shadowUI.addClass(this.screenshotMark, 'screenshot-mark');

        this.screenshotMark.style.right  = MARK_RIGHT_MARGIN / window.devicePixelRatio + 'px';
        this.screenshotMark.style.width  = MARK_LENGTH / window.devicePixelRatio + 'px';
        this.screenshotMark.style.height = MARK_HEIGHT / window.devicePixelRatio + 'px';

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

        nativeMethods.imageSrcSetter.call(this.screenshotMark, url);

        this.screenshotMark.style.visibility = '';
    }
};
