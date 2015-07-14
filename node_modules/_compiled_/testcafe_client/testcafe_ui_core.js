(function () {
    window.initTestCafeUI = function (window) {
        var HammerheadClient = window.HammerheadClient,
            TestCafeClient = window.TestCafeClient,
            document = window.document;
TestCafeClient.define('UI', function (require, exports) {
    var ProgressPanel = require('UI.ProgressPanel');

    //Progress Panel
    var PROGRESS_PANEL_UPDATE_INTERVAL = 100,
        PROGRESS_PANEL_OPENING_DELAY = 300,
        PROGRESS_PANEL_MIN_SHOWING_TIME = 1000;

    var progressPanel = null,
        progressTimeout = null,
        progressInterval = null,
        progressStartTime = null;

    exports.showProgressPanel = function (text, maxTimeout, callback) {
        progressStartTime = Date.now();

        function getProgress() {
            return Math.round((Date.now() - progressStartTime) / maxTimeout * 100);
        }

        progressTimeout = window.setTimeout(function () {
            progressPanel = new ProgressPanel(text, getProgress());
            progressTimeout = null;
            progressInterval = window.setInterval(function () {
                progressPanel.setValue(getProgress());
            }, PROGRESS_PANEL_UPDATE_INTERVAL);

            if (typeof callback === 'function')
                callback();
        }, PROGRESS_PANEL_OPENING_DELAY);
    };

    exports.closeProgressPanel = function (callback, success) {
        if (progressPanel && success) {
            progressPanel.setSuccess(true);
        }

        if (progressTimeout) {
            window.clearTimeout(progressTimeout);
            progressTimeout = null;
        }

        if (progressInterval) {
            window.clearInterval(progressInterval);
            progressInterval = null;
        }

        if (success && (progressPanel && progressStartTime && Date.now() - progressStartTime < PROGRESS_PANEL_MIN_SHOWING_TIME)) {
            progressStartTime = null;

            window.setTimeout(function () {
                exports.closeProgressPanel(callback, success);
            }, PROGRESS_PANEL_UPDATE_INTERVAL);

            return;
        }

        function close(force) {
            progressPanel.close(force);
            progressPanel = null;

            if (typeof callback === 'function')
                callback();
        }

        if (progressPanel) {
            if (success)
                window.setTimeout(close, 200);
            else
                close(true);
        }

        progressStartTime = null;
    };
});
TestCafeClient.define('UI.Cursor', function (require, exports) {
    var Settings = require('Settings'),
        CursorBehavior = require('UI.Cursor.Behavior'),
        CursorIFrameBehavior = require('UI.Cursor.IFrameBehavior');

    //Global
    var cursorBehavior = null;

    exports.init = function () {
        if (!cursorBehavior)
            cursorBehavior = window.top !== window.self ? new CursorIFrameBehavior() : new CursorBehavior();
    };

    exports.ensureCursorPosition = function (position, withoutOffset, callback) {
        if (cursorBehavior.isStarted() && cursorBehavior.getPosition()) {
            callback();
            return;
        }

        var cursorPosition = {
            x: Math.max(0, position.x - (withoutOffset ? 0 : 50)),
            y: Math.max(0, position.y - (withoutOffset ? 0 : 50))
        };

        exports.start(cursorPosition, callback);
    };

    exports.setPosition = function (position) {
        if (!cursorBehavior.isStarted()) {
            exports.start(position, function () {
            });
        }
        else
            cursorBehavior.cursorPosition = position;
    };

    exports.start = function (position, callback, iFrameInitiator) {
        if (!cursorBehavior.isStarted()) {
            if (!Settings.RECORDING || Settings.PLAYBACK) {
                cursorBehavior.start(position, iFrameInitiator);

                cursorBehavior.on(cursorBehavior.STARTED_EVENT, callback);
            }
            else
                callback();
        }
        else {
            cursorBehavior.move(position, function () {
                window.setTimeout(callback, 0);
            }, iFrameInitiator);
        }
    };

    exports.move = function (to, callback) {
        cursorBehavior.move(to, callback);
    };

    exports.lMouseDown = function (callback) {
        cursorBehavior.lMouseDown(callback);
    };

    exports.rMouseDown = function (callback) {
        cursorBehavior.rMouseDown(callback);
    };

    exports.mouseUp = function (callback) {
        cursorBehavior.mouseUp(callback);
    };

    exports.hide = function (callback) {
        cursorBehavior.hide(callback);
    };

    exports.show = function (callback) {
        cursorBehavior.show(callback);
    };

    exports.getElementUnderCursor = function (x, y, currentDocument) {
        if (cursorBehavior)
            return cursorBehavior.getElementUnderCursor(x, y, currentDocument);
    };

    exports.getPosition = function () {
        if (cursorBehavior.getPosition)
            return cursorBehavior.getPosition();

        return null;
    };

    //NOTE: for testing purposes
    exports.getAbsolutePosition = function () {
        if (cursorBehavior.getAbsolutePosition)
            return cursorBehavior.getAbsolutePosition();

        return null;
    };
});
TestCafeClient.define('UI.Cursor.BaseBehavior', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var L_MOUSE_DOWN_CLASS = 'l-mouse-down',
        R_MOUSE_DOWN_CLASS = 'r-mouse-down',
        STATE_CLASSES = [L_MOUSE_DOWN_CLASS, R_MOUSE_DOWN_CLASS].join(' ');

    var CursorBaseBehavior = this.exports = function () {
        this.cursorPosition = null;
        this.pointerOffsetX = 0;
        this.pointerOffsetY = 0;
        this.eventEmitter = new Util.EventEmitter();

        this.started = false;
    };

    CursorBaseBehavior.prototype.start = function () {
        this.started = true;
    };

    CursorBaseBehavior.prototype.isStarted = function () {
        return this.started;
    };

    CursorBaseBehavior.prototype.on = function (event, handler) {
        this.eventEmitter.on(event, handler);
    };

    //Events
    CursorBaseBehavior.prototype.STARTED_EVENT = 'cursorStarted';

    //Messages
    CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD = 'cursorMoveRequest';
    CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD = 'cursorLMouseDownRequest';
    CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD = 'cursorRMouseDownRequest';
    CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD = 'cursorMouseUpRequest';
    CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD = 'cursorHideRequest';
    CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD = 'cursorShowRequest';

    CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD = 'cursorMoveResponse';
    CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD = 'cursorLMouseDownResponse';
    CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD = 'cursorRMouseDownResponse';
    CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD = 'cursorMouseUpResponse';
    CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD = 'cursorHideResponse';
    CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD = 'cursorShowResponse';

    CursorBaseBehavior.prototype.move = function (to, callback, iFrameInitiator) {
        this.cursorPosition = Util.getFixedPosition(to, iFrameInitiator, true);

        if (this.$cursor) {
            this.$cursor.css({
                left: this.cursorPosition.x + $(document).scrollLeft() - this.pointerOffsetX + 'px',
                top: this.cursorPosition.y + $(document).scrollTop() - this.pointerOffsetY + 'px'
            });
        }

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.lMouseDown = function (callback) {
        if (this.$cursor) {
            ShadowUI.removeClass(this.$cursor, STATE_CLASSES);
            ShadowUI.addClass(this.$cursor, L_MOUSE_DOWN_CLASS);
        }

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.rMouseDown = function (callback) {
        if (this.$cursor) {
            ShadowUI.removeClass(this.$cursor, STATE_CLASSES);
            ShadowUI.addClass(this.$cursor, R_MOUSE_DOWN_CLASS);
        }

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.mouseUp = function (callback) {
        if (this.$cursor)
            ShadowUI.removeClass(this.$cursor, STATE_CLASSES);

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.hide = function (callback) {
        if (this.$cursor)
            this.$cursor.css({ visibility: 'hidden' });

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.show = function (callback) {
        if (this.$cursor)
            this.$cursor.css({ visibility: '' });

        if (callback)
            callback();
    };

    CursorBaseBehavior.prototype.getPosition = function () {
        return this.cursorPosition;
    };
});
TestCafeClient.define('UI.Cursor.Behavior', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        MessageSandbox = Hammerhead.MessageSandbox,

        Settings = require('Settings'),
        CursorBaseBehavior = require('UI.Cursor.BaseBehavior');

    //Const
    var CURSOR_CLASS = 'cursor',
        TOUCH_CLASS = 'touch';

    var CursorBehavior = this.exports = function () {
        var cursorBehavior = this;

        $(window).scroll(function () {
            var cursorPosition = cursorBehavior ? cursorBehavior.cursorPosition : null;

            if (cursorPosition)
                cursorBehavior.move({
                    x: cursorPosition.x,
                    y: cursorPosition.y
                });
        });

        this._initCursorIFrameBehavior();

        this.$cursor = $('<div></div>');
        ShadowUI.addClass(this.$cursor, CURSOR_CLASS);

        this.$cursor.appendTo(ShadowUI.getRoot());
        this.hide();

        CursorBaseBehavior.call(this);
    };

    Util.inherit(CursorBehavior, CursorBaseBehavior);

    function withCursorEmulation() {
        return !Settings.RECORDING || Settings.PLAYBACK;
    }

    CursorBehavior.prototype.start = function (position, iFrameInitiator) {
        var cursorBehavior = this;

        //NOTE: For IE in Cross domain iframe we can't use touch cursor because we won't be able to get element under cursor
        //for more information look at HACK in cursor_iframe_behavior
        if (Util.isTouchDevice && !(Util.isIE && iFrameInitiator)) {
            ShadowUI.addClass(this.$cursor, TOUCH_CLASS);

            //NOTE: in touch mode pointer should be in the center of the cursor
            this.pointerOffsetX = Math.ceil(this.$cursor.width() / 2);
            this.pointerOffsetY = Math.ceil(this.$cursor.height() / 2);
        }

        this.move(Util.getFixedPosition(position, iFrameInitiator, true));

        if (withCursorEmulation())
            this.show();

        CursorBaseBehavior.prototype.start.call(this);

        window.setTimeout(function () {
            cursorBehavior.eventEmitter.emit(cursorBehavior.STARTED_EVENT, null);
        }, 0);
    };

    CursorBehavior.prototype._initCursorIFrameBehavior = function () {
        var cursor = this;

        function onMessage(e) {
            var message = e.message;

            switch (message.cmd) {
                case CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD:
                    cursor.move(message.position, function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD}, e.source);
                    }, e.source);
                    break;

                case CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD:
                    cursor.lMouseDown(function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD}, e.source);
                    });
                    break;

                case CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD:
                    cursor.rMouseDown(function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD}, e.source);
                    });
                    break;

                case CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD:
                    cursor.mouseUp(function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD}, e.source);
                    });
                    break;

                case CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD:
                    cursor.hide(function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD}, e.source);
                    });
                    break;

                case CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD:
                    cursor.show(function () {
                        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD}, e.source);
                    });
                    break;
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
    };

    CursorBehavior.prototype.getElementUnderCursor = function (x, y, currentDocument) {
        var isCursorVisible = this.$cursor.css('visibility') !== 'hidden';

        if (isCursorVisible)
            this.hide();

        var element = Util.getElementFromPoint(x, y, currentDocument);

        if (isCursorVisible)
            this.show();

        return element;
    };

    //NOTE: for testing purposes
    CursorBehavior.prototype.getAbsolutePosition = function () {
        if (this.$cursor) {
            var offset = Util.getOffsetPosition(this.$cursor[0]),
                x = Math.round(offset.left) + this.pointerOffsetX,
                y = Math.round(offset.top) + this.pointerOffsetY;

            return { x: x, y: y };
        }

        return null;
    };
});
TestCafeClient.define('UI.Cursor.IFrameBehavior', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,

        CursorBaseBehavior = require('UI.Cursor.BaseBehavior'),
        CrossDomainMessages = require('Base.CrossDomainMessages');

    //HACK: we can't get element under cursor in cross-domain iframe in IE without hide cursor.
    //Instead make 'getElement' method asynchronous, we set cursor to position by one pixel farther.
    var RECOGNITION_INCREMENT = Util.isIE ? 1 : 0;

    //NOTE: iFrameInitiator - only for organization of common interface
    var CursorIFrameBehavior = this.exports = function () {
        CursorBaseBehavior.call(this);
    };

    Util.inherit(CursorIFrameBehavior, CursorBaseBehavior);

    CursorIFrameBehavior.prototype._bindMessageHandler = function (msg, callback) {
        function _onMessageHandler(e) {
            if (e.message && e.message.cmd === msg) {
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, _onMessageHandler);

                if (callback)
                    callback();
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, _onMessageHandler);
    };

    CursorIFrameBehavior.prototype.start = function (position) {
        var cursorBehavior = this,
            msg = {
                cmd: CrossDomainMessages.CURSOR_START_REQUEST_CMD,
                position: {
                    x: position.x + RECOGNITION_INCREMENT,
                    y: position.y + RECOGNITION_INCREMENT
                }
            };

        this.cursorPosition = position;

        this._bindMessageHandler(CrossDomainMessages.CURSOR_START_RESPONSE_CMD, function () {
            CursorBaseBehavior.prototype.start.call(cursorBehavior);
            cursorBehavior.eventEmitter.emit(cursorBehavior.STARTED_EVENT, null);
        });

        MessageSandbox.sendServiceMsg(msg, window.top);
    };

    CursorIFrameBehavior.prototype.move = function (to, callback) {
        this.cursorPosition = to;

        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD, callback);

        var msg = {
            cmd: CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD,
            position: {
                x: to.x + RECOGNITION_INCREMENT,
                y: to.y + RECOGNITION_INCREMENT
            }
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
    };

    CursorIFrameBehavior.prototype.lMouseDown = function (callback) {
        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD, callback);

        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD}, window.top);
    };

    CursorIFrameBehavior.prototype.rMouseDown = function (callback) {
        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD, callback);

        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD}, window.top);
    };

    CursorIFrameBehavior.prototype.mouseUp = function (callback) {
        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD, callback);

        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD}, window.top);
    };

    CursorIFrameBehavior.prototype.hide = function (callback) {
        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD, callback);

        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD}, window.top);
    };

    CursorIFrameBehavior.prototype.show = function (callback) {
        //NOTE: we need to wait for response message to call callback
        this._bindMessageHandler(CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD, callback);

        MessageSandbox.sendServiceMsg({cmd: CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD}, window.top);
    };

    CursorIFrameBehavior.prototype.getElementUnderCursor = function (x, y, currentDocument) {
        return Util.getElementFromPoint(x, y, currentDocument);
    };
});
TestCafeClient.define('UI.ModalBackground', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var LOADING_TEXT = 'Loading page...',
        BACKGROUND_CLASS = 'modal-background',
        LOADING_TEXT_CLASS = 'loading-text',
        BACKGROUND_OPACITY = 0.7,
        BACKGROUND_OPACITY_WITH_LOADING_TEXT = 0.8,

        LOADING_ICON_CLASS = 'loading-icon';

    //Globals
    var $window = $(window),
        $backgroundDiv = null,
        $loadingText = null,
        $loadingIcon = null,
        initialized = false;

    //Markup
    function createBackground() {
        var $root = ShadowUI.getRoot();

        $backgroundDiv = $('<div></div>').appendTo($root);
        ShadowUI.addClass($backgroundDiv, BACKGROUND_CLASS);

        $loadingText = $('<div></div>')
            .appendTo($root)
            .text(LOADING_TEXT);

        ShadowUI.addClass($loadingText, LOADING_TEXT_CLASS);

        $loadingIcon = $('<div></div>').css('visibility', 'hidden').appendTo($root);
        ShadowUI.addClass($loadingIcon, LOADING_ICON_CLASS);
    }

    //Behavior
    function adjustLoadingTextPos() {
        var wHeight = $window.height(),
            wWidth = $window.width();

        var loadingTextVisible = $loadingText.is(':visible');

        if (!loadingTextVisible) {
            $loadingText.attr('visibility', 'hidden');
            $loadingText.show();
        }

        $loadingText.css({
            left: Math.max((wWidth - $loadingText.width()) / 2, 0),
            top: Math.max((wHeight - $loadingText.height()) / 2, 0)
        });

        if (!loadingTextVisible) {
            $loadingText.hide();
            $loadingText.attr('visibility', '');
        }
    }

    function initSizeAdjustments() {
        var adjust = function () {
            var wHeight = $window.height(),
                wWidth = $window.width();

            $backgroundDiv.width(wWidth);
            $backgroundDiv.height(wHeight);

            $loadingIcon.css('top', Math.round((wHeight - $loadingIcon.height()) / 2));
            $loadingIcon.css('left', Math.round((wWidth - $loadingIcon.width()) / 2));
        };

        adjust();

        $window.resize(adjust);
    }

    function init() {
        createBackground();
        initSizeAdjustments();
        adjustLoadingTextPos();

        initialized = true;
    }

    exports.initAndShowLoadingText = function () {
        var shown = false;

        //NOTE: init and show modal background as soon as possible
        var initAndShow = function () {
            init();

            $backgroundDiv.css({opacity: BACKGROUND_OPACITY_WITH_LOADING_TEXT });
            $backgroundDiv.show();
            $loadingText.show();

            shown = true;
        };

        var tryShowBeforeReady = function () {
            if (!shown) {
                if (document.body)
                    initAndShow();
                else
                    window.setTimeout(tryShowBeforeReady, 0);
            }
        };

        tryShowBeforeReady();

        //NOTE: ensure that background was shown on ready
        $(document).ready(function () {
            if (!shown)
                initAndShow();
        });
    };

    exports.show = function (transparent) {
        if (!initialized)
            init();

        $backgroundDiv.css({opacity: transparent ? 0 : BACKGROUND_OPACITY});
        $backgroundDiv.show();
    };

    exports.hide = function () {
        if (!initialized)
            return;

        $loadingText.hide();
        $backgroundDiv.hide();
    };

    exports.showLoadingIcon = function () {
        $loadingIcon.css('visibility', 'visible');
    };

    exports.hideLoadingIcon = function () {
        $loadingIcon.css('visibility', 'hidden');
    };
});
TestCafeClient.define('UI.ProgressBar', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),

        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI;

    var CONTAINER_CLASS = 'progress-bar',
        VALUE_CLASS = 'value',
        SUCCESS_CLASS = 'success';

    var ProgressBar = this.exports = function ($container, startValue) {
        this.$container = $('<div></div>').appendTo($container);
        this.$value = $('<div></div>').appendTo(this.$container);

        ShadowUI.addClass(this.$container, CONTAINER_CLASS);
        ShadowUI.addClass(this.$value, VALUE_CLASS);

        this.setValue(startValue);
    };

    ProgressBar.prototype.setValue = function (value) {
        if (typeof value !== 'number' || value < 0)
            value = 0;
        else if (value > 100)
            value = 100;

        this.$value.css('width', value + '%');
    };

    ProgressBar.prototype.setSuccess = function (value) {
        if (value)
            ShadowUI.addClass(this.$container, SUCCESS_CLASS);
        else
            ShadowUI.removeClass(this.$container, SUCCESS_CLASS);
    };
});
TestCafeClient.define('UI.ProgressPanel', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),

        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI,
        ProgressBar = require('UI.ProgressBar');

    var PANEL_CLASS = 'progress-panel',
        TITLE_CLASS = 'title',
        CONTENT_CLASS = 'content';

    //Util
    var $window = $(window);

    function showAtWindowCenter($element) {
        var top = Math.round($window.height() / 2 - ($element.outerHeight() / 2)),
            left = Math.round($window.width() / 2 - ($element.outerWidth() / 2));

        $element.css({
            top: top,
            left: left
        });
    }

    //ProgressPanel
    var ProgressPanel = this.exports = function (text, startValue) {
        this.$panel = $('<div></div>').css('visibility', 'hidden').appendTo(ShadowUI.getRoot());

        var panel = this,
            $title = $('<div></div>').text(text).appendTo(this.$panel),
            $content = $('<div></div>').appendTo(this.$panel);

        ShadowUI.addClass(this.$panel, PANEL_CLASS);
        ShadowUI.addClass($title, TITLE_CLASS);
        ShadowUI.addClass($content, CONTENT_CLASS);

        this.progressBar = new ProgressBar($content, startValue);
        showAtWindowCenter(this.$panel);

        this.disposePanel = function () {
            panel._onWindowResize();
        };
        ShadowUI.bind($window, 'resize', this.disposePanel);

        this.$panel.css('display', 'none').css('visibility', '');
        this.$panel.fadeIn(200);
    };

    ProgressPanel.prototype._onWindowResize = function () {
        showAtWindowCenter(this.$panel);
    };

    //API
    ProgressPanel.prototype.setValue = function (value) {
        this.progressBar.setValue(value);
    };

    ProgressPanel.prototype.close = function (force) {
        var panel = this;

        ShadowUI.unbind($window, 'resize', this.disposePanel);

        this.$panel.fadeOut(force ? 0 : 600, function () {
            panel.$panel.remove();
        });
    };

    ProgressPanel.prototype.setSuccess = function (value) {
        this.progressBar.setSuccess(value);
    };
});
TestCafeClient.define('UI.SelectElement', function (require, exports) {
    //NOTE: we can't manipulate (open/close option list) with a native select element during test running, so we
    // draw our custom option list to emulate this.
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        EventSimulator = Hammerhead.EventSimulator;

    var OPTION_LIST_CLASS = 'tcOptionList',
        OPTION_GROUP_CLASS = 'tcOptionGroup',
        OPTION_CLASS = 'tcOption',
        DISABLED_CLASS = 'disabled';

    var $curSelectEl = null,
        $optionList = null,
        $groups = null,
        $options = null;

    function onDocumentMouseDown(e) {
        //NOTE: only in Mozilla 'mousedown' raises for option
        if ((e.target || e.srcElement) !== $curSelectEl[0] && !$curSelectEl.has(e.target).length && !$optionList.has(e.target).length)
            exports.collapseOptionList();
    }

    function createOption(option, $parent) {
        var $option = $('<div></div>')
                .text(option.text)
                .appendTo($parent),
            isOptionDisabled = option.disabled || (option.parentElement.tagName.toLowerCase() === 'optgroup' && option.parentElement.disabled);

        ShadowUI.addClass($option, OPTION_CLASS);

        if (isOptionDisabled) {
            ShadowUI.addClass($option, DISABLED_CLASS);
            $option.css('color', $(option).css('color'));
        }

        if (isOptionDisabled && $.browser.webkit) {
            $option.click(function () {
                return false;
            });
        }
        else {
            $option.click(function () {
                var curSelectEl = $curSelectEl[0],
                    curSelectIndex = curSelectEl.selectedIndex,
                    optionIndex = $.inArray(this, $options),
                    option = $(curSelectEl).find('option')[optionIndex],
                    clickLeadChanges = !isOptionDisabled && optionIndex !== curSelectIndex;

                if (clickLeadChanges && !Util.isIE)
                    curSelectEl.selectedIndex = optionIndex;

                if (!Util.isMozilla && !Util.isIE && clickLeadChanges)
                    EventSimulator.change(curSelectEl);

                if (Util.isMozilla || Util.isIE)
                    EventSimulator.mousedown(Util.isMozilla ? option : curSelectEl);
                EventSimulator.mouseup(Util.isMozilla ? option : curSelectEl);

                if ((Util.isMozilla || Util.isIE) && clickLeadChanges) {
                    EventSimulator.change(curSelectEl);

                    if (Util.isIE)
                        curSelectEl.selectedIndex = optionIndex;
                }

                EventSimulator.click(Util.isMozilla || Util.isIE ? option : curSelectEl);

                if (!isOptionDisabled)
                    exports.collapseOptionList();
            });
        }

        $options = !$options || !$options.length ? $option : $options.add($option);
    }

    function createGroup(group, $parent) {
        var $group = $('<div></div>')
            .text(group.label || ' ')
            .appendTo($parent);

        ShadowUI.addClass($group, OPTION_GROUP_CLASS);

        if (group.disabled) {
            ShadowUI.addClass($group, DISABLED_CLASS);

            $group.css('color', $(group).css('color'));
        }

        createChildren($(group).children(), $group);

        $groups = !$groups || !$groups.length ? $group : $groups.add($group);
    }

    function createChildren($children, $parent) {
        $.each($children, function (index, item) {
            if (item.tagName.toLowerCase() === 'option')
                createOption(item, $parent);
            else if (item.tagName.toLowerCase() === 'optgroup')
                createGroup(item, $parent);
        });
    }

    exports.expandOptionList = function (select) {
        var $select = $(select),
            $selectChildren = $(select).children();

        if (!$selectChildren.length)
            return;

        //NOTE: check is option list expanded
        if ($curSelectEl) {
            var isSelectExpanded = $select[0] === $curSelectEl[0];

            exports.collapseOptionList();

            if (isSelectExpanded)
                return;
        }

        $curSelectEl = $select;

        $optionList = $('<div></div>').appendTo(ShadowUI.getRoot());
        ShadowUI.addClass($optionList, OPTION_LIST_CLASS);

        createChildren($selectChildren, $optionList);

        window.setTimeout(function () {
            $(document).bind('mousedown', onDocumentMouseDown);
        }, 0);

        $optionList.css({
            position: 'absolute',
            fontSize: $curSelectEl.css('fontSize'),
            fontFamily: $curSelectEl.css('fontFamily'),
            minWidth: $curSelectEl.width(),
            left: Util.getOffsetPosition($curSelectEl[0]).left,
            height: Util.getSelectVisibleChildren($select).length > Util.MAX_OPTION_LIST_LENGTH ? Util.getOptionHeight($(select)) * Util.MAX_OPTION_LIST_LENGTH : ''
        });

        var $window = $(window),
            selectTopPosition = Util.getOffsetPosition($curSelectEl[0]).top,
            optionListHeight = $optionList.height(),
            optionListTopPosition = selectTopPosition + $curSelectEl.height() + 2;

        if (optionListTopPosition + optionListHeight > $window.scrollTop() + $window.height()) {
            var topPositionAboveSelect = selectTopPosition - 3 - optionListHeight;

            if (topPositionAboveSelect >= $window.scrollTop())
                optionListTopPosition = topPositionAboveSelect;
        }

        $optionList.css('top', optionListTopPosition);
    };

    exports.collapseOptionList = function () {
        $optionList.remove();
        $(document).unbind('mousedown', onDocumentMouseDown);

        $optionList = null;
        $curSelectEl = null;
        $options = null;
        $groups = null;
    };

    exports.isOptionListExpanded = function ($select) {
        return $select ? $select.is($curSelectEl) : !!$curSelectEl;
    };

    exports.getEmulatedChildElement = function (elementIndex, isGroup) {
        if (!isGroup)
            return $options[elementIndex];

        return $groups[elementIndex];
    };

    exports.scrollOptionListByChild = function (child) {
        var select = Util.getSelectParent($(child));

        if (!select)
            return;

        var $select = $(select),
            realSizeValue = Util.getSelectElementSize($select),
            optionHeight = Util.getOptionHeight($select),
            scrollIndent = 0,

            topVisibleIndex = Math.max($select.scrollTop() / optionHeight, 0),
            bottomVisibleIndex = topVisibleIndex + realSizeValue - 1,

            childIndex = Util.getChildVisibleIndex($select, child);

        if (childIndex < topVisibleIndex) {
            scrollIndent = optionHeight * (topVisibleIndex - childIndex);
            $select.scrollTop(Math.max($select.scrollTop() - scrollIndent, 0));
        }
        else if (childIndex > bottomVisibleIndex) {
            scrollIndent = optionHeight * (childIndex - bottomVisibleIndex);
            $select.scrollTop($select.scrollTop() + scrollIndent);
        }
    };

    exports.getSelectChildCenter = function (child) {
        var select = Util.getSelectParent($(child));

        if (!select) {
            return {
                x: 0,
                y: 0
            };
        }

        var optionHeight = Util.getOptionHeight($(select)),
            childRectangle = Util.getElementRectangle(child);

        return {
            x: Math.round(childRectangle.left + childRectangle.width / 2),
            y: Math.round(childRectangle.top + optionHeight / 2)
        };
    };

    exports.switchOptionsByKeys = function (command) {
        var $select = $(Util.getActiveElement());

        if ($select[0].tagName.toLowerCase() !== 'select')
            return;

        if (/enter|tab|esc/.test(command))
            exports.collapseOptionList();

        if (/down|up/.test(command) ||
            (!Util.isIE && (Util.getSelectElementSize($select) <= 1 || Util.isMozilla) && (!ShadowUI.select('.' + OPTION_LIST_CLASS).is(':visible') || Util.isMozilla) && /left|right/.test(command))) {

            var $options = $select.find('option'),
                $enabledOptions = $options.filter(function () {
                    var parent = $(this).parent()[0];
                    return !this.disabled && !(parent.tagName.toLowerCase() === 'optgroup' && parent.disabled);
                }),
                nextIndex = $.inArray($select.find('option:selected')[0], $enabledOptions);

            nextIndex += /down|right/.test(command) ? 1 : -1;

            if (nextIndex >= 0 && nextIndex < $enabledOptions.length) {
                $select[0].selectedIndex = $.inArray($enabledOptions[nextIndex], $options);
                EventSimulator.change($select[0]);
            }
        }
    };
});
    };

    window.initTestCafeUI(window);
})();