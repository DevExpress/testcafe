import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import CursorBaseBehavior from './base-behavior';

var shadowUI       = hammerhead.shadowUI;
var browserUtils   = hammerhead.utils.browser;
var messageSandbox = hammerhead.eventSandbox.message;

var SETTINGS      = testCafeCore.SETTINGS;
var serviceUtils  = testCafeCore.serviceUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;


//Const
const CURSOR_CLASS = 'cursor';
const TOUCH_CLASS  = 'touch';

var CursorBehavior = function () {
    var cursorBehavior = this;

    eventUtils.bind(window, 'scroll', function () {
        var cursorPosition = cursorBehavior ? cursorBehavior.cursorPosition : null;

        if (cursorPosition)
            cursorBehavior.move({
                x: cursorPosition.x,
                y: cursorPosition.y
            });
    });

    this._initCursorIFrameBehavior();

    this.cursorElement = document.createElement('div');
    shadowUI.addClass(this.cursorElement, CURSOR_CLASS);

    shadowUI.getRoot().appendChild(this.cursorElement);
    this.hide();

    CursorBaseBehavior.call(this);
};

serviceUtils.inherit(CursorBehavior, CursorBaseBehavior);

function withCursorEmulation () {
    return !SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK;
}

CursorBehavior.prototype.start = function (position, iFrameInitiator) {
    var cursorBehavior = this;

    //NOTE: For IE in Cross domain iframe we can't use touch cursor because we won't be able to get element under cursor
    //for more information look at HACK in cursor_iframe_behavior
    if (browserUtils.isTouchDevice && !(browserUtils.isIE && iFrameInitiator)) {
        shadowUI.addClass(this.cursorElement, TOUCH_CLASS);

        //NOTE: in touch mode pointer should be in the center of the cursor
        this.pointerOffsetX = Math.ceil(styleUtils.getWidth(this.cursorElement) / 2);
        this.pointerOffsetY = Math.ceil(styleUtils.getHeight(this.cursorElement) / 2);
    }

    this.move(positionUtils.getFixedPosition(position, iFrameInitiator, true));

    if (withCursorEmulation())
        this.show();

    CursorBaseBehavior.prototype.start.call(this);

    window.setTimeout(function () {
        cursorBehavior.eventEmitter.emit(cursorBehavior.STARTED_EVENT, null);
    }, 0);
};

CursorBehavior.prototype._initCursorIFrameBehavior = function () {
    var cursor = this;

    function onMessage (e) {
        var message = e.message;

        switch (message.cmd) {
            case CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD:
                cursor.move(message.position, function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD }, e.source);
                }, e.source);
                break;

            case CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD:
                cursor.lMouseDown(function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD }, e.source);
                });
                break;

            case CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD:
                cursor.rMouseDown(function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD }, e.source);
                });
                break;

            case CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD:
                cursor.mouseUp(function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD }, e.source);
                });
                break;

            case CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD:
                cursor.hide(function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD }, e.source);
                });
                break;

            case CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD:
                cursor.show(function () {
                    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD }, e.source);
                });
                break;
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
};

CursorBehavior.prototype.getElementUnderCursor = function (x, y, currentDocument) {
    var isCursorVisible = styleUtils.get(this.cursorElement, 'visibility') !== 'hidden';

    if (isCursorVisible)
        this.hide();

    var element = positionUtils.getElementFromPoint(x, y, currentDocument);

    if (isCursorVisible)
        this.show();

    return element;
};

//NOTE: for testing purposes
CursorBehavior.prototype.getAbsolutePosition = function () {
    if (this.cursorElement) {
        var offset = positionUtils.getOffsetPosition(this.cursorElement);
        var x      = Math.round(offset.left) + this.pointerOffsetX;
        var y      = Math.round(offset.top) + this.pointerOffsetY;

        return { x: x, y: y };
    }

    return null;
};

export default CursorBehavior;
