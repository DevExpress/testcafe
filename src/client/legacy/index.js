import hammerhead from './deps/hammerhead';

import SETTINGS from './settings';

import RunnerBase from './runner-base';
import Runner from './runner';
import * as iframeDispatcher from './iframe-dispatcher';

import extendJQuerySelectors from './jquery-extensions/custom-selectors';
import * as jQueryDataMethodProxy from './jquery-extensions/data-proxy';
import * as sandboxedJQuery from './sandboxed-jquery';
import * as transport from './transport';


exports.SETTINGS              = SETTINGS;
exports.Runner                = Runner;
exports.RunnerBase            = RunnerBase;
exports.iframeDispatcher      = iframeDispatcher;
exports.extendJQuerySelectors = extendJQuerySelectors;
exports.jQueryDataMethodProxy = jQueryDataMethodProxy;
exports.sandboxedJQuery       = sandboxedJQuery;
exports.transport             = transport;

exports.get = require;

Object.defineProperty(window, '%testCafeLegacyRunner%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeRunner(e.iframe.contentWindow, true));
