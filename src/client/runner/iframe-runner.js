import * as hammerheadAPI from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import * as dialogsAPI from './api/native-dialogs';
import RunnerBase from './runner-base.js';

var SETTINGS                 = testCafeCore.SETTINGS;
var messageSandbox           = hammerheadAPI.MessageSandbox;
var jQuerySelectorExtensions = testCafeCore.jQuerySelectorExtensions;
var serviceUtils             = testCafeCore.serviceUtils;


var IFrameRunner = function (startedCallback) {
    RunnerBase.apply(this, [startedCallback]);
};

serviceUtils.inherit(IFrameRunner, RunnerBase);

IFrameRunner.prototype._initPageLoadBarrier = function () {
};

IFrameRunner.prototype._prepareStepsExecuting = function (callback) {
    jQuerySelectorExtensions.init();
    callback();
};

IFrameRunner.prototype._onTestComplete = function (e) {
    var completeMsg = {
        cmd: RunnerBase.IFRAME_STEP_COMPLETED_CMD
    };

    this._onSetStepsSharedData({
        stepsSharedData: this.stepIterator.getSharedData(),
        callback:        function () {
            messageSandbox.sendServiceMsg(completeMsg, window.top);
            e.callback();
        }
    });
};

IFrameRunner.prototype._onNextStepStarted = function (e) {
    var msg = {
        cmd: RunnerBase.IFRAME_NEXT_STEP_STARTED_CMD
    };

    messageSandbox.sendServiceMsg(msg, window.top);
    e.callback();
};

IFrameRunner.prototype._onActionTargetWaitingStarted = function () {
    messageSandbox.sendServiceMsg({ cmd: RunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD }, window.top);
};

IFrameRunner.prototype._onActionRun = function () {
    messageSandbox.sendServiceMsg({ cmd: RunnerBase.IFRAME_ACTION_RUN_CMD }, window.top);
};

IFrameRunner.prototype._onError = function (err) {

    if (!SETTINGS.get().PLAYBACK || err.dialog)
        this.stepIterator.stop();

    var msg = {
        cmd: RunnerBase.IFRAME_ERROR_CMD,
        err: err
    };

    messageSandbox.sendServiceMsg(msg, window.top);
};

IFrameRunner.prototype._onAssertionFailed = function (e) {
    var msg = {
        cmd: RunnerBase.IFRAME_FAILED_ASSERTION_CMD,
        err: e
    };

    this.stepIterator.state.needScreeshot = true;

    messageSandbox.sendServiceMsg(msg, window.top);

    if (SETTINGS.get().PLAYBACK)
        this.stepIterator.stop();
};

IFrameRunner.prototype._onSetStepsSharedData = function (e) {
    var msg = {
        cmd:        RunnerBase.IFRAME_SET_SHARED_DATA_CMD,
        sharedData: e.stepsSharedData
    };

    messageSandbox.sendServiceMsg(msg, window.top);
    e.callback();
};

IFrameRunner.prototype._onGetStepsSharedData = function (e) {
    var msg = {
        cmd: RunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD
    };

    messageSandbox.sendServiceMsg(msg, window.top);

    function onMessage (response) {
        if (response.message.cmd === RunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD) {
            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            e.callback(response.message.sharedData);
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);
};

IFrameRunner.prototype._onExpectInactivity = function (e) {
    var msg = {
        cmd:      RunnerBase.IFRAME_EXPECT_INACTIVITY_CMD,
        duration: e.duration
    };

    messageSandbox.sendServiceMsg(msg, window.top);
    e.callback();
};

IFrameRunner.prototype._onTakeScreenshot = function (e) {
    var msg = {
        cmd:          RunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD,
        isFailedStep: e.isFailedStep
    };

    messageSandbox.sendServiceMsg(msg, window.top);

    function onMessage (response) {
        if (response.message.cmd === RunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD) {
            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            if (e && e.callback)
                e.callback();
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);
};

IFrameRunner.prototype.onStepCompleted = function () {
    dialogsAPI.checkExpectedDialogs();
};

IFrameRunner.prototype._onDialogsInfoChanged = function (info) {
    var msg = {
        cmd:  RunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD,
        info: info
    };

    messageSandbox.sendServiceMsg(msg, window.top);
};

IFrameRunner.prototype._onBeforeUnload = function () {
    var iFrameTestRunner = this,
        msg              = {
            cmd: RunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD
        };

    function onMessage (response) {
        if (response.message.cmd === RunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD) {

            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);

            if (response.message.res) {
                if (iFrameTestRunner.stepIterator.state.stepDelayTimeout) {
                    window.clearTimeout(iFrameTestRunner.stepIterator.state.stepDelayTimeout);
                    iFrameTestRunner.stepIterator.state.stepDelayTimeout = null;
                }

                iFrameTestRunner.stepIterator.state.pageUnloading = false;
                iFrameTestRunner.stepIterator._runStep();
            }
        }
    }

    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, onMessage);

    messageSandbox.sendServiceMsg(msg, window.top);
};

export default IFrameRunner;
