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
    setWaitingElementStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingElement, timeout }, window.top);
    }

    resetWaitingElementStatus (waitingSuccess) {
        var msg = { cmd: MESSAGES.stopWaitingElementRequest, waitingSuccess };

        return sendRequestToFrame(msg, MESSAGES.stopWaitingElementResponse, window.top);
    }

    setWaitingAssertionExecutionStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingAssertionExecution, timeout }, window.top);
    }

    resetWaitingAssertionExecutionStatus (waitingSuccess) {
        var msg = { cmd: MESSAGES.stopWaitingAssertionExecutionRequest, waitingSuccess };

        return sendRequestToFrame(msg, MESSAGES.stopWaitingAssertionExecutionResponse, window.top);
    }
}
