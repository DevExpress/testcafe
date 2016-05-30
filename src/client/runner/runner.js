import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import RunnerBase from './runner-base';
import TestContextStorage from './test-context-storage';
import * as browser from '../browser';


var SETTINGS      = testCafeCore.SETTINGS;
var COMMAND       = testCafeCore.COMMAND;
var transport     = testCafeCore.transport;
var serviceUtils  = testCafeCore.serviceUtils;
var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;


const WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY = 1000;
const APPLY_DOCUMENT_TITLE_TIMEOUT                 = 500;
const RESTORE_DOCUMENT_TITLE_TIMEOUT               = 100;
const CHECK_TITLE_INTERVAL                         = 50;


var beforeUnloadRaised = false;

hammerhead.on(hammerhead.EVENTS.beforeUnload, () => beforeUnloadRaised = true);

var Runner = function (startedCallback, testRunId) {
    RunnerBase.apply(this, [startedCallback]);

    this.testRunId          = testRunId;
    this.testContextStorage = new TestContextStorage(window, testRunId);

    if (!this.testContextStorage.get()) {
        this.testContextStorage.set({
            nextStep:            0,
            actionTargetWaiting: false,
            testError:           null
        });
    }

    var { nextStep, actionTargetWaiting, testError } = this.testContextStorage.get();

    this.nextStep = actionTargetWaiting ? nextStep - 1 : nextStep;

    if (testError)
        this._onFatalError(testError);
};

serviceUtils.inherit(Runner, RunnerBase);

//Static
Runner.startHeartbeat = function (heartbeatUrl) {
    browser.startHeartbeat(heartbeatUrl, hammerhead.createNativeXHR);
};

Runner.checkStatus = function () {
    browser.checkStatus(SETTINGS.get().BROWSER_STATUS_URL, hammerhead.createNativeXHR);
};


Runner.prototype._onTestComplete = function (e) {
    this.stopped = true;

    transport.waitForServiceMessagesCompleted(WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY, () => {
        var testCompleteMsg = {
            cmd: COMMAND.done
        };

        transport.asyncServiceMsg(testCompleteMsg, () => {
            e.callback();

            this.testContextStorage.dispose();
            Runner.checkStatus();
        });
    });
};

Runner.prototype._onNextStepStarted = function (e) {
    this.testContextStorage.setProperty('nextStep', e.nextStep);

    e.callback();
};

// NOTE: decrease the step counter if the action restarts while waiting for an element to be available (T230851)
Runner.prototype._onActionTargetWaitingStarted = function (e) {
    RunnerBase.prototype._onActionTargetWaitingStarted.apply(this, [e]);

    this.testContextStorage.setProperty('actionTargetWaiting', true);
};

Runner.prototype._onActionRun = function () {
    RunnerBase.prototype._onActionRun.apply(this, []);

    this.testContextStorage.setProperty('actionTargetWaiting', false);
};

Runner.prototype._beforeScreenshot = function () {
    this.stepIterator.suspend();
    this.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_STARTED_EVENT, {});
    this.savedDocumentTitle = document.title;

    var assignedTitle = this.testRunId;

    // NOTE: we should keep the page url in document.title
    // while the screenshot is being created
    this.checkTitleIntervalId = nativeMethods.setInterval.call(window, () => {
        if (document.title !== assignedTitle) {
            this.savedDocumentTitle = document.title;
            document.title          = assignedTitle;
        }
    }, CHECK_TITLE_INTERVAL);

    document.title = assignedTitle;

    return new Promise(resolve => nativeMethods.setTimeout.call(window, resolve, APPLY_DOCUMENT_TITLE_TIMEOUT));
};

Runner.prototype._afterScreenshot = function () {
    window.clearInterval(this.checkTitleIntervalId);

    document.title            = this.savedDocumentTitle;
    this.checkTitleIntervalId = null;
    this.savedDocumentTitle   = null;

    this.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT, {});
    this.stepIterator.resume();

    return new Promise(resolve => nativeMethods.setTimeout.call(window, resolve, RESTORE_DOCUMENT_TITLE_TIMEOUT));
};

Runner.prototype._reportErrorToServer = function (err, isAssertion) {
    return new Promise(resolve => {
        if (isAssertion)
            transport.assertionFailed(err, resolve);
        else {
            this.testContextStorage.dispose();
            transport.fatalError(err, resolve);
        }
    });
};

Runner.prototype._onTestError = function (err, isAssertion) {
    // NOTE: we should not create multiple screenshots for a step. Create a screenshot if
    // it's the first error at this step or it's an error that occurs on page initialization.
    if (!err.hasOwnProperty('screenshotRequired'))
        err.screenshotRequired = SETTINGS.get().TAKE_SCREENSHOTS && SETTINGS.get().TAKE_SCREENSHOTS_ON_FAILS &&
                                 this.stepIterator.state.curStepErrors.length < 2;

    var errorProcessingChain = Promise.resolve();

    if (err.screenshotRequired)
        errorProcessingChain = errorProcessingChain.then(() => this._beforeScreenshot());

    errorProcessingChain = errorProcessingChain.then(() => this._reportErrorToServer(err, isAssertion));

    if (err.screenshotRequired)
        errorProcessingChain = errorProcessingChain.then(() => this._afterScreenshot());

    return errorProcessingChain;
};

Runner.prototype._onFatalError = function (err) {
    if (this.stopped)
        return;

    this.stopped = true;
    this.stepIterator.stop();

    RunnerBase.prototype._onFatalError.call(this, err);

    // NOTE: we should not stop the test running if an error occurs during page unload. As a result, we
    // would destroy the session and wouldn't be able to get the next page in the browser.
    // We have to set the deferred error to the task to have the test fail after page reload.
    if (beforeUnloadRaised) {
        err.screenshotRequired = false;
        this.testContextStorage.setProperty('testError', err);
    }
    else {
        this.
            _onTestError(err)
            .then(Runner.checkStatus);
    }
};

Runner.prototype._onAssertionFailed = function (e) {
    this._onTestError(e.err, true);
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

Runner.prototype._onTakeScreenshot = function (e) {
    if (!SETTINGS.get().TAKE_SCREENSHOTS)
        return typeof e.callback === 'function' ? e.callback() : null;

    this
        ._beforeScreenshot()
        .then(() => {
            return new Promise(resolve => {
                var msg = {
                    cmd:        COMMAND.takeScreenshot,
                    stepName:   e.stepName,
                    customPath: e.filePath
                };

                transport.asyncServiceMsg(msg, resolve);
            });
        })
        .then(() => this._afterScreenshot())
        .then(() => {
            if (typeof e.callback === 'function')
                e.callback();
        });
};

Runner.prototype._onDialogsInfoChanged = function (info) {
    transport.asyncServiceMsg({
        cmd:       COMMAND.nativeDialogsInfoSet,
        info:      info,
        timeStamp: Date.now()
    });
};


export default Runner;
