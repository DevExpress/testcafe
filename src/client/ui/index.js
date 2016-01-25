import hammerhead from './deps/hammerhead';

import * as selectElement from './select-element';
import * as modalBackground from './modal-background';
import ProgressPanel from './progress-panel';
import cursorUI from './cursor';
import * as iframeCursorUI from './cursor/iframe-cursor';

exports.cursorUI        = cursorUI;
exports.iframeCursorUI  = iframeCursorUI;
exports.selectElement   = selectElement;
exports.modalBackground = modalBackground;
exports.ProgressPanel   = ProgressPanel;

exports.get = require;

Object.defineProperty(window, '%testCafeUI%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, e => initTestCafeUI(e.iframe.contentWindow, true));
