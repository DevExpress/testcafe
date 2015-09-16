import * as hammerheadAPI from './deps/hammerhead';

import $ from './deps/jquery';
import SETTINGS from './settings';
import ERROR_TYPE from '../../test-error/type';
import COMMAND from '../../runner/test-run/command';
import CROSS_DOMAIN_MESSAGES from './cross-domain-messages';
import * as transport from './transport';
import * as sandboxedJQuery from './sandboxed-jquery';
import * as jQuerySelectorExtensions from './jquery-extensions/custom-selectors';
import * as jQueryDataMethodProxy from './jquery-extensions/data-proxy';

import * as serviceUtils from './util/service';
import * as domUtils from './util/dom';
import * as contentEditable from './util/content-editable';
import * as positionUtils from './util/position';
import * as styleUtils from './util/style';
import * as keyCharUtils from './util/key-char';
import * as eventUtils from './util/event';
import * as textSelection from './util/text-selection';

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

hammerheadAPI.on(hammerheadAPI.IFRAME_READY_TO_INIT, e => initTestCafeCore(e.iframe.contentWindow, true));
