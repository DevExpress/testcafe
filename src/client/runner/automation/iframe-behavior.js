import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
import movePlaybackAutomation from './playback/move';

var messageSandbox = hammerhead.eventSandbox.message;

var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;


function onMessage (e) {
    if (e.message.cmd === CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_REQUEST_CMD) {
        var iFrame = domUtils.getIframeByWindow(e.source);

        var msg = {
            scroll:        styleUtils.getElementScroll(domUtils.findDocument(document)),
            iFrameOffset:  positionUtils.getOffsetPosition(iFrame),
            iFrameBorders: styleUtils.getBordersWidth(iFrame),
            iFramePadding: styleUtils.getElementPadding(iFrame),
            cmd:           CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_RESPONSE_CMD
        };

        messageSandbox.sendServiceMsg(msg, e.source);
    }
}

export function init () {
    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
}

export function destroy () {
    messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
}
