import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';

import * as selectElement from './select-element';
import * as modalBackground from './modal-background';
import ProgressPanel from './progress-panel';
import StatusBar from './status-bar';
import IframeStatusBar from './status-bar/iframe-status-bar';
import cursorUI from './cursor';
import iframeCursorUI from './cursor/iframe-cursor';
import screenshotMark from './screenshot-mark';
import uiRoot from './ui-root';


const Promise        = hammerhead.Promise;
const messageSandbox = hammerhead.eventSandbox.message;

const sendRequestToFrame = testCafeCore.sendRequestToFrame;

const HIDE_REQUEST_CMD  = 'ui|hide|request';
const HIDE_RESPONSE_CMD = 'ui|hide|response';
const SHOW_REQUEST_CMD  = 'ui|show|request';
const SHOW_RESPONSE_CMD = 'ui|show|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === HIDE_REQUEST_CMD) {
        uiRoot.hide();
        messageSandbox.sendServiceMsg({ cmd: HIDE_RESPONSE_CMD }, e.source);
    }
    else if (e.message.cmd === SHOW_REQUEST_CMD) {
        uiRoot.show();
        messageSandbox.sendServiceMsg({ cmd: SHOW_RESPONSE_CMD }, e.source);
    }
});

const exports = {};

exports.uiRoot          = uiRoot;
exports.cursorUI        = cursorUI;
exports.iframeCursorUI  = iframeCursorUI;
exports.selectElement   = selectElement;
exports.modalBackground = modalBackground;
exports.ProgressPanel   = ProgressPanel;
exports.StatusBar       = StatusBar;
exports.IframeStatusBar = IframeStatusBar;


exports.hide = function (hideTopRoot) {
    if (hideTopRoot)
        return sendRequestToFrame({ cmd: HIDE_REQUEST_CMD }, HIDE_RESPONSE_CMD, window.top);

    uiRoot.hide();
    return Promise.resolve();
};

exports.show = function (showTopRoot) {
    if (showTopRoot)
        return sendRequestToFrame({ cmd: SHOW_REQUEST_CMD }, SHOW_RESPONSE_CMD, window.top);

    uiRoot.show();
    return Promise.resolve();
};

exports.showScreenshotMark = url => screenshotMark.show(url);
exports.hideScreenshotMark = () => screenshotMark.hide();

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, '%testCafeUI%', { configurable: true, value: exports });

// eslint-disable-next-line no-undef
hammerhead.on(evalIframeScript, e => initTestCafeUI(nativeMethods.contentWindowGetter.call(e.iframe), true));
