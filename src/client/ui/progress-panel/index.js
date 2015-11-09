import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import ProgressBar from './progress-bar';

var shadowUI   = hammerhead.shadowUI;
var eventUtils = testCafeCore.eventUtils;
var $          = testCafeCore.$;


const PANEL_CLASS   = 'progress-panel';
const TITLE_CLASS   = 'title';
const CONTENT_CLASS = 'content';

const UPDATE_INTERVAL  = 100;
const OPENING_DELAY    = 300;
const SHOWING_DELAY    = 200;
const HIDING_DELAY     = 600;
const MIN_SHOWING_TIME = 1000;


export default class ProgressPanel {
    constructor () {
        this.startTime      = null;
        this.openingTimeout = null;
        this.updateInterval = null;

        this.$panel   = $('<div></div>').appendTo($(shadowUI.getRoot()));
        this.$title   = $('<div></div>').appendTo(this.$panel);
        this.$content = $('<div></div>').appendTo(this.$panel);

        shadowUI.addClass(this.$panel[0], PANEL_CLASS);
        shadowUI.addClass(this.$title[0], TITLE_CLASS);
        shadowUI.addClass(this.$content[0], CONTENT_CLASS);

        ProgressPanel._showAtWindowCenter(this.$panel);

        this.progressBar = new ProgressBar(this.$content[0]);

        this.disposePanel = () => ProgressPanel._showAtWindowCenter(this.$panel);
    }

    static _showAtWindowCenter ($element) {
        var $window = $(window);

        var top  = Math.round($window.height() / 2 - ($element.outerHeight() / 2)),
            left = Math.round($window.width() / 2 - ($element.outerWidth() / 2));

        $element.css({
            top:  top,
            left: left
        });
    }

    _setCurrentProgress () {
        var progress = Math.round((Date.now() - this.startTime) / this.maxTimeout * 100);

        this.progressBar.setValue(progress);
    }

    _setSuccess (value) {
        this.progressBar.setSuccess(value);
    }

    _showPanel () {
        eventUtils.bind($(window), 'resize', this.disposePanel);

        this.$panel.fadeIn(SHOWING_DELAY);
    }

    _hidePanel (force) {
        this.startTime = null;

        eventUtils.unbind($(window), 'resize', this.disposePanel);

        this.$panel.fadeOut(force ? 0 : HIDING_DELAY, () => this.$panel.css('display', 'none'));
    }

    show (text, timeout) {
        this.startTime  = Date.now();
        this.maxTimeout = timeout;

        this.$title.text(text);
        this._setSuccess(false);

        this.openingTimeout = window.setTimeout(() => {
            this.openingTimeout = null;

            this._setCurrentProgress();
            this._showPanel();

            this.updateInterval = window.setInterval(() => this._setCurrentProgress(), UPDATE_INTERVAL);
        }, OPENING_DELAY);
    }

    close (success) {
        if (success)
            this._setSuccess(true);

        if (this.openingTimeout) {
            window.clearTimeout(this.openingTimeout);
            this.openingTimeout = null;
        }

        if (this.updateInterval) {
            window.clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        if (success) {
            if (this.startTime && Date.now() - this.startTime < MIN_SHOWING_TIME) {
                window.setTimeout(() => {
                    window.setTimeout(() => this._hidePanel(false), SHOWING_DELAY);
                }, UPDATE_INTERVAL);
            }
            else
                window.setTimeout(() => this._hidePanel(false), SHOWING_DELAY);
        }
        else
            this._hidePanel(true);
    }
}
