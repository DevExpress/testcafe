import hammerhead from './deps/hammerhead';

import KEY_MAPS from './utils/key-maps';
import NODE_TYPE_DESCRIPTIONS from './utils/node-type-descriptions';
import RequestBarrier from './request-barrier';
import * as pageUnloadBarrier from './page-unload-barrier';
import { preventRealEvents, disableRealEventsPreventing } from './prevent-real-events';
import scrollController from './scroll-controller';

import * as serviceUtils from './utils/service';
import * as domUtils from './utils/dom';
import * as contentEditable from './utils/content-editable';
import * as positionUtils from './utils/position';
import * as styleUtils from './utils/style';
import * as eventUtils from './utils/event';
import * as arrayUtils from './utils/array';
import * as promiseUtils from './utils/promise';
import * as textSelection from './utils/text-selection';
import waitFor from './utils/wait-for';
import delay from './utils/delay';
import noop from './utils/noop';
import getKeyArray from './utils/get-key-array';
import getSanitizedKey from './utils/get-sanitized-key';
import parseKeySequence from './utils/parse-key-sequence';
import sendRequestToFrame from './utils/send-request-to-frame';

import * as browser from '../browser';

import selectorTextFilter from '../../client-functions/selectors/selector-text-filter';
import selectorAttributeFilter from '../../client-functions/selectors/selector-attribute-filter';

exports.RequestBarrier              = RequestBarrier;
exports.pageUnloadBarrier           = pageUnloadBarrier;
exports.preventRealEvents           = preventRealEvents;
exports.disableRealEventsPreventing = disableRealEventsPreventing;
exports.scrollController            = scrollController;

exports.serviceUtils           = serviceUtils;
exports.domUtils               = domUtils;
exports.contentEditable        = contentEditable;
exports.positionUtils          = positionUtils;
exports.styleUtils             = styleUtils;
exports.eventUtils             = eventUtils;
exports.arrayUtils             = arrayUtils;
exports.promiseUtils           = promiseUtils;
exports.textSelection          = textSelection;
exports.waitFor                = waitFor;
exports.delay                  = delay;
exports.noop                   = noop;
exports.getKeyArray            = getKeyArray;
exports.getSanitizedKey        = getSanitizedKey;
exports.parseKeySequence       = parseKeySequence;
exports.sendRequestToFrame     = sendRequestToFrame;
exports.KEY_MAPS               = KEY_MAPS;
exports.NODE_TYPE_DESCRIPTIONS = NODE_TYPE_DESCRIPTIONS;
exports.browser                = browser;

exports.selectorTextFilter      = selectorTextFilter;
exports.selectorAttributeFilter = selectorAttributeFilter;

exports.get = require;

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeCore%', {
    configurable: true,
    value:        exports
});

// NOTE: initTestCafeCore defined in wrapper template
/* global initTestCafeCore */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeCore(e.iframe.contentWindow, true));
