import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';
import StepIterator from './step-iterator.js';
import AssertionsAPI from './api/assertions';
import * as actionsAPI from './api/actions';
import * as dialogsAPI from './api/native-dialogs';
import * as automation from './automation/automation';
import * as automationIFrameBehavior from './automation/iframe-behavior';
import * as actionBarrier from './action-barrier/action-barrier';


var messageSandbox = hammerhead.eventSandbox.message;

var sandboxedJQuery       = testCafeCore.sandboxedJQuery;
var SETTINGS              = testCafeCore.SETTINGS;
var COMMAND               = testCafeCore.COMMAND;
var ERROR_TYPE            = testCafeCore.ERROR_TYPE;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var transport             = testCafeCore.transport;
var serviceUtils          = testCafeCore.serviceUtils;
var domUtils              = testCafeCore.domUtils;
var eventUtils            = testCafeCore.eventUtils;

var modalBackground = testCafeUI.modalBackground;


const PAGE_LOAD_TIMEOUT                  = 3000;
const ANIMATIONS_WAIT_DELAY              = 200;
const CHECK_FILE_DOWNLOADING_DELAY       = 500;
const IFRAME_EXISTENCE_WATCHING_INTERVAL = 1000;


//Util
function waitPageLoad (callback) {
    var loaded          = false,
        callbackWrapper = function () {
            if (!loaded) {
                loaded = true;
                callback();
            }
        };

    eventUtils.bind(window, 'load', callbackWrapper);
    eventUtils
        .documentReady()
        .then(() => {
            //NOTE: an iFrame may be removed in this moment
            if (domUtils.isIFrameWindowInDOM(window) || domUtils.isTopWindow(window))
                window.setTimeout(callbackWrapper, PAGE_LOAD_TIMEOUT);
        });
}

//Init
var RunnerBase = function () {
    var runner = this;

    this.eventEmitter = new serviceUtils.EventEmitter();
    this.stepIterator = new StepIterator(pingIframe);

    this.executingStepInIFrameWindow = null;
    this.stopped                     = false;
    this.listenNativeDialogs         = false;
    this.isFileDownloadingIntervalID = null;

    this.assertionsAPI = new AssertionsAPI(function (err) {
        runner.stepIterator.onAssertionFailed(err);
    });

    actionsAPI.init(this.stepIterator);

    this._initNativeDialogs();

    automation.init();
    this._initBarrier();

    this._initApi();
    this._initIFrameBehavior();

    hammerhead.on(hammerhead.EVENTS.uncaughtJsError, function (err) {
        //NOTE: in this case we should to stop test iterator in iFrame
        if (err.inIFrame && !SETTINGS.get().PLAYBACK)
            runner.stepIterator.stop();
        else if (!SETTINGS.get().SKIP_JS_ERRORS || SETTINGS.get().RECORDING) {
            runner._onFatalError({
                type:      ERROR_TYPE.uncaughtJSError,
                scriptErr: err.msg,
                pageError: true,
                pageUrl:   err.pageUrl,
                stepName:  runner.stepIterator.getCurrentStep()
            });
        }
    });

    runner.stepIterator.on(StepIterator.ERROR_EVENT, function (e) {
        runner._onFatalError(e);
    });

    runner.act._onJSError = function (err) {
        runner._onFatalError({
            type:      ERROR_TYPE.uncaughtJSError,
            scriptErr: (err && err.message) || err
        });
    };

    runner.act._start = function (stepNames, testSteps, skipPageWaiting) {
        //NOTE: start test execution only when all content is loaded or if loading
        //timeout is reached (whichever comes first).
        runner._prepareStepsExecuting(function () {
            if (runner.stopped)
                return;

            delete runner.act._onJSError;
            delete runner.act._start;

            runner.eventEmitter.emit(runner.TEST_STARTED_EVENT, {
                nextStep: runner.nextStep
            });

            modalBackground.hide();

            runner.stepIterator.on(StepIterator.TEST_COMPLETE_EVENT, function (e) {
                runner._onTestComplete(e);
            });

            runner.stepIterator.on(StepIterator.NEXT_STEP_STARTED_EVENT, function (e) {
                runner._onNextStepStarted(e);
                runner._clearFileDownloadingInterval();
            });

            runner.stepIterator.on(StepIterator.ACTION_TARGET_WAITING_STARTED_EVENT, function (e) {
                runner._onActionTargetWaitingStarted(e);
            });

            runner.stepIterator.on(StepIterator.ACTION_RUN_EVENT, function () {
                runner._onActionRun();
            });

            runner.stepIterator.on(StepIterator.ASSERTION_FAILED_EVENT, function (e) {
                runner._onAssertionFailed(e);
            });

            runner.stepIterator.on(StepIterator.SET_STEPS_SHARED_DATA_EVENT, function (e) {
                runner._onSetStepsSharedData(e);
            });

            runner.stepIterator.on(StepIterator.GET_STEPS_SHARED_DATA_EVENT, function (e) {
                runner._onGetStepsSharedData(e);
            });

            runner.stepIterator.on(StepIterator.TAKE_SCREENSHOT_EVENT, function (e) {
                runner._onTakeScreenshot(e);
            });

            runner.stepIterator.on(StepIterator.BEFORE_UNLOAD_EVENT_RAISED, function () {
                runner._onBeforeUnload();
            });

            runner.stepIterator.on(StepIterator.UNLOAD_EVENT_RAISED, function () {
                runner._clearFileDownloadingInterval();
            });

            runner.listenNativeDialogs = true;

            runner.stepIterator.start(stepNames, testSteps, dialogsAPI.resetHandlers,
                dialogsAPI.checkExpectedDialogs, runner.nextStep);
        }, skipPageWaiting);
    };
};

RunnerBase.prototype.run = function (stepNames, testSteps, nextStep) {
    this.stepIterator.runSteps(stepNames, testSteps, dialogsAPI.resetHandlers,
        dialogsAPI.checkExpectedDialogs, nextStep);
};

RunnerBase.prototype._destroy = function () {
    dialogsAPI.destroy();

    this._destroyIFrameBehavior();
};

RunnerBase.prototype._initBarrier = function () {
    actionBarrier.init();
};

RunnerBase.prototype._initIFrameBehavior = function () {
    var runner = this;

    automationIFrameBehavior.init();

    function onMessage (e) {
        var message = e.message,
            msg     = null;

        switch (message.cmd) {
            case RunnerBase.IFRAME_STEP_COMPLETED_CMD:
                if (runner.stepIterator.waitedIFrame === domUtils.findIframeInTopWindow(e.source))
                    runner.stepIterator.iFrameActionCallback();
                else if (runner.executingStepInIFrameWindow === e.source)
                    runner._onIFrameStepExecuted();

                runner._clearIFrameExistenceWatcherInterval();
                break;

            case RunnerBase.IFRAME_ERROR_CMD:
                if (message.err.stepNum === -1) {
                    message.err.stepNum  = runner.stepIterator.getCurrentStepNum();
                    message.err.stepName = runner.stepIterator.getCurrentStep();
                }
                runner._clearIFrameExistenceWatcherInterval();
                runner._onFatalError(message.err);
                break;

            case RunnerBase.IFRAME_FAILED_ASSERTION_CMD:
                if (SETTINGS.get().PLAYBACK)
                    runner.executingStepInIFrameWindow = null;

                message.err.stepNum = runner.stepIterator.state.step - 1;
                runner._onAssertionFailed(message.err);
                break;

            case RunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD:
                msg = {
                    cmd:        RunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD,
                    sharedData: runner.stepIterator.getSharedData()
                };

                messageSandbox.sendServiceMsg(msg, e.source);
                break;

            case RunnerBase.IFRAME_SET_SHARED_DATA_CMD:
                runner.stepIterator.setSharedData(message.sharedData);
                break;

            case RunnerBase.IFRAME_NEXT_STEP_STARTED_CMD:
                runner.executingStepInIFrameWindow = e.source;
                runner._clearFileDownloadingInterval();

                break;

            case RunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD:
                runner.actionTargetWaitingStarted = true;
                runner._onActionTargetWaitingStarted(e.message.params);
                break;

            case RunnerBase.IFRAME_ACTION_RUN_CMD:
                runner.actionTargetWaitingStarted = false;
                runner._onActionRun();
                break;

            case CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_REQUEST_CMD:
                if (runner.stepIterator.waitedIFrame === domUtils.findIframeInTopWindow(e.source) ||
                    runner.executingStepInIFrameWindow === e.source) {
                    msg = {
                        cmd: CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD
                    };

                    messageSandbox.sendServiceMsg(msg, e.source);
                }
                break;

            case RunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD:
                runner._onTakeScreenshot({
                    stepName: message.stepName,
                    filePath: message.filePath,
                    callback: function () {
                        msg = {
                            cmd: RunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD
                        };

                        messageSandbox.sendServiceMsg(msg, e.source);
                    }
                });
                break;

            case RunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD:
                runner._onDialogsInfoChanged(message.info);
                break;

            case RunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD:
                runner.actionTargetWaitingStarted = false;
                runner._onActionRun();

                runner._onBeforeUnload(true, function (res) {
                    msg = {
                        cmd: RunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD,
                        res: res
                    };
                    messageSandbox.sendServiceMsg(msg, e.source);
                });
                break;
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);

    //NOTE: for test purposes
    runner._destroyIFrameBehavior = function () {
        automationIFrameBehavior.destroy();
        messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
    };
};

RunnerBase.prototype._prepareStepsExecuting = function (callback, skipPageWaiting) {
    if (skipPageWaiting)
        callback();
    else {
        waitPageLoad(() => {
            window.setTimeout(() => {
                transport.batchUpdate(() => {
                    actionBarrier.waitPageInitialization(callback);
                });
            }, ANIMATIONS_WAIT_DELAY);
        });
    }
};

RunnerBase.WAITING_FOR_ACTION_TARGET_MESSAGE = 'Waiting for the target element of the next action to appear';

RunnerBase.prototype.TEST_STARTED_EVENT                  = 'testStarted';
RunnerBase.prototype.TEST_COMPLETED_EVENT                = 'testCompleted';
RunnerBase.prototype.NEXT_STEP_STARTED_EVENT             = 'nextStepStarted';
RunnerBase.prototype.ACTION_TARGET_WAITING_STARTED_EVENT = 'actionTargetWaitingStarted';
RunnerBase.prototype.ACTION_RUN_EVENT                    = 'actionRun';
RunnerBase.prototype.TEST_FAILED_EVENT                   = 'testFailed';

RunnerBase.SCREENSHOT_CREATING_STARTED_EVENT  = 'screenshotCreatingStarted';
RunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT = 'screenshotCreatingFinished';

RunnerBase.IFRAME_STEP_COMPLETED_CMD                = 'iframeStepCompleted';
RunnerBase.IFRAME_ERROR_CMD                         = 'iframeError';
RunnerBase.IFRAME_FAILED_ASSERTION_CMD              = 'iframeFailedAssertion';
RunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD       = 'getSharedDataRequest';
RunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD      = 'getSharedDataResponse';
RunnerBase.IFRAME_SET_SHARED_DATA_CMD               = 'setSharedData';
RunnerBase.IFRAME_NEXT_STEP_STARTED_CMD             = 'nextStepStarted';
RunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD = 'actionTargetWaitingStarted';
RunnerBase.IFRAME_ACTION_RUN_CMD                    = 'actionRun';
RunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD       = 'takeScreenshotRequest';
RunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD      = 'takeScreenshotResponse';
RunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD   = 'nativeDialogsInfoChanged';
RunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD         = 'iframeBeforeUnloadRequest';
RunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD        = 'iframeBeforeUnloadResponse';

RunnerBase.prototype.on = function (event, handler) {
    this.eventEmitter.on(event, handler);
};

function pingIframe (iframe, callback) {
    messageSandbox
        .pingIframe(iframe, CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD)
        .then(callback);
}

RunnerBase.prototype._runInIFrame = function (iframe, stepName, step, stepNum) {
    var runner = this;

    this.stepIterator.state.inAsyncAction = true;

    var msg = {
        cmd:      CROSS_DOMAIN_MESSAGES.IFRAME_TEST_RUNNER_RUN_CMD,
        stepName: stepName,
        step:     step.toString(),
        stepNum:  stepNum
    };

    this._clearIFrameExistenceWatcherInterval();

    function iframeExistenceWatcher () {
        if (!iframe.parentNode) {
            runner._onIFrameStepExecuted();
            runner._clearIFrameExistenceWatcherInterval();
        }
    }

    pingIframe(iframe, function (err) {
        if (err) {
            runner._onFatalError({
                type:     ERROR_TYPE.inIFrameTargetLoadingTimeout,
                stepName: runner.stepIterator.getCurrentStep()
            });
        }
        else {
            runner.iframeExistenceWatcherInterval = window.setInterval(iframeExistenceWatcher, IFRAME_EXISTENCE_WATCHING_INTERVAL);
            messageSandbox.sendServiceMsg(msg, iframe.contentWindow);
        }
    });
};

RunnerBase.prototype._ensureIFrame = function (arg) {
    if (!arg) {
        this._onFatalError({
            type:     ERROR_TYPE.emptyIFrameArgument,
            stepName: this.stepIterator.getCurrentStep()
        });
        return null;
    }

    if (domUtils.isDomElement(arg)) {
        if (arg.tagName && arg.tagName.toLowerCase() === 'iframe')
            return arg;
        else {
            this._onFatalError({
                type:     ERROR_TYPE.iframeArgumentIsNotIFrame,
                stepName: this.stepIterator.getCurrentStep()
            });
            return null;
        }
    }

    if (typeof arg === 'string')
        arg = sandboxedJQuery.jQuery(arg);

    if (hammerhead.utils.isJQueryObj(arg)) {
        if (arg.length === 0) {
            this._onFatalError({
                type:     ERROR_TYPE.emptyIFrameArgument,
                stepName: this.stepIterator.getCurrentStep()
            });
            return null;
        }
        else if (arg.length > 1) {
            this._onFatalError({
                type:     ERROR_TYPE.multipleIFrameArgument,
                stepName: this.stepIterator.getCurrentStep()
            });
            return null;
        }
        else
            return this._ensureIFrame(arg[0]);
    }

    if (typeof arg === 'function')
        return this._ensureIFrame(arg());

    this._onFatalError({
        type:     ERROR_TYPE.incorrectIFrameArgument,
        stepName: this.stepIterator.getCurrentStep()
    });

    return null;
};

//API
RunnerBase.prototype._initApi = function () {
    var runner = this;

    this.act = actionsAPI;

    this.ok                 = function () {
        runner.assertionsAPI.ok.apply(runner.assertionsAPI, arguments);
    };
    this.notOk              = function () {
        runner.assertionsAPI.notOk.apply(runner.assertionsAPI, arguments);
    };
    this.eq                 = function () {
        runner.assertionsAPI.eq.apply(runner.assertionsAPI, arguments);
    };
    this.notEq              = function () {
        runner.assertionsAPI.notEq.apply(runner.assertionsAPI, arguments);
    };
    this.handleAlert        = dialogsAPI.handleAlert;
    this.handleConfirm      = dialogsAPI.handleConfirm;
    this.handlePrompt       = dialogsAPI.handlePrompt;
    this.handleBeforeUnload = dialogsAPI.handleBeforeUnload;
    this.inIFrame           = function (iFrameGetter, step) {
        return function () {
            var stepNum = runner.stepIterator.state.step,
                iFrame  = runner._ensureIFrame(iFrameGetter());

            if (iFrame)
                runner._runInIFrame(iFrame, runner.stepIterator.getCurrentStep(), step, stepNum);
        };
    };
};

RunnerBase.prototype._initNativeDialogs = function () {
    //NOTE: this method should be synchronous because we should have this info before page scripts are executed
    var runner = this;

    if (SETTINGS.get().NATIVE_DIALOGS_INFO)
        runner.listenNativeDialogs = true;

    dialogsAPI.init(SETTINGS.get().NATIVE_DIALOGS_INFO);

    dialogsAPI.on(dialogsAPI.UNEXPECTED_DIALOG_ERROR_EVENT, function (e) {
        if (runner.listenNativeDialogs) {
            runner.stepIterator.onError({
                type:     ERROR_TYPE.unexpectedDialog,
                stepName: runner.stepIterator.getCurrentStep(),
                dialog:   e.dialog,
                message:  e.message
            });
        }
    });

    dialogsAPI.on(dialogsAPI.WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT, function (e) {
        if (runner.listenNativeDialogs) {
            runner.stepIterator.onError({
                type:     ERROR_TYPE.expectedDialogDoesntAppear,
                stepName: runner.stepIterator.getCurrentStep(),
                dialog:   e.dialog
            });
        }
    });

    dialogsAPI.on(dialogsAPI.DIALOGS_INFO_CHANGED_EVENT, function (e) {
        runner._onDialogsInfoChanged(e.info);
    });
};
//Handlers
RunnerBase.prototype._onTestComplete = function (e) {
    this.stopped = true;
    this.eventEmitter.emit(this.TEST_COMPLETED_EVENT, {});
    e.callback();
};

RunnerBase.prototype._onNextStepStarted = function (e) {
    e.callback();
};

RunnerBase.prototype._onActionTargetWaitingStarted = function (e) {
    this.eventEmitter.emit(this.ACTION_TARGET_WAITING_STARTED_EVENT, e);
};

RunnerBase.prototype._onActionRun = function () {
    this.eventEmitter.emit(this.ACTION_RUN_EVENT, {});
};

RunnerBase.prototype._onFatalError = function (err) {
    this.eventEmitter.emit(this.TEST_FAILED_EVENT, {
        stepNum: this.stepIterator.state.step - 1,
        err:     err
    });
};

RunnerBase.prototype._onAssertionFailed = function () {
};

RunnerBase.prototype._onSetStepsSharedData = function (e) {
    e.callback();
};

RunnerBase.prototype._onGetStepsSharedData = function (e) {
    e.callback();
};

RunnerBase.prototype._onTakeScreenshot = function (e) {
    if (e && e.callback)
        e.callback();
};

RunnerBase.prototype._onIFrameStepExecuted = function () {
    this.executingStepInIFrameWindow = null;

    if (this.actionTargetWaitingStarted) {
        this.actionTargetWaitingStarted = false;
        this.stepIterator.runLast();
    }
    else
        this.stepIterator.runNext();
};

RunnerBase.prototype._onDialogsInfoChanged = function () {
};

RunnerBase.prototype.setGlobalWaitFor = function (event, timeout) {
    this.stepIterator.setGlobalWaitFor(event, timeout);
};

RunnerBase.prototype._onBeforeUnload = function (fromIFrame, callback) {
    var runner = this;

    if (this.stopped)
        return;

    //NOTE: we should expect file downloading request only after before unload event (T216625)
    transport.asyncServiceMsg({ cmd: COMMAND.uncheckFileDownloadingFlag }, function () {

        //NOTE: we need check it to determinate file downloading
        runner.isFileDownloadingIntervalID = window.setInterval(function () {
            transport.asyncServiceMsg({ cmd: COMMAND.getAndUncheckFileDownloadingFlag }, function (res) {
                if (res) {
                    window.clearInterval(runner.isFileDownloadingIntervalID);
                    runner.isFileDownloadingIntervalID = null;

                    if (fromIFrame) {
                        callback(res);
                        return;
                    }

                    if (runner.stepIterator.state.stepDelayTimeout) {
                        window.clearTimeout(runner.stepIterator.state.stepDelayTimeout);
                        runner.stepIterator.state.stepDelayTimeout = null;
                    }

                    runner.stepIterator.state.pageUnloading = false;
                    runner.stepIterator._runStep();
                }
            });
        }, CHECK_FILE_DOWNLOADING_DELAY);
    });
};

RunnerBase.prototype._clearFileDownloadingInterval = function () {
    if (this.isFileDownloadingIntervalID) {
        window.clearInterval(this.isFileDownloadingIntervalID);
        this.isFileDownloadingIntervalID = null;
    }
};

RunnerBase.prototype._clearIFrameExistenceWatcherInterval = function () {
    if (this.iframeExistenceWatcherInterval !== -1) {
        window.clearInterval(this.iframeExistenceWatcherInterval);
        this.iframeExistenceWatcherInterval = -1;
    }
};


export default RunnerBase;
