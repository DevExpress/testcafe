import hammerhead from '../deps/hammerhead';
import { sendRequestToFrame } from '../deps/testcafe-core';
import CURSOR_UI_MESSAGES from './messages';

var browserUtils = hammerhead.utils.browser;

// HACK: In most browsers, the iframe's getElementFromPoint function ignores elements
// from the parent frame. But in IE it doesn't, and our cursor overlaps the target
// element. So, we move the cursor to a position one pixel farther to avoid this.
const RECOGNITION_INCREMENT = browserUtils.isIE ? 1 : 0;

export default {
    move (x, y) {
        var msg = {
            cmd: CURSOR_UI_MESSAGES.moveRequest,
            x:   x + RECOGNITION_INCREMENT,
            y:   y + RECOGNITION_INCREMENT
        };

        return sendRequestToFrame(msg, CURSOR_UI_MESSAGES.moveResponse, window.parent);
    },

    leftButtonDown () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.leftButtonDownRequest
        }, CURSOR_UI_MESSAGES.leftButtonDownResponse, window.parent);
    },

    rightButtonDown () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.rightButtonDownRequest
        }, CURSOR_UI_MESSAGES.rightButtonDownResponse, window.parent);
    },

    buttonUp () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.buttonUpRequest
        }, CURSOR_UI_MESSAGES.buttonUpResponse, window.parent);
    }
};
