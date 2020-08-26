import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import ProgressBar from './progress-bar';
import uiRoot from '../ui-root';

const shadowUI      = hammerhead.shadowUI;
const nativeMethods = hammerhead.nativeMethods;

const eventUtils = testCafeCore.eventUtils;
const styleUtils = testCafeCore.styleUtils;


const PANEL_CLASS   = 'progress-panel';
const TITLE_CLASS   = 'title';
const CONTENT_CLASS = 'content';

const UPDATE_INTERVAL           = 100;
const ANIMATION_UPDATE_INTERVAL = 10;
const OPENING_DELAY             = 300;
const SHOWING_DELAY             = 200;
const HIDING_DELAY              = 600;
const MIN_SHOWING_TIME          = 1000;


export default class ProgressPanel {
    constructor () {
        this.startTime         = null;
        this.openingTimeout    = null;
        this.updateInterval    = null;
        this.animationInterval = null;

        this.panelDiv = document.createElement('div');
        uiRoot.element().appendChild(this.panelDiv);

        this.titleDiv = document.createElement('div');
        this.panelDiv.appendChild(this.titleDiv);

        this.contentDiv = document.createElement('div');
        this.panelDiv.appendChild(this.contentDiv);

        shadowUI.addClass(this.panelDiv, PANEL_CLASS);
        shadowUI.addClass(this.titleDiv, TITLE_CLASS);
        shadowUI.addClass(this.contentDiv, CONTENT_CLASS);

        ProgressPanel._showAtWindowCenter(this.panelDiv);

        this.progressBar = new ProgressBar(this.contentDiv);

        this.disposePanel = () => ProgressPanel._showAtWindowCenter(this.panelDiv);
    }

    static _getInvisibleElementProperty (element, property) {
        const needShowElement = styleUtils.get(element, 'display') === 'none';

        if (needShowElement)
            styleUtils.set(element, 'display', 'block');

        const value = element[property];

        if (needShowElement)
            styleUtils.set(element, 'display', 'none');

        return value;
    }

    static _showAtWindowCenter (element) {
        const elementHeight = ProgressPanel._getInvisibleElementProperty(element, 'offsetHeight');
        const elementWidth  = ProgressPanel._getInvisibleElementProperty(element, 'offsetWidth');
        const top           = Math.round(styleUtils.getHeight(window) / 2 - elementHeight / 2);
        const left          = Math.round(styleUtils.getWidth(window) / 2 - elementWidth / 2);

        styleUtils.set(element, {
            left: left + 'px',
            top:  top + 'px'
        });
    }

    _setCurrentProgress () {
        const progress = Math.round((nativeMethods.dateNow() - this.startTime) / this.maxTimeout * 100);

        this.progressBar.setValue(progress);
    }

    _setSuccess (value) {
        this.progressBar.setSuccess(value);
    }

    _stopAnimation () {
        nativeMethods.clearInterval.call(window, this.animationInterval);
    }

    _animate (el, duration, show, complete) {
        const startTime         = nativeMethods.dateNow();
        const startOpacityValue = show ? 0 : 1;
        let passedTime        = 0;
        let progress          = 0;
        let delta             = 0;

        if (show) {
            styleUtils.set(el, 'opacity', startOpacityValue);
            styleUtils.set(el, 'display', 'block');
        }

        this._stopAnimation();

        this.animationInterval = nativeMethods.setInterval.call(window, () => {
            passedTime = nativeMethods.dateNow() - startTime;
            progress   = Math.min(passedTime / duration, 1);
            delta      = 0.5 - Math.cos(progress * Math.PI) / 2;

            styleUtils.set(el, 'opacity', startOpacityValue + (show ? delta : -delta));

            if (progress === 1) {
                this._stopAnimation();

                if (complete)
                    complete();
            }
        }, ANIMATION_UPDATE_INTERVAL);
    }

    _showPanel () {
        eventUtils.bind(window, 'resize', this.disposePanel);

        this._animate(this.panelDiv, SHOWING_DELAY, true);
    }

    _hidePanel (force) {
        this.startTime = null;

        eventUtils.unbind(window, 'resize', this.disposePanel);
        this._animate(this.panelDiv, force ? 0 : HIDING_DELAY, false, () => styleUtils.set(this.panelDiv, 'display', 'none'));
    }

    show (text, timeout) {
        this.startTime  = nativeMethods.dateNow();
        this.maxTimeout = timeout;

        nativeMethods.nodeTextContentSetter.call(this.titleDiv, text);
        this._setSuccess(false);

        this.openingTimeout = nativeMethods.setTimeout.call(window, () => {
            this.openingTimeout = null;

            this._setCurrentProgress();
            this._showPanel();

            this.updateInterval = nativeMethods.setInterval.call(window, () => this._setCurrentProgress(), UPDATE_INTERVAL);
        }, OPENING_DELAY);
    }

    close (success) {
        if (success)
            this._setSuccess(true);

        if (this.openingTimeout) {
            nativeMethods.clearTimeout.call(window, this.openingTimeout);
            this.openingTimeout = null;
        }

        if (this.updateInterval) {
            nativeMethods.clearInterval.call(window, this.updateInterval);
            this.updateInterval = null;
        }

        if (success) {
            if (this.startTime && nativeMethods.dateNow() - this.startTime < MIN_SHOWING_TIME) {
                nativeMethods.setTimeout.call(window, () => {
                    nativeMethods.setTimeout.call(window, () => this._hidePanel(false), SHOWING_DELAY);
                }, UPDATE_INTERVAL);
            }
            else
                nativeMethods.setTimeout.call(window, () => this._hidePanel(false), SHOWING_DELAY);
        }
        else
            this._hidePanel(true);
    }
}
