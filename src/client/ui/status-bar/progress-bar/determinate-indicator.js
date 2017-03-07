import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

var shadowUI      = hammerhead.shadowUI;
var nativeMethods = hammerhead.nativeMethods;
var styleUtils    = testCafeCore.styleUtils;


const DETERMINATE_STYLE_CLASS   = 'determinate';
const ANIMATION_UPDATE_INTERVAL = 10;


export default class DeterminateIndicator {
    constructor (progressBar, firstValue) {
        this.progressBar       = progressBar;
        this.firstValueElement = firstValue;

        this.maxTimeout        = null;
        this.startTime         = null;
        this.animationInterval = null;
    }

    _setCurrentProgress () {
        var progress         = (Date.now() - this.startTime) / this.maxTimeout;
        var percent          = Math.min(Math.max(progress, 0), 1);
        var progressBarWidth = styleUtils.getWidth(this.progressBar);
        var newWidth         = Math.round(progressBarWidth * percent);

        styleUtils.set(this.firstValueElement, 'width', newWidth + 'px');
    }

    start (maxTimeout, startTime) {
        shadowUI.addClass(this.progressBar, DETERMINATE_STYLE_CLASS);

        this.maxTimeout = maxTimeout;
        this.startTime  = startTime || Date.now();

        this._setCurrentProgress();

        this.animationInterval = nativeMethods.setInterval.call(window, () => this._setCurrentProgress(), ANIMATION_UPDATE_INTERVAL);
    }

    stop () {
        if (this.animationInterval) {
            nativeMethods.clearInterval.call(window, this.animationInterval);
            this.animationInterval = null;
        }
    }

    reset () {
        styleUtils.set(this.firstValueElement, 'width', 0);
        shadowUI.removeClass(this.progressBar, DETERMINATE_STYLE_CLASS);
    }
}
