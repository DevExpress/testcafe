import { sendRequestToFrame } from '../deps/testcafe-core';
import CURSOR_UI_MESSAGES from './messages';


export default {
    move (position) {
        const msg = {
            cmd: CURSOR_UI_MESSAGES.moveRequest,
            x:   position.x,
            y:   position.y,
        };

        return sendRequestToFrame(msg, CURSOR_UI_MESSAGES.moveResponse, window.parent);
    },

    leftButtonDown () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.leftButtonDownRequest,
        }, CURSOR_UI_MESSAGES.leftButtonDownResponse, window.parent);
    },

    rightButtonDown () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.rightButtonDownRequest,
        }, CURSOR_UI_MESSAGES.rightButtonDownResponse, window.parent);
    },

    buttonUp () {
        return sendRequestToFrame({
            cmd: CURSOR_UI_MESSAGES.buttonUpRequest,
        }, CURSOR_UI_MESSAGES.buttonUpResponse, window.parent);
    },
};
