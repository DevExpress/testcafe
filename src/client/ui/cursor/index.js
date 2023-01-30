import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import uiRoot from '../ui-root';
import CURSOR_UI_MESSAGES from './messages';


const Promise          = hammerhead.Promise;
const shadowUI         = hammerhead.shadowUI;
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const messageSandbox   = hammerhead.eventSandbox.message;

const styleUtils    = testCafeCore.styleUtils;
const positionUtils = testCafeCore.positionUtils;

const CURSOR_CLASS       = 'cursor';
const TOUCH_CLASS        = 'touch';
const L_MOUSE_DOWN_CLASS = 'l-mouse-down';
const R_MOUSE_DOWN_CLASS = 'r-mouse-down';
const STATE_CLASSES      = [L_MOUSE_DOWN_CLASS, R_MOUSE_DOWN_CLASS].join(' ');

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    const msg = e.message;

    switch (msg.cmd) {
        case CURSOR_UI_MESSAGES.moveRequest:
            if (!msg.shouldRender)
                CursorUI.shouldRender = msg.shouldRender;

            CursorUI.move(positionUtils.getIframePointRelativeToParentFrame({ x: msg.x, y: msg.y }, e.source))
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.moveResponse }, e.source));
            break;

        case CURSOR_UI_MESSAGES.leftButtonDownRequest:
            CursorUI.leftButtonDown()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.leftButtonDownResponse }, e.source));
            break;
        case CURSOR_UI_MESSAGES.rightButtonDownRequest:
            CursorUI.rightButtonDown()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.rightButtonDownResponse }, e.source));
            break;
        case CURSOR_UI_MESSAGES.buttonUpRequest:
            CursorUI.buttonUp()
                .then(() => messageSandbox.sendServiceMsg({ cmd: CURSOR_UI_MESSAGES.buttonUpResponse }, e.source));
            break;
    }
});

const CursorUI = {
    cursorElement:  null,
    x:              50,
    y:              50,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    shouldRender:   true,

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

    _ensureCursorElement () {
        if (!this.shouldRender)
            return false;

        if (!this.cursorElement)
            this._createElement();

        return true;
    },

    isVisible () {
        return this.cursorElement && styleUtils.get(this.cursorElement, 'visibility') !== 'hidden';
    },

    hide () {
        if (!this._ensureCursorElement())
            return;

        if (this.isVisible())
            styleUtils.set(this.cursorElement, 'visibility', 'hidden');
    },

    show () {
        if (!this._ensureCursorElement())
            return;

        styleUtils.set(this.cursorElement, 'visibility', '');
    },

    move (position) {
        if (this._ensureCursorElement()) {
            this.x = position.x;
            this.y = position.y;

            styleUtils.set(this.cursorElement, {
                left: this.x - this.pointerOffsetX + 'px',
                top:  this.y - this.pointerOffsetY + 'px',
            });
        }

        return Promise.resolve();
    },

    leftButtonDown () {
        if (this._ensureCursorElement()) {
            shadowUI.removeClass(this.cursorElement, STATE_CLASSES);
            shadowUI.addClass(this.cursorElement, L_MOUSE_DOWN_CLASS);
        }

        return Promise.resolve();
    },

    rightButtonDown () {
        if (this._ensureCursorElement()) {
            shadowUI.removeClass(this.cursorElement, STATE_CLASSES);
            shadowUI.addClass(this.cursorElement, R_MOUSE_DOWN_CLASS);
        }

        return Promise.resolve();
    },

    buttonUp () {
        if (this._ensureCursorElement())
            shadowUI.removeClass(this.cursorElement, STATE_CLASSES);

        return Promise.resolve();
    },
};

export default CursorUI;
