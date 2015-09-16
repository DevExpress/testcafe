import * as hammerheadAPI from './deps/hammerhead';

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

hammerheadAPI.on(hammerheadAPI.IFRAME_READY_TO_INIT, e => initTestCafeRunner(e.iframe.contentWindow, true));
