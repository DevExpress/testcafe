import hammerhead from './deps/hammerhead';

import KEY_MAPS from './utils/key-maps';
import KEY_IDENTIFIER_MAPS from './utils/key-identifier-maps';
import NODE_TYPE_DESCRIPTIONS from './utils/node-type-descriptions';
import RequestBarrier from './request-barrier';
import * as pageUnloadBarrier from './page-unload-barrier';
import preventRealEvents from './prevent-real-events';

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
import getKeyArray from './utils/get-key-array';
import getSanitizedKey from './utils/get-sanitized-key';
import parseKeySequence from './utils/parse-key-sequence';
import IsKeyIdentifierNeeded from './utils/is-key-identifier-needed';
import sendRequestToFrame from './utils/send-request-to-frame';

import * as browser from '../browser';

exports.RequestBarrier    = RequestBarrier;
exports.pageUnloadBarrier = pageUnloadBarrier;
exports.preventRealEvents = preventRealEvents;

exports.serviceUtils           = serviceUtils;
exports.domUtils               = domUtils;
exports.contentEditable        = contentEditable;
exports.positionUtils          = positionUtils;
exports.styleUtils             = styleUtils;
exports.eventUtils             = eventUtils;
exports.arrayUtils             = arrayUtils;
exports.textSelection          = textSelection;
exports.waitFor                = waitFor;
exports.delay                  = delay;
exports.noop                   = noop;
exports.getKeyArray            = getKeyArray;
exports.getSanitizedKey        = getSanitizedKey;
exports.parseKeySequence       = parseKeySequence;
exports.IsKeyIdentifierNeeded  = IsKeyIdentifierNeeded;
exports.sendRequestToFrame     = sendRequestToFrame;
exports.KEY_MAPS               = KEY_MAPS;
exports.KEY_IDENTIFIER_MAPS    = KEY_IDENTIFIER_MAPS;
exports.NODE_TYPE_DESCRIPTIONS = NODE_TYPE_DESCRIPTIONS;
exports.browser                = browser;

exports.get = require;

Object.defineProperty(window, '%testCafeCore%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

// NOTE: initTestCafeCore defined in wrapper template
/* global initTestCafeCore */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeCore(e.iframe.contentWindow, true));
