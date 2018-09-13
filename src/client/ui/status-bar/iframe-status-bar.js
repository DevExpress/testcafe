import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import MESSAGES from './messages';
import StatusBar from './index';

const sendRequestToFrame = testCafeCore.sendRequestToFrame;
const messageSandbox     = hammerhead.eventSandbox.message;


export default class IframeStatusBar extends StatusBar {
    constructor () {
        super();
    }

    //API
    showWaitingElementStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingElement, timeout }, window.top);
    }

    hideWaitingElementStatus (waitingSuccess) {
        const msg = { cmd: MESSAGES.endWaitingElementRequest, waitingSuccess };

        return sendRequestToFrame(msg, MESSAGES.endWaitingElementResponse, window.top);
    }

    showWaitingAssertionRetriesStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingAssertionRetries, timeout }, window.top);
    }

    hideWaitingAssertionRetriesStatus (waitingSuccess) {
        const msg = { cmd: MESSAGES.endWaitingAssertionRetriesRequest, waitingSuccess };

        return sendRequestToFrame(msg, MESSAGES.endWaitingAssertionRetriesResponse, window.top);
    }
}
