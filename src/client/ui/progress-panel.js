import * as hammerheadAPI from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import ProgressBar from './progress-bar';

var shadowUI   = hammerheadAPI.ShadowUI;
var eventUtils = testCafeCore.eventUtils;
var $          = testCafeCore.$;


const PANEL_CLASS   = 'progress-panel';
const TITLE_CLASS   = 'title';
const CONTENT_CLASS = 'content';

const UPDATE_INTERVAL  = 100;
const OPENING_DELAY    = 300;
const MIN_SHOWING_TIME = 1000;

//Util
function showAtWindowCenter ($element) {
    var $window = $(window);

    var top  = Math.round($window.height() / 2 - ($element.outerHeight() / 2)),
        left = Math.round($window.width() / 2 - ($element.outerWidth() / 2));

    $element.css({
        top:  top,
        left: left
    });
}


//ProgressPanel
var ProgressPanel = function (text, startValue) {
    this.text       = text;
    this.startValue = startValue;

    this.progressTimeout   = null;
    this.progressInterval  = null;
    this.progressStartTime = null;

    this.$panel = $('<div></div>').css('visibility', 'hidden').appendTo($(shadowUI.getRoot()));

    var panel    = this,
        $title   = $('<div></div>').text(this.text).appendTo(this.$panel),
        $content = $('<div></div>').appendTo(this.$panel);

    shadowUI.addClass(this.$panel[0], PANEL_CLASS);
    shadowUI.addClass($title[0], TITLE_CLASS);
    shadowUI.addClass($content[0], CONTENT_CLASS);

    this.progressBar = new ProgressBar($content, this.startValue);
    showAtWindowCenter(this.$panel);

    this.disposePanel = function () {
        panel._onWindowResize();
    };
    eventUtils.bind($(window), 'resize', this.disposePanel);

    this.$panel.css('display', 'none').css('visibility', '');
};

ProgressPanel.prototype._onWindowResize = function () {
    showAtWindowCenter(this.$panel);
};

ProgressPanel.prototype._setValue = function (value) {
    this.progressBar.setValue(value);
};

ProgressPanel.prototype._setSuccess = function (value) {
    this.progressBar.setSuccess(value);
};

//API
ProgressPanel.prototype.show = function (text, maxTimeout, callback) {
    var panel = this;

    this.progressStartTime = Date.now();

    function getProgress () {
        return Math.round((Date.now() - panel.progressStartTime) / maxTimeout * 100);
    }

    this.progressTimeout = window.setTimeout(function () {
        panel.$panel.fadeIn(200);
        panel.progressTimeout  = null;
        panel.progressInterval = window.setInterval(function () {
            panel._setValue(getProgress());
        }, UPDATE_INTERVAL);

        if (typeof callback === 'function')
            callback();
    }, OPENING_DELAY);
};

ProgressPanel.prototype.close = function (callback, success) {
    var panel = this;

    if (success)
        this._setSuccess(true);

    if (this.progressTimeout) {
        window.clearTimeout(this.progressTimeout);
        this.progressTimeout = null;
    }

    if (this.progressInterval) {
        window.clearInterval(this.progressInterval);
        this.progressInterval = null;
    }

    if (success &&
        (this.progressStartTime && Date.now() - this.progressStartTime < MIN_SHOWING_TIME)) {
        this.progressStartTime = null;

        window.setTimeout(function () {
            panel.close(callback, success);
        }, UPDATE_INTERVAL);

        return;
    }

    function close (force) {
        panel.progressStartTime = null;

        eventUtils.unbind($(window), 'resize', panel.disposePanel);

        panel.$panel.fadeOut(force ? 0 : 600, function () {
            panel.$panel.remove();
        });

        if (typeof callback === 'function')
            callback();
    }

    if (success)
        window.setTimeout(close, 200);
    else
        close(true);
};

export default ProgressPanel;
