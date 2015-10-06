import hammerhead from './deps/hammerhead';

import RunnerBase from './runner-base';
import Runner from './runner';
import * as iframeDispatcher from './iframe-dispatcher';

exports.Runner           = Runner;
exports.RunnerBase       = RunnerBase;
exports.iframeDispatcher = iframeDispatcher;

exports.get = require;

Object.defineProperty(window, '%testCafeRunner%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, e => initTestCafeRunner(e.iframe.contentWindow, true));
