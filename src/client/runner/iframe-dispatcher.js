import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import * as xhrBarrier from './action-barrier/xhr';
import * as automation from './automation/automation';
import * as automationIFrameBehavior from './automation/iframe-behavior';
import RunnerBase from './runner-base';
import IFrameRunner from './iframe-runner';

var messageSandbox        = hammerhead.messageSandbox;
var $                     = testCafeCore.$;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var serviceUtils          = testCafeCore.serviceUtils;
var cursor                = testCafeUI.cursor;


var testRunInitializedCallback = null,
    runStep                    = null,
    pageInitialzied            = false,
    actionsQueue               = [],
    testRunnerInitialized      = false,

    testRunner                 = null;

export const MESSAGE_RECEIVED = 'messageReceived';

function runOrPushInQueue (fn) {
    if (!pageInitialzied)
        actionsQueue.push(fn);
    else
        fn();
}

function onRunStepsMsg (msg) {
    if (!testRunnerInitialized) {
        testRunnerInitialized = true;
        testRunInitializedCallback(testRunner, function (runStepInContext) {
            runStep = runStepInContext;
        });

        runOrPushInQueue(function () {
            runStep(msg.stepName, msg.step, 0, function () {
                testRunner.act._start.apply(testRunner, arguments);
            });
        });
    }
    else {
        runOrPushInQueue(function () {
            runStep(msg.stepName, msg.step, 0, function () {
                testRunner.run.apply(testRunner, arguments);
            });
        });
    }
}

export var on  = null;
export var off = null;

export function init (onTestRunInitialized) {
    testRunner = new IFrameRunner();

    automation.init();

    testRunInitializedCallback = onTestRunInitialized;

    var eventEmitter = new serviceUtils.EventEmitter();

    on = function () {
        eventEmitter.on.apply(eventEmitter, arguments);
    };

    off = function () {
        eventEmitter.off.apply(eventEmitter, arguments);
    };

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, function (e) {
        var msg = e.message;
        switch (msg.cmd) {
            case CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_RUN_CMD:
                onRunStepsMsg(msg);
                break;

            case CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD:
                if (msg.isPingRequest) {
                    messageSandbox.sendServiceMsg({
                        cmd:            CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD,
                        isPingResponse: true
                    }, window.top);
                }
                break;

            default:
                eventEmitter.emit(MESSAGE_RECEIVED, msg);
        }
    });
}

//Const
var PAGE_LOAD_TIMEOUT     = 3000,
    ANIMATIONS_WAIT_DELAY = 200;

//Util
function waitPageLoad (callback) {
    var loaded          = false,
        callbackWrapper = function () {
            if (!loaded) {
                loaded = true;
                callback();
            }
        };

    $(window).load(callbackWrapper);
    $(document).ready(function () {
        //NOTE: an iFrame may be removed in this moment
        if (window && window.top)
            window.setTimeout(callbackWrapper, PAGE_LOAD_TIMEOUT);
    });
}


var initialized = false;

if (window.top !== window.self) {
    waitPageLoad(function () {
        if (!initialized) {

            xhrBarrier.init();
            automationIFrameBehavior.init();
            cursor.init();

            initialized = true;

            window.setTimeout(function () {
                xhrBarrier.waitPageInitialRequests(function () {
                    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, function (e) {
                        var msg = e.message;

                        if (msg.cmd === CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD) {
                            testRunner.onStepCompleted();

                            if (!testRunner.stepIterator.state.stopped) {
                                messageSandbox.sendServiceMsg({
                                    cmd: RunnerBase.IFRAME_STEP_COMPLETED_CMD
                                }, window.top);
                            }
                        }
                    });

                    var stepWaitingRequestMsg = {
                        cmd: CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_REQUEST_CMD
                    };

                    messageSandbox.sendServiceMsg(stepWaitingRequestMsg, window.top);

                    pageInitialzied = true;

                    for (var i = 0; i < actionsQueue.length; i++) {
                        actionsQueue[i]();
                    }
                });
            }, ANIMATIONS_WAIT_DELAY);
        }
    });
}
