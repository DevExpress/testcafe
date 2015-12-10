import escapeHtml from 'escape-html';
import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import RunnerBase from './runner-base';
import * as browser from '../browser';


var SETTINGS     = testCafeCore.SETTINGS;
var COMMAND      = testCafeCore.COMMAND;
var transport    = testCafeCore.transport;
var serviceUtils = testCafeCore.serviceUtils;
var Promise      = hammerhead.Promise;


const WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY = 1000;
const APPLY_DOCUMENT_TITLE_TIMEOUT                 = 500;
const RESTORE_DOCUMENT_TITLE_TIMEOUT               = 100;
const CHECK_TITLE_INTERVAL                         = 50;

var Runner = function (startedCallback, err) {
    RunnerBase.apply(this, [startedCallback]);

    if (err)
        this._onFatalError(err);
};

serviceUtils.inherit(Runner, RunnerBase);

//Static
Runner.startHeartbeat = function (heartbeatUrl) {
    browser.startHeartbeat(heartbeatUrl, hammerhead.nativeMethods.XMLHttpRequest);
};

Runner.checkStatus = function () {
    browser.checkStatus(SETTINGS.get().BROWSER_STATUS_URL, hammerhead.nativeMethods.XMLHttpRequest);
};


Runner.prototype._onTestComplete = function (e) {
    this.stopped = true;

    transport.waitForServiceMessagesCompleted(WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY, function () {
        var testCompleteMsg = {
            cmd: COMMAND.done
        };

        transport.asyncServiceMsg(testCompleteMsg, function () {
            e.callback();
            Runner.checkStatus();
        });
    });
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

Runner.prototype._beforeScreenshot = function () {
    this.stepIterator.suspend();
    this.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_STARTED_EVENT, {});
    this.savedDocumentTitle = document.title;

    var assignedTitle = `[ ${window.location.toString()} ]`;

    // NOTE: we should keep the page url in document.title
    // while the screenshot is being created
    this.checkTitleIntervalId = window.setInterval(() => {
        if (document.title !== assignedTitle) {
            this.savedDocumentTitle = document.title;
            document.title          = assignedTitle;
        }
    }, CHECK_TITLE_INTERVAL);

    document.title = assignedTitle;

    return new Promise(resolve => window.setTimeout(resolve), APPLY_DOCUMENT_TITLE_TIMEOUT);
};

Runner.prototype._afterScreenshot = function () {
    window.clearInterval(this.checkTitleIntervalId);

    document.title            = this.savedDocumentTitle;
    this.checkTitleIntervalId = null;
    this.savedDocumentTitle   = null;

    this.eventEmitter.emit(RunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT, {});
    this.stepIterator.resume();

    return new Promise(resolve => window.setTimeout(resolve), RESTORE_DOCUMENT_TITLE_TIMEOUT);
};

Runner.prototype._reportErrorToServer = function (err, isAssertion) {
    return new Promise(resolve => {
        if (isAssertion)
            transport.assertionFailed(err, resolve);
        else
            transport.fatalError(err, resolve);
    });
};

Runner.prototype._onTestError = function (err, isAssertion) {
    // NOTE: we should not create multiple screenshots for a step. Create a screenshot if
    // it's the first error at this step or it's an error that occurs on page initialization.
    err.pageUrl            = document.location.toString();
    err.screenshotRequired = SETTINGS.get().TAKE_SCREENSHOTS && SETTINGS.get().TAKE_SCREENSHOTS_ON_FAILS &&
                             this.stepIterator.state.curStepErrors.length < 2;

    // NOTE: we should escape the test name because it may contain markup (GH-160)
    if (err.stepName)
        err.stepName = escapeHtml(err.stepName);

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

    this._onTestError(err)
        .then(Runner.checkStatus);
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
                    pageUrl:    document.location.toString(),
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
