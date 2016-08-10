import hammerhead from './../deps/hammerhead';
import MESSAGES from './messages';
import StatusBar from './index';

var messageSandbox = hammerhead.eventSandbox.message;


export default class IframeStatusBar extends StatusBar {
    constructor () {
        super();
    }

    //API
    setWaitingStatus (timeout) {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.startWaitingForElement, timeout }, window.top);
    }

    resetStatus () {
        messageSandbox.sendServiceMsg({ cmd: MESSAGES.stopWaitingForElement }, window.top);
    }
}
