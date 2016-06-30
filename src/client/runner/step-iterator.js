import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import async from './deps/async';

var browserUtils  = hammerhead.utils.browser;
var JSON          = hammerhead.json;
var nativeMethods = hammerhead.nativeMethods;

var SETTINGS          = testCafeCore.SETTINGS;
var ERROR_TYPE        = testCafeCore.ERROR_TYPE;
var RequestBarrier    = testCafeCore.RequestBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var serviceUtils      = testCafeCore.serviceUtils;
var domUtils          = testCafeCore.domUtils;
var eventUtils        = testCafeCore.eventUtils;


const SUSPEND_ACTIONS = {
    runStep:           'runStep',
    asyncAction:       'asyncAction',
    asyncActionSeries: 'asyncActionSeries'
};


//Iterator
var StepIterator = function (pingIframe) {
    this.state = {
        step:                     0,
        stepNames:                null,
        testSteps:                null,
        inAsyncAction:            false,
        stepsSharedData:          {},
        lastSyncedSharedDataJSON: null,
        stopped:                  false,
        suspended:                false,
        suspendedAction:          null,
        suspendedArgs:            [],
        waitedIFrame:             null,
        curStepErrors:            []
    };

    this.pingIframe           = pingIframe;
    this.globalWaitForEvent   = null;
    this.globalWaitForTimeout = null;

    this.eventEmitter      = new serviceUtils.EventEmitter();
    this.pageUnloadBarrier = pageUnloadBarrier;
};

//Events
StepIterator.TEST_COMPLETE_EVENT                 = 'testComplete';
StepIterator.NEXT_STEP_STARTED_EVENT             = 'nextStepStarted';
StepIterator.ACTION_TARGET_WAITING_STARTED_EVENT = 'actionTargetWaitingStarted';
StepIterator.ACTION_RUN_EVENT                    = 'actionRun';
StepIterator.ERROR_EVENT                         = 'error';
StepIterator.ASSERTION_FAILED_EVENT              = 'assertionFailed';
StepIterator.SET_STEPS_SHARED_DATA_EVENT         = 'setStepsSharedData';
StepIterator.GET_STEPS_SHARED_DATA_EVENT         = 'getStepsSharedData';
StepIterator.TAKE_SCREENSHOT_EVENT               = 'takeScreenshot';
StepIterator.BEFORE_UNLOAD_EVENT_RAISED          = 'beforeUnload';
StepIterator.UNLOAD_EVENT_RAISED                 = 'unload';

StepIterator.prototype.on = function () {
    return this.eventEmitter.on.apply(this.eventEmitter, arguments);
};

StepIterator.prototype._checkSharedDataSerializable = function () {
    var error = null;

    if (!JSON.isSerializable(this.state.stepsSharedData)) {
        error = {
            type:     ERROR_TYPE.storeDomNodeOrJqueryObject,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME,
            stepNum:  this.state.step - 1
        };

        this.eventEmitter.emit(StepIterator.ERROR_EVENT, error);

        return false;
    }

    return true;
};

StepIterator.prototype._runStep = function () {
    if (this.state.suspended) {
        this.state.suspendedAction = SUSPEND_ACTIONS.runStep;
        return;
    }

    this.state.stopped       = false;
    this.state.curStepErrors = [];

    var iterator = this;

    if (iterator.state.step > 0 && !iterator.state.stepDoneCalled &&
        typeof iterator.state.stepDone === 'function') {
        iterator.state.stepDone();
        iterator.state.stepDoneCalled = true;
    }

    if (this.state.stopped)
        return;

    if (iterator.state.step >= iterator.state.testSteps.length) {
        this.eventEmitter.emit(StepIterator.TEST_COMPLETE_EVENT, {
            callback: function () {
                iterator.state.runningCopmlete = true;
            }
        });

        return;
    }

    SETTINGS.get().CURRENT_TEST_STEP_NAME = iterator.state.stepNames[iterator.state.step];

    var stepToRun = iterator.state.testSteps[iterator.state.step];

    iterator.state.step++;

    iterator.eventEmitter.emit(StepIterator.NEXT_STEP_STARTED_EVENT, {
        nextStep: iterator.state.step,
        callback: function () {
            iterator.__waitFor(function () {
                var error = null;

                if (typeof iterator.state.stepSetup === 'function')
                    iterator.state.stepSetup();

                iterator.state.stepDoneCalled = false;

                iterator.state.inAsyncAction = false;

                try {
                    iterator.callWithSharedDataContext(stepToRun);
                } catch (err) {
                    error = {
                        type:      ERROR_TYPE.uncaughtJSErrorInTestCodeStep,
                        scriptErr: (err && err.message) || err,
                        stepName:  SETTINGS.get().CURRENT_TEST_STEP_NAME,
                        stepNum:   iterator.state.step - 1
                    };

                    iterator.eventEmitter.emit(StepIterator.ERROR_EVENT, error);
                }

                if (iterator.state.stopped)
                    return;

                var runCallback = function () {
                    if (typeof iterator.state.stepDone === 'function' && !iterator.state.stepDoneCalled) {
                        iterator.state.stepDone();
                        iterator.state.stepDoneCalled = true;
                    }

                    iterator._runStep();
                };

                //NOTE: don't run next step if previous step initiated async action
                if (!iterator.state.inAsyncAction) {
                    //NOTE: validate shared data changes that were made on this step (see: B236594)
                    //If there was an action in the step, validation must be performed in _syncSharedData
                    //  before serialization.
                    if (!iterator._checkSharedDataSerializable())
                        return;

                    runCallback();
                }
            });
        }
    });
};

StepIterator.prototype._setupUnloadHandlers = function () {
    var iterator       = this;
    var onBeforeUnload = () => iterator.eventEmitter.emit(StepIterator.BEFORE_UNLOAD_EVENT_RAISED);
    var onUnload       = () => iterator.eventEmitter.emit(StepIterator.UNLOAD_EVENT_RAISED);

    //NOTE: IE fires onbeforeunload even if link was just clicked without actual unloading
    function onBeforeUnloadIE () {
        nativeMethods.setTimeout.call(window, function () {
            //NOTE: except file downloading
            if (document.readyState === 'loading' &&
                !(document.activeElement && domUtils.isAnchorElement(document.activeElement) &&
                document.activeElement.hasAttribute('download')))
                onBeforeUnload();
        }, 0);
    }

    hammerhead.on(hammerhead.EVENTS.beforeUnload, browserUtils.isIE ? onBeforeUnloadIE : onBeforeUnload);
    eventUtils.bind(window, 'unload', onUnload);
};

StepIterator.prototype._syncSharedDataWithServer = function (callback) {
    var iterator       = this,
        sharedDataJSON = '';

    if (!iterator._checkSharedDataSerializable())
        return;

    sharedDataJSON = JSON.stringify(iterator.state.stepsSharedData);

    //NOTE: avoid unnecessary shared data sync if it's not changed
    if (iterator.state.lastSyncedSharedDataJSON === sharedDataJSON) {
        if (typeof callback === 'function')
            callback();
    }
    else {
        iterator.eventEmitter.emit(StepIterator.SET_STEPS_SHARED_DATA_EVENT, {
            stepsSharedData: iterator.state.stepsSharedData,
            callback:        function () {
                iterator.state.lastSyncedSharedDataJSON = sharedDataJSON;

                if (typeof callback === 'function')
                    callback();
            }
        });
    }
};

StepIterator.prototype._waitActionSideEffectsCompletion = function (action, callback) {
    var requestBarrier = new RequestBarrier();

    action.call(window, () => {
        requestBarrier
            .wait()
            .then(callback);
    });
};

StepIterator.prototype._completeAsyncAction = function () {
    var iterator = this;

    if (iterator.state.stopped)
        return;

    this.pageUnloadBarrier
        .wait({isLegacy: true})
        .then(() => iterator._runStep());
};

StepIterator.prototype.callWithSharedDataContext = function (func) {
    return func.apply(this.state.stepsSharedData);
};

StepIterator.prototype._checkIFrame = function (element, callback) {
    if (window.top !== window.self || !domUtils.isElementInIframe(element)) {
        callback(null);
        return;
    }

    var iFrame = domUtils.getIframeByElement(element);

    this
        .pingIframe(iFrame)
        .then(() => callback(iFrame))
        .catch(() => callback(iFrame));
};

StepIterator.prototype.asyncAction = function (action) {
    if (this.state.suspended) {
        this.state.suspendedAction = SUSPEND_ACTIONS.asyncAction;
        this.state.suspendedArgs   = arguments;
        return;
    }

    var iterator = this;

    this.state.inAsyncAction = true;

    iterator._waitActionSideEffectsCompletion(action, function () {
        iterator._completeAsyncAction.apply(iterator, arguments);
    });
    iterator._syncSharedDataWithServer(function () {
    });
};

StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
    if (this.state.suspended) {
        this.state.suspendedAction = SUSPEND_ACTIONS.asyncActionSeries;
        this.state.suspendedArgs   = arguments;
        return;
    }

    var iterator = this;

    iterator.state.inAsyncAction = true;

    var seriesActionsRun = function (elements, callback) {
        async.forEachSeries(
            elements,
            function (element, asyncCallback) {
                // NOTE: since v.14.1.5 it's recommended to run actions using the inIFrame function.
                // But we should support old-style iframes, so it'll be resolved here.
                iterator._checkIFrame(element, function (iframe) {
                    if (!iframe) {
                        iterator._waitActionSideEffectsCompletion(function (barrierCallback) {
                            action(element, barrierCallback);
                        }, asyncCallback);
                    }
                    else {
                        iterator._waitActionSideEffectsCompletion(function (barrierCallback) {
                            var iFrameBeforeUnloadRaised = false;

                            iterator.iFrameActionCallback = function () {
                                iterator.iFrameActionCallback = null;
                                iterator.waitedIFrame         = null;
                                barrierCallback();
                            };

                            iterator.waitedIFrame = iframe;

                            function onBeforeUnload () {
                                eventUtils.unbind(iframe.contentWindow, 'beforeunload', onBeforeUnload);
                                iFrameBeforeUnloadRaised = true;
                            }

                            eventUtils.bind(iframe.contentWindow, 'beforeunload', onBeforeUnload);

                            var IframeRequestBarrier = iframe.contentWindow[RequestBarrier.GLOBAL_REQUEST_BARRIER_FIELD];
                            var iframeRequestBarrier = new IframeRequestBarrier();

                            action(element, () => {
                                iframeRequestBarrier
                                    .wait()
                                    .then(() => {
                                        if (!iFrameBeforeUnloadRaised)
                                            iterator.iFrameActionCallback();
                                    });
                            }, iframe);
                        }, asyncCallback);
                    }
                });
            },
            function () {
                if (iterator.state.stopped)
                    return;

                callback();
            });
    };

    iterator._syncSharedDataWithServer(function () {
        runArgumentsIterator(items, seriesActionsRun, function () {
            iterator._completeAsyncAction.apply(iterator, arguments);
        });
    });
};

StepIterator.prototype._init = function () {
    this.initialized = true;

    this._setupUnloadHandlers();
    this.pageUnloadBarrier.init();
};

StepIterator.prototype.start = function (stepNames, testSteps, stepSetup, stepDone, nextStep) {
    this._init();

    this.runSteps(stepNames, testSteps, stepSetup, stepDone, nextStep);
};

StepIterator.prototype.stop = function () {
    //NOTE: this flag created for playback in recording mode
    // to prevent test playback after error raised
    //and in test running to prevent playback during screenshot making
    this.state.stopped = true;
};

StepIterator.prototype.runSteps = function (stepNames, testSteps, stepSetup, stepDone, nextStep) {
    if (!this.initialized)
        this._init();

    var iterator = this;

    iterator.state.testSteps       = testSteps;
    iterator.state.stepNames       = stepNames;
    iterator.state.inAsyncAction   = false;
    iterator.state.step            = nextStep;
    iterator.state.stepSetup       = stepSetup;
    iterator.state.stepDone        = stepDone;
    iterator.state.runningCopmlete = false;

    iterator.eventEmitter.emit(StepIterator.GET_STEPS_SHARED_DATA_EVENT, {
        callback: function (sharedData) {
            iterator.state.stepsSharedData          = sharedData || {};
            iterator.state.lastSyncedSharedDataJSON = JSON.stringify(iterator.state.stepsSharedData);
            iterator._runStep();
        }
    });
};

StepIterator.prototype.getSharedData = function () {
    return this.state.stepsSharedData;
};

StepIterator.prototype.setSharedData = function (data) {
    this.state.stepsSharedData = data;
    this._syncSharedDataWithServer();
};

StepIterator.prototype.onError = function (err) {
    if (this.state.stopped)
        return;

    this.state.curStepErrors.push(err);


    this.eventEmitter.emit(StepIterator.ERROR_EVENT, hammerhead.utils.extend({
        stepNum: this.state.step - 1
    }, err));
};

StepIterator.prototype.onAssertionFailed = function (err) {
    if (this.state.stopped)
        return;

    this.state.curStepErrors.push(err);

    this.eventEmitter.emit(StepIterator.ASSERTION_FAILED_EVENT, {
        err:         err,
        stepNum:     this.state.step - 1,
        isAssertion: true
    });
};

StepIterator.prototype.runNext = function () {
    this._runStep();
};

StepIterator.prototype.runLast = function () {
    this.state.step--;
    this.runNext();
};

StepIterator.prototype.getCurrentStep = function () {
    return this.state.stepNames ? this.state.stepNames[this.state.step - 1] : SETTINGS.get().CURRENT_TEST_STEP_NAME;
};

StepIterator.prototype.getCurrentStepNum = function () {
    return this.state.step - 1;
};

StepIterator.prototype.onActionTargetWaitingStarted = function (e) {
    this.eventEmitter.emit(StepIterator.ACTION_TARGET_WAITING_STARTED_EVENT, e);
};

StepIterator.prototype.onActionRun = function () {
    this.eventEmitter.emit(StepIterator.ACTION_RUN_EVENT, {});
};

StepIterator.prototype.suspend = function () {
    // NOTE: in fact we can suspend the iterator before
    // the next step or an async action run
    this.state.suspended = true;
};

StepIterator.prototype.resume = function () {
    if (!this.state.suspended || this.state.stopped)
        return;

    this.state.suspended = false;

    if (this.state.suspendedAction === SUSPEND_ACTIONS.runStep)
        this._runStep();

    if (this.state.suspendedAction === SUSPEND_ACTIONS.asyncAction)
        this.asyncAction.apply(this, this.state.suspendedArgs);

    if (this.state.suspendedAction === SUSPEND_ACTIONS.asyncActionSeries)
        this.asyncActionSeries.apply(this, this.state.suspendedArgs);

    this.state.suspendedAction = null;
    this.state.suspendedArgs   = [];
};


//Global __waitFor()
StepIterator.prototype.setGlobalWaitFor = function (event, timeout) {
    if (typeof event !== 'function') {
        this.onError({
            type:     ERROR_TYPE.incorrectGlobalWaitForActionEventArgument,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME
        });
    }

    if (typeof timeout !== 'number') {
        this.onError({
            type:     ERROR_TYPE.incorrectGlobalWaitForActionTimeoutArgument,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME
        });
    }

    this.globalWaitForEvent   = event;
    this.globalWaitForTimeout = timeout;
};

StepIterator.prototype.__waitFor = function (callback) {
    var iterator = this;

    if (typeof this.globalWaitForEvent !== 'function') {
        callback();
        return;
    }

    if (typeof this.globalWaitForTimeout !== 'number')
        this.globalWaitForTimeout = 0;

    var timeoutID = nativeMethods.setTimeout.call(window, function () {
        iterator.onError({
            type:     ERROR_TYPE.globalWaitForActionTimeoutExceeded,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME
        });
    }, this.globalWaitForTimeout);

    iterator.callWithSharedDataContext(function () {
        iterator.globalWaitForEvent.call(iterator, function () {
            window.clearTimeout(timeoutID);
            callback();
        });
    });
};

StepIterator.prototype.takeScreenshot = function (callback, filePath) {
    this.eventEmitter.emit(StepIterator.TAKE_SCREENSHOT_EVENT, {
        stepName: this.getCurrentStep(),
        filePath: filePath || '',
        callback: callback
    });
};


export default StepIterator;
