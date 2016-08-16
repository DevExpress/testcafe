import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import MESSAGES from './messages';
import StatusBar from './index';

var sendRequestToFrame = testCafeCore.sendRequestToFrame;
var messageSandbox     = hammerhead.eventSandbox.message;


export default class IframeStatusBar extends StatusBar {
    constructor () {
        super();
    }

    //API
    setWaitingStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingForElement, timeout }, window.top);
    }

    resetWaitingStatus (waitingSuccess) {
        var msg = { cmd: MESSAGES.stopWaitingForElementRequest, waitingSuccess };

        return sendRequestToFrame(msg, MESSAGES.stopWaitingForElementResponse, window.top);
    }
}
