import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import uiRoot from '../ui-root';
import CURSOR_UI_MESSAGES from './messages';


var Promise          = hammerhead.Promise;
var shadowUI         = hammerhead.shadowUI;
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;
var messageSandbox   = hammerhead.eventSandbox.message;

var styleUtils    = testCafeCore.styleUtils;
var positionUtils = testCafeCore.positionUtils;

const CURSOR_CLASS       = 'cursor';
const TOUCH_CLASS        = 'touch';
const L_MOUSE_DOWN_CLASS = 'l-mouse-down';
const R_MOUSE_DOWN_CLASS = 'r-mouse-down';
const STATE_CLASSES      = [L_MOUSE_DOWN_CLASS, R_MOUSE_DOWN_CLASS].join(' ');

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    var msg = e.message;

    switch (msg.cmd) {
        case CURSOR_UI_MESSAGES.moveRequest:
            var position = positionUtils.getIframePointRelativeToParentFrame({ x: msg.x, y: msg.y }, e.source);

            CursorUI
                .move(position.x, position.y)
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.moveResponse }, e.source));
            break;

        case CURSOR_UI_MESSAGES.leftButtonDownRequest:
            CursorUI
                .leftButtonDown()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.leftButtonDownResponse }, e.source));
            break;
        case CURSOR_UI_MESSAGES.rightButtonDownRequest:
            CursorUI
                .rightButtonDown()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.rightButtonDownResponse }, e.source));
            break;
        case CURSOR_UI_MESSAGES.buttonUpRequest:
            CursorUI
                .buttonUp()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.buttonUpResponse }, e.source));
            break;
    }
});

var CursorUI = {
    cursorElement:  null,
    x:              50,
    y:              50,
    pointerOffsetX: 0,
    pointerOffsetY: 0,

    _createElement () {
        this.cursorElement = document.createElement('div');
        shadowUI.addClass(this.cursorElement, CURSOR_CLASS);

        // NOTE: For IE, we can't use the touch cursor in a cross-domain iframe
        // because we won't be able to get an element under the cursor
        if (featureDetection.isTouchDevice && !browserUtils.isIE) {
            shadowUI.addClass(this.cursorElement, TOUCH_CLASS);

            // NOTE: in touch mode, the pointer should be in the center of the cursor
            this.pointerOffsetX = Math.ceil(styleUtils.getWidth(this.cursorElement) / 2);
            this.pointerOffsetY = Math.ceil(styleUtils.getHeight(this.cursorElement) / 2);
        }

        uiRoot.element().appendChild(this.cursorElement);
    },

    isVisible () {
        return this.cursorElement && styleUtils.get(this.cursorElement, 'visibility') !== 'hidden';
    },

    hide () {
        if (!this.cursorElement)
            this._createElement();

        styleUtils.set(this.cursorElement, 'visibility', 'hidden');
    },

    show () {
        if (!this.cursorElement)
            this._createElement();

        styleUtils.set(this.cursorElement, 'visibility', '');
    },

    move (x, y) {
        this.x = x;
        this.y = y;

        if (!this.cursorElement)
            this._createElement();

        styleUtils.set(this.cursorElement, {
            left: this.x - this.pointerOffsetX + 'px',
            top:  this.y - this.pointerOffsetY + 'px'
        });

        return Promise.resolve();
    },

    leftButtonDown () {
        if (!this.cursorElement)
            this._createElement();

        shadowUI.removeClass(this.cursorElement, STATE_CLASSES);
        shadowUI.addClass(this.cursorElement, L_MOUSE_DOWN_CLASS);

        return Promise.resolve();
    },

    rightButtonDown () {
        if (!this.cursorElement)
            this._createElement();

        shadowUI.removeClass(this.cursorElement, STATE_CLASSES);
        shadowUI.addClass(this.cursorElement, R_MOUSE_DOWN_CLASS);

        return Promise.resolve();
    },

    buttonUp () {
        if (!this.cursorElement)
            this._createElement();

        shadowUI.removeClass(this.cursorElement, STATE_CLASSES);

        return Promise.resolve();
    }
};

export default CursorUI;
