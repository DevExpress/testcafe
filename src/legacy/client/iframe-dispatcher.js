import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';

import initAutomation from './init-automation';
import RunnerBase from './runner-base';
import IFrameRunner from './iframe-runner';
import CROSS_DOMAIN_MESSAGES from './cross-domain-messages';

var Promise        = hammerhead.Promise;
var messageSandbox = hammerhead.eventSandbox.message;
var nativeMethods  = hammerhead.nativeMethods;
var RequestBarrier = testCafeCore.RequestBarrier;
var serviceUtils   = testCafeCore.serviceUtils;
var domUtils       = testCafeCore.domUtils;
var eventUtils     = testCafeCore.eventUtils;


var testRunInitializedCallback = null,
    runStep                    = null,
    pageInitialzied            = false,
    actionsQueue               = [],
    testRunnerInitialized      = false,

    testRunner                 = null;


export const MESSAGE_RECEIVED = 'messageReceived';

function runOrEnqueue (fn) {
    if (!pageInitialzied)
        actionsQueue.push(fn);
    else
        fn();
}

function onRunStepsMsg (msg) {
    if (!testRunnerInitialized) {
        testRunnerInitialized = true;
        testRunInitializedCallback(testRunner, runStepInContext => runStep = runStepInContext);

        runOrEnqueue(() => {
            runStep(msg.stepName, msg.step, (stepNames, steps) => testRunner.act._start(stepNames, steps, true));
        });
    }
    else {
        runOrEnqueue(() => {
            runStep(msg.stepName, msg.step, (stepNames, steps) => testRunner.run(stepNames, steps, 0));
        });
    }
}

export var on  = null;
export var off = null;

export function init (onTestRunInitialized) {
    testRunner = new IFrameRunner();

    initAutomation();

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
var ANIMATIONS_WAIT_DELAY = 200;

var initialized = false;

if (window.top !== window) {
    var requestBarrier = null;

    eventUtils
        .documentReady()
        .then(() => {
            if (!initialized) {
                requestBarrier = new RequestBarrier();

                initialized = true;

                return new Promise(resolve => nativeMethods.setTimeout.call(window, resolve, ANIMATIONS_WAIT_DELAY));
            }
        })
        .then(() => requestBarrier.wait(true))
        .then(() => {
            messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, function (e) {
                var msg = e.message;

                if (msg.cmd ===
                    CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD) {
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
}
