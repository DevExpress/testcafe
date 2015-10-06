import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';

var shadowUI = hammerhead.shadowUI;

var $             = testCafeCore.$;
var serviceUtils  = testCafeCore.serviceUtils;
var positionUtils = testCafeCore.positionUtils;


//Const
const L_MOUSE_DOWN_CLASS = 'l-mouse-down';
const R_MOUSE_DOWN_CLASS = 'r-mouse-down';
const STATE_CLASSES      = [L_MOUSE_DOWN_CLASS, R_MOUSE_DOWN_CLASS].join(' ');


var CursorBaseBehavior = function () {
    this.cursorPosition = null;
    this.pointerOffsetX = 0;
    this.pointerOffsetY = 0;
    this.eventEmitter   = new serviceUtils.EventEmitter();

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
CursorBaseBehavior.CURSOR_MOVE_REQUEST_CMD       = 'cursorMoveRequest';
CursorBaseBehavior.CURSOR_LMOUSEDOWN_REQUEST_CMD = 'cursorLMouseDownRequest';
CursorBaseBehavior.CURSOR_RMOUSEDOWN_REQUEST_CMD = 'cursorRMouseDownRequest';
CursorBaseBehavior.CURSOR_MOUSEUP_REQUEST_CMD    = 'cursorMouseUpRequest';
CursorBaseBehavior.CURSOR_HIDE_REQUEST_CMD       = 'cursorHideRequest';
CursorBaseBehavior.CURSOR_SHOW_REQUEST_CMD       = 'cursorShowRequest';

CursorBaseBehavior.CURSOR_MOVE_RESPONSE_CMD       = 'cursorMoveResponse';
CursorBaseBehavior.CURSOR_LMOUSEDOWN_RESPONSE_CMD = 'cursorLMouseDownResponse';
CursorBaseBehavior.CURSOR_RMOUSEDOWN_RESPONSE_CMD = 'cursorRMouseDownResponse';
CursorBaseBehavior.CURSOR_MOUSEUP_RESPONSE_CMD    = 'cursorMouseUpResponse';
CursorBaseBehavior.CURSOR_HIDE_RESPONSE_CMD       = 'cursorHideResponse';
CursorBaseBehavior.CURSOR_SHOW_RESPONSE_CMD       = 'cursorShowResponse';

CursorBaseBehavior.prototype.move = function (to, callback, iFrameInitiator) {
    this.cursorPosition = positionUtils.getFixedPosition(to, iFrameInitiator, true);

    if (this.$cursor) {
        this.$cursor.css({
            left: this.cursorPosition.x + $(document).scrollLeft() - this.pointerOffsetX + 'px',
            top:  this.cursorPosition.y + $(document).scrollTop() - this.pointerOffsetY + 'px'
        });
    }

    if (callback)
        callback();
};

CursorBaseBehavior.prototype.lMouseDown = function (callback) {
    if (this.$cursor) {
        shadowUI.removeClass(this.$cursor[0], STATE_CLASSES);
        shadowUI.addClass(this.$cursor[0], L_MOUSE_DOWN_CLASS);
    }

    if (callback)
        callback();
};

CursorBaseBehavior.prototype.rMouseDown = function (callback) {
    if (this.$cursor) {
        shadowUI.removeClass(this.$cursor[0], STATE_CLASSES);
        shadowUI.addClass(this.$cursor[0], R_MOUSE_DOWN_CLASS);
    }

    if (callback)
        callback();
};

CursorBaseBehavior.prototype.mouseUp = function (callback) {
    if (this.$cursor)
        shadowUI.removeClass(this.$cursor[0], STATE_CLASSES);

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

export default CursorBaseBehavior;
