import hammerhead from '../deps/hammerhead';
import {
    CROSS_DOMAIN_MESSAGES,
    domUtils,
    positionUtils,
    styleUtils
} from '../deps/testcafe-core';

var messageSandbox = hammerhead.eventSandbox.message;


function onMessage (e) {
    if (e.message.cmd === CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_REQUEST_CMD) {
        var iFrame = domUtils.findIframeInTopWindow(e.source);

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
