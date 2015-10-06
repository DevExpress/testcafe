import hammerhead from './deps/hammerhead';

import $ from './deps/jquery';
import SETTINGS from './settings';
import ERROR_TYPE from '../../reporters/errors/type';
import COMMAND from '../../runner/test-run/command';
import CROSS_DOMAIN_MESSAGES from './cross-domain-messages';
import * as transport from './transport';
import * as sandboxedJQuery from './sandboxed-jquery';
import * as jQuerySelectorExtensions from './jquery-extensions/custom-selectors';
import * as jQueryDataMethodProxy from './jquery-extensions/data-proxy';

import * as serviceUtils from './utils/service';
import * as domUtils from './utils/dom';
import * as contentEditable from './utils/content-editable';
import * as positionUtils from './utils/position';
import * as styleUtils from './utils/style';
import * as keyCharUtils from './utils/key-char';
import * as eventUtils from './utils/event';
import * as textSelection from './utils/text-selection';

exports.$                        = $;
exports.SETTINGS                 = SETTINGS;
exports.CROSS_DOMAIN_MESSAGES    = CROSS_DOMAIN_MESSAGES;
exports.COMMAND                  = COMMAND;
exports.ERROR_TYPE               = ERROR_TYPE;
exports.jQuerySelectorExtensions = jQuerySelectorExtensions;
exports.jQueryDataMethodProxy    = jQueryDataMethodProxy;
exports.transport                = transport;
exports.sandboxedJQuery          = sandboxedJQuery;

exports.serviceUtils    = serviceUtils;
exports.domUtils        = domUtils;
exports.contentEditable = contentEditable;
exports.positionUtils   = positionUtils;
exports.styleUtils      = styleUtils;
exports.keyCharUtils    = keyCharUtils;
exports.eventUtils      = eventUtils;
exports.textSelection   = textSelection;

exports.get = require;

Object.defineProperty(window, '%testCafeCore%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.iframeReadyToInit, e => initTestCafeCore(e.iframe.contentWindow, true));
