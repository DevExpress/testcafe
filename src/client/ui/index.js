import hammerhead from './deps/hammerhead';

import * as selectElement from './select-element';
import * as modalBackground from './modal-background';
import ProgressPanel from './progress-panel';
import StatusBar from './status-bar';
import IframeStatusBar from './status-bar/iframe-status-bar';
import cursorUI from './cursor';
import * as iframeCursorUI from './cursor/iframe-cursor';

exports.cursorUI        = cursorUI;
exports.iframeCursorUI  = iframeCursorUI;
exports.selectElement   = selectElement;
exports.modalBackground = modalBackground;
exports.ProgressPanel   = ProgressPanel;
exports.StatusBar       = StatusBar;
exports.IframeStatusBar = IframeStatusBar;

exports.get = require;

exports.hide = function () {
    hammerhead.shadowUI.getRoot().style.visibility = 'hidden';
};

exports.show = function () {
    hammerhead.shadowUI.getRoot().style.visibility = '';
};

Object.defineProperty(window, '%testCafeUI%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeUI(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
