import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import CursorBaseBehavior from './base-behavior';

var messageSandbox = hammerhead.messageSandbox;
var browserUtils   = hammerhead.utils.browser;

var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var serviceUtils          = testCafeCore.serviceUtils;
var positionUtils         = testCafeCore.positionUtils;


//NOTE: iFrameInitiator - only for organization of common interface
var CursorIFrameBehavior = function () {
    CursorBaseBehavior.call(this);
};

serviceUtils.inherit(CursorIFrameBehavior, CursorBaseBehavior);

CursorIFrameBehavior.prototype._bindMessageHandler = function (msg, callback) {
    function _onMessageHandler (e) {
        if (e.message && e.message.cmd === msg) {
            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, _onMessageHandler);

            if (callback)
                callback();
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, _onMessageHandler);
};

CursorIFrameBehavior.prototype.start = function (position) {
    //HACK: we can't get element under cursor in cross-domain iframe in IE without hide cursor.
    //Instead make 'getElement' method asynchronous, we set cursor to position by one pixel farther.
    const RECOGNITION_INCREMENT = browserUtils.isIE ? 1 : 0;

    var cursorBehavior = this,
        msg            = {
            cmd:      CROSS_DOMAIN_MESSAGES.CURSOR_START_REQUEST_CMD,
            position: {
                x: position.x + RECOGNITION_INCREMENT,
                y: position.y + RECOGNITION_INCREMENT
            }
        };

    this.cursorPosition = position;

    this._bindMessageHandler(CROSS_DOMAIN_MESSAGES.CURSOR_START_RESPONSE_CMD, function () {
        CursorBaseBehavior.prototype.start.call(cursorBehavior);
        cursorBehavior.eventEmitter.emit(cursorBehavior.STARTED_EVENT, null);
    });

    messageSandbox.sendServiceMsg(msg, window.top);
};

CursorIFrameBehavior.prototype.move = function (to, callback) {
    //HACK: we can't get element under cursor in cross-domain iframe in IE without hide cursor.
    //Instead make 'getElement' method asynchronous, we set cursor to position by one pixel farther.
    const RECOGNITION_INCREMENT = browserUtils.isIE ? 1 : 0;

    this.cursorPosition = to;

    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD, callback);

    var msg = {
        cmd:      CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD,
        position: {
            x: to.x + RECOGNITION_INCREMENT,
            y: to.y + RECOGNITION_INCREMENT
        }
    };

    messageSandbox.sendServiceMsg(msg, window.top);
};

CursorIFrameBehavior.prototype.lMouseDown = function (callback) {
    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD, callback);

    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD }, window.top);
};

CursorIFrameBehavior.prototype.rMouseDown = function (callback) {
    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD, callback);

    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD }, window.top);
};

CursorIFrameBehavior.prototype.mouseUp = function (callback) {
    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD, callback);

    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD }, window.top);
};

CursorIFrameBehavior.prototype.hide = function (callback) {
    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD, callback);

    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD }, window.top);
};

CursorIFrameBehavior.prototype.show = function (callback) {
    //NOTE: we need to wait for response message to call callback
    this._bindMessageHandler(CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD, callback);

    messageSandbox.sendServiceMsg({ cmd: CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD }, window.top);
};

CursorIFrameBehavior.prototype.getElementUnderCursor = function (x, y, currentDocument) {
    return positionUtils.getElementFromPoint(x, y, currentDocument);
};

export default CursorIFrameBehavior;
