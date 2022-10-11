import hammerhead from './deps/hammerhead';

import KEY_MAPS from './utils/key-maps';
import RequestBarrier from '../driver/barriers/request';
import ClientRequestEmitter from './barriers/emitters/client-request';
import ScriptExecutionBarrier from '../driver/barriers/script-execution';
import ScriptExecutionEmitter from './barriers/emitters/script-execution';
import * as pageUnloadBarrier from './barriers/page-unload-barrier';
import { preventRealEvents, disableRealEventsPreventing } from './prevent-real-events';
import scrollController from './scroll/controller';
import ScrollAutomation from './scroll/index';

import * as serviceUtils from './utils/service';
import * as domUtils from './utils/dom';
import * as contentEditable from './utils/content-editable';
import * as positionUtils from './utils/position';
import * as styleUtils from './utils/style';
import * as scrollUtils from './utils/scroll';
import * as eventUtils from './utils/event';
import * as arrayUtils from './utils/array';
import * as promiseUtils from './utils/promise';
import * as textSelection from './utils/text-selection';
import waitFor from './utils/wait-for';
import delay from './utils/delay';
import getTimeLimitedPromise from './utils/get-time-limited-promise';
import noop from './utils/noop';
import getKeyArray from './utils/get-key-array';
import getSanitizedKey from './utils/get-sanitized-key';
import parseKeySequence from './utils/parse-key-sequence';
import sendRequestToFrame from './utils/send-request-to-frame';
import stringifyElement from './utils/stringify-element';

import * as browser from '../browser';

import selectorTextFilter from '../../client-functions/selectors/selector-text-filter';
import selectorAttributeFilter from '../../client-functions/selectors/selector-attribute-filter';

const exports = {};

exports.RequestBarrier              = RequestBarrier;
exports.ClientRequestEmitter        = ClientRequestEmitter;
exports.ScriptExecutionBarrier      = ScriptExecutionBarrier;
exports.ScriptExecutionEmitter      = ScriptExecutionEmitter;
exports.pageUnloadBarrier           = pageUnloadBarrier;
exports.preventRealEvents           = preventRealEvents;
exports.disableRealEventsPreventing = disableRealEventsPreventing;
exports.scrollController            = scrollController;
exports.ScrollAutomation            = ScrollAutomation;

exports.serviceUtils           = serviceUtils;
exports.domUtils               = domUtils;
exports.contentEditable        = contentEditable;
exports.positionUtils          = positionUtils;
exports.styleUtils             = styleUtils;
exports.scrollUtils            = scrollUtils;
exports.eventUtils             = eventUtils;
exports.arrayUtils             = arrayUtils;
exports.promiseUtils           = promiseUtils;
exports.textSelection          = textSelection;
exports.waitFor                = waitFor;
exports.delay                  = delay;
exports.getTimeLimitedPromise  = getTimeLimitedPromise;
exports.noop                   = noop;
exports.getKeyArray            = getKeyArray;
exports.getSanitizedKey        = getSanitizedKey;
exports.parseKeySequence       = parseKeySequence;
exports.sendRequestToFrame     = sendRequestToFrame;
exports.KEY_MAPS               = KEY_MAPS;
exports.browser                = browser;
exports.stringifyElement       = stringifyElement;

exports.selectorTextFilter      = selectorTextFilter;
exports.selectorAttributeFilter = selectorAttributeFilter;

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, '%testCafeCore%', { configurable: true, value: exports });

// NOTE: initTestCafeCore defined in wrapper template
/* global initTestCafeCore */
hammerhead.on(evalIframeScript, e => initTestCafeCore(nativeMethods.contentWindowGetter.call(e.iframe), true));


const messageSandbox = hammerhead.eventSandbox.message;

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd !== ScrollAutomation.SCROLL_REQUEST_CMD)
        return;

    const { offsetX, offsetY, maxScrollMargin } = e.message;

    const element = domUtils.findIframeByWindow(e.source);
    const scroll  = new ScrollAutomation(element, { offsetX, offsetY }, maxScrollMargin);

    scroll.run()
        .then(() => messageSandbox.sendServiceMsg({ cmd: ScrollAutomation.SCROLL_RESPONSE_CMD }, e.source));
});
