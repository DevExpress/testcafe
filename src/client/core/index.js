import hammerhead from './deps/hammerhead';

import SETTINGS from './settings';
import ERROR_TYPE from '../../legacy/test-run-error/type';
import COMMAND from '../../legacy/test-run/command';
import CROSS_DOMAIN_MESSAGES from './cross-domain-messages';
import * as transport from './transport';
import * as sandboxedJQuery from './sandboxed-jquery';
import extendJQuerySelectors from './jquery-extensions/custom-selectors';
import * as jQueryDataMethodProxy from './jquery-extensions/data-proxy';
import XhrBarrier from './xhr-barrier';
import * as pageUnloadBarrier from './page-unload-barrier';

import * as serviceUtils from './utils/service';
import * as domUtils from './utils/dom';
import * as contentEditable from './utils/content-editable';
import * as positionUtils from './utils/position';
import * as styleUtils from './utils/style';
import * as eventUtils from './utils/event';
import * as arrayUtils from './utils/array';
import * as textSelection from './utils/text-selection';
import waitFor from './utils/wait-for';
import delay from './utils/delay';
import noop from './utils/noop';

exports.SETTINGS              = SETTINGS;
exports.CROSS_DOMAIN_MESSAGES = CROSS_DOMAIN_MESSAGES;
exports.COMMAND               = COMMAND;
exports.ERROR_TYPE            = ERROR_TYPE;
exports.extendJQuerySelectors = extendJQuerySelectors;
exports.jQueryDataMethodProxy = jQueryDataMethodProxy;
exports.transport             = transport;
exports.sandboxedJQuery       = sandboxedJQuery;
exports.XhrBarrier            = XhrBarrier;
exports.pageUnloadBarrier     = pageUnloadBarrier;

exports.serviceUtils    = serviceUtils;
exports.domUtils        = domUtils;
exports.contentEditable = contentEditable;
exports.positionUtils   = positionUtils;
exports.styleUtils      = styleUtils;
exports.eventUtils      = eventUtils;
exports.arrayUtils      = arrayUtils;
exports.textSelection   = textSelection;
exports.waitFor         = waitFor;
exports.delay           = delay;
exports.noop            = noop;

exports.get = require;

Object.defineProperty(window, '%testCafeCore%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeCore(e.iframe.contentWindow, true));
