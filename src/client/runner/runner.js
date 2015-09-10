import * as hammerheadAPI from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import RunnerBase from './runner-base';

var browserUtils = hammerheadAPI.Util.Browser;

var SETTINGS     = testCafeCore.SETTINGS;
var COMMAND      = testCafeCore.COMMAND;
var ERROR_TYPE   = testCafeCore.ERROR_TYPE;
var transport    = testCafeCore.transport;
var serviceUtils = testCafeCore.serviceUtils;


const WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY = 1000;


var Runner = function (startedCallback) {
    var runner = this;

    RunnerBase.apply(this, [startedCallback]);

    transport.startInactivityMonitor(function () {
        runner._onError({
            code: ERROR_TYPE.testInactivity
        });
    });
};

serviceUtils.inherit(Runner, RunnerBase);

Runner.prototype._onTestComplete = function (e) {
    transport.waitForServiceMessagesCompleted(function () {
        var testCompleteMsg = {
            cmd: COMMAND.done
        };

        transport.asyncServiceMsg(testCompleteMsg, function () {
            e.callback();
            transport.switchToWorkerIdle();
        });
    }, WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY);
};

Runner.prototype._onNextStepStarted = function (e) {
    var nextStepMsg = {
        cmd:      COMMAND.setNextStep,
        nextStep: e.nextStep
    };

    transport.asyncServiceMsg(nextStepMsg, e.callback);
};

//NOTE: decrease step counter while an action is waiting for element available and decrease it when action running started (T230851)
Runner.prototype._onActionTargetWaitingStarted = function (e) {
    RunnerBase.prototype._onActionTargetWaitingStarted.apply(this, [e]);

    var msg = {
        cmd:   COMMAND.setActionTargetWaiting,
        value: true
    };

    transport.asyncServiceMsg(msg);
};

Runner.prototype._onActionRun = function () {
    RunnerBase.prototype._onActionRun.apply(this, []);

    var msg = {
        cmd:   COMMAND.setActionTargetWaiting,
        value: false
    };

    transport.asyncServiceMsg(msg);
};

Runner.prototype._onError = function (err) {
    var runner = this;

    if (this.stopped)
        return;

    //NOTE: we should stop stepIterator to prevent playback after an error is occurred
    this.stepIterator.stop();

    RunnerBase.prototype._onError.call(this, err);

    if (!SETTINGS.get().TAKE_SCREENSHOT_ON_FAILS) {
        this.stopped = true;
        transport.fail(err);
        return;
    }

    var setErrorMsg = {
        cmd: COMMAND.setTestError,
        err: err
    };

    transport.asyncServiceMsg(setErrorMsg);

    this._onTakeScreenshot({
        isFailedStep: true,
        //TODO:
        //withoutStepName: !(ERRORS.hasErrorStepName(err) && ERRORS.hasErrorStepName(err)),
        callback:     function () {
            runner.stopped = true;
            transport.fail(err);
        }
    });
};

Runner.prototype._onAssertionFailed = function (e, inIFrame) {
    this.stepIterator.state.needScreeshot = !inIFrame;
    transport.assertionFailed(e.err);
};

Runner.prototype._onSetStepsSharedData = function (e) {
    var msg = {
        cmd:             COMMAND.setStepsSharedData,
        stepsSharedData: e.stepsSharedData
    };

    transport.asyncServiceMsg(msg, function () {
        e.callback();
    });
};

Runner.prototype._onGetStepsSharedData = function (e) {
    var msg = { cmd: COMMAND.getStepsSharedData };

    transport.asyncServiceMsg(msg, e.callback);
};

Runner.prototype._onExpectInactivity = function (e) {
    transport.expectInactivity(e.duration, e.callback);
};

Runner.prototype._onTakeScreenshot = function (e) {
    var savedTitle  = document.title,
        windowMark  = '[tc-' + Date.now() + ']',
        browserName = null,
        callback    = e && e.callback ? e.callback : function () {
        },
        runner      = this;

    runner.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_STARTED_EVENT, {});


    if (browserUtils.isMSEdge)
        browserName = 'MSEDGE';
    else if (browserUtils.isSafari)
        browserName = 'SAFARI';
    else if (browserUtils.isOpera || browserUtils.isOperaWithWebKit)
        browserName = 'OPERA';
    else if (browserUtils.isWebKit)
        browserName = 'CHROME';
    else if (browserUtils.isMozilla)
        browserName = 'FIREFOX';
    else if (browserUtils.isIE)
        browserName = 'IE';

    var msg = {
        cmd:             'CMD_TAKE_SCREENSHOT', //TODO: fix
        windowMark:      windowMark,
        browserName:     browserName,
        isFailedStep:    e.isFailedStep,
        withoutStepName: e.withoutStepName,
        url:             window.location.toString()
    };

    var assignedTitle        = savedTitle + windowMark,
        checkTitleIntervalId = window.setInterval(function () {
            if (document.title !== assignedTitle) {
                savedTitle     = document.title;
                document.title = assignedTitle;
            }
        }, 50);

    document.title = assignedTitle;

    //NOTE: we should set timeouts to changing of document title
    //in any case we are waiting response from server
    window.setTimeout(function () {
        transport.asyncServiceMsg(msg, function () {
            window.clearInterval(checkTitleIntervalId);
            checkTitleIntervalId = null;
            document.title       = savedTitle;
            runner.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT, {});

            window.setTimeout(function () {
                callback();
            }, 100);
        });
    }, 500);
};

Runner.prototype._onDialogsInfoChanged = function (info) {
    transport.asyncServiceMsg({
        cmd:       COMMAND.nativeDialogsInfoSet,
        info:      info,
        timeStamp: Date.now()
    });
};


export default Runner;
