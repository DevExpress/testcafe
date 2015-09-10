import * as hammerheadAPI from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import * as actionBarrier from './action-barrier/action-barrier';
import * as xhrBarrier from './action-barrier/xhr';
import async from './deps/async';

var browserUtils        = hammerheadAPI.Util.Browser;
var nativeMethods       = hammerheadAPI.NativeMethods;
var JSON                = hammerheadAPI.JSON;
var BEFORE_UNLOAD_EVENT = hammerheadAPI.BEFORE_UNLOAD_EVENT;
var hhBind              = hammerheadAPI.on;

var $            = testCafeCore.$;
var SETTINGS     = testCafeCore.SETTINGS;
var ERROR_TYPE       = testCafeCore.ERROR_TYPE;
var serviceUtils = testCafeCore.serviceUtils;
var domUtils     = testCafeCore.domUtils;


const STEP_DELAY                 = 500;
const PROLONGED_STEP_DELAY       = 3000;
const SHORT_PROLONGED_STEP_DELAY = 30;


//Iterator
var StepIterator = function (pingIFrame) {
    this.state = {
        step:                     0,
        stepNames:                null,
        testSteps:                null,
        pageUnloading:            false,
        stepDelayTimeout:         null,
        inAsyncAction:            false,
        prolongStepDelay:         false,
        shortProlongStepDelay:    false,
        stepsSharedData:          {},
        lastSyncedSharedDataJSON: null,
        stopped:                  false,
        waitedIFrame:             null,
        needScreeshot:            false
    };

    this.pingIFrame           = pingIFrame;
    this.globalWaitForEvent   = null;
    this.globalWaitForTimeout = null;

    this.eventEmitter = new serviceUtils.EventEmitter();
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
StepIterator.EXPECT_INACTIVITY_EVENT             = 'expectInactivity';
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
            code:     ERROR_TYPE.storeDomNodeOrJqueryObject,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME,
            stepNum:  this.state.step - 1
        };

        this.eventEmitter.emit(StepIterator.ERROR_EVENT, error);

        return false;
    }

    return true;
};

StepIterator.prototype._runStep = function () {
    this.state.stopped = false;

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

                iterator.state.inAsyncAction         = false;
                iterator.state.prolongStepDelay      = false;
                iterator.state.shortProlongStepDelay = false;

                try {
                    iterator.callWithSharedDataContext(stepToRun);
                } catch (err) {
                    error = {
                        code:      ERROR_TYPE.uncaughtJSErrorInTestCodeStep,
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

                    if (SETTINGS.get().TAKE_SCREENSHOT_ON_FAILS && iterator.state.needScreeshot) {
                        iterator.takeScreenshot(function () {
                            iterator.state.needScreeshot = false;
                            runCallback();
                        }, true);
                    }
                    else
                        runCallback();
                }
            });
        }
    });
};

StepIterator.prototype._setupUnloadPrediction = function () {
    var iterator     = this,
        $form        = $('form'),
        prolong      = function () {
            iterator.state.prolongStepDelay = true;
        },
        shortProlong = function () {
            iterator.state.shortProlongStepDelay = true;
        },
        beforeUnload = function () {
            iterator.state.pageUnloading = true;

            iterator.eventEmitter.emit(StepIterator.BEFORE_UNLOAD_EVENT_RAISED);
        },
        unload       = function () {
            iterator.state.pageUnloading = true;

            iterator.eventEmitter.emit(StepIterator.UNLOAD_EVENT_RAISED);
        };

    $(document).on('submit', 'form', prolong);

    $form.each(function () {
        var submit = this.submit;

        this.submit = function () {
            prolong();
            submit.apply(this, arguments);
        };
    });

    var skipBeforeUnloadEvent = false;

    nativeMethods.addEventListener.call(document, 'click', function (e) {
        var target = (e.srcElement || e.target);

        if (!e.defaultPrevented && target.tagName && target.tagName.toLowerCase() === 'a') {
            var href = $(target).attr('href');

            if (target.hasAttribute('href') && !/(^javascript:)|(^mailto:)|(^tel:)|(^#)/.test(href))
                prolong();
            else if (browserUtils.isIE)
                skipBeforeUnloadEvent = true;
        }
    });

    //NOTE: IE fires onbeforeunload even if link was just clicked without actual unloading
    function onBeforeUnloadIE () {
        shortProlong();

        window.setTimeout(function () {
            //NOTE: except file downloading
            if (document.readyState === 'loading' &&
                !(document.activeElement && document.activeElement.tagName.toLowerCase() === 'a' &&
                document.activeElement.getAttribute('download') !== null))
                beforeUnload();
        }, 0);
    }

    hhBind(BEFORE_UNLOAD_EVENT, browserUtils.isIE ? onBeforeUnloadIE : beforeUnload);

    hhBind(BEFORE_UNLOAD_EVENT, function () {
        skipBeforeUnloadEvent = false;
    });

    nativeMethods.windowAddEventListener.call(window, 'unload', unload);
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

StepIterator.prototype._completeAsyncAction = function () {
    var iterator = this;

    if (typeof iterator.state.stepDone === 'function' && !iterator.state.stepDoneCalled) {
        iterator.state.stepDone();
        iterator.state.stepDoneCalled = true;
    }

    if (iterator.state.stopped)
        return;

    var run = function () {
        if (!iterator.state.pageUnloading) {
            iterator._runStep();
            window.clearTimeout(iterator.state.stepDelayTimeout);
            iterator.state.stepDelayTimeout = null;
        }
    };

    //NOTE: browsers continues to execute script even if the request for the new page occurs. To workaround this
    //we are using heuristic-based delays for the next step execution (see setupUnloadPrediction() method).
    iterator.state.stepDelayTimeout = window.setTimeout(function () {
        if (iterator.state.prolongStepDelay || iterator.state.shortProlongStepDelay) {
            iterator.state.stepDelayTimeout = window.setTimeout(function () {
                run();
            }, iterator.state.prolongStepDelay ? PROLONGED_STEP_DELAY : SHORT_PROLONGED_STEP_DELAY);
        }
        else
            run();
    }, STEP_DELAY);
};

StepIterator.prototype.callWithSharedDataContext = function (func) {
    return func.apply(this.state.stepsSharedData);
};

StepIterator.prototype._checkIFrame = function (element, callback) {
    if (window.top !== window.self || !domUtils.isElementInIframe(element)) {
        callback(null);
        return;
    }

    var iFrame = domUtils.getIFrameByElement(element);

    this.pingIFrame(iFrame, function () {
        callback(iFrame);
    });

};

StepIterator.prototype.asyncAction = function (action) {
    var iterator = this;

    this.state.inAsyncAction = true;

    var actionRun = function () {
        iterator._syncSharedDataWithServer(function () {
            actionBarrier.waitActionSideEffectsCompletion(action, function () {
                iterator._completeAsyncAction.apply(iterator, arguments);
            });
        });
    };

    if (SETTINGS.get().TAKE_SCREENSHOT_ON_FAILS && this.state.needScreeshot) {
        this.takeScreenshot(function () {
            iterator.state.needScreeshot = false;
            actionRun();
        }, true);
    }
    else
        actionRun();
};

StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
    var iterator = this;

    var actionsRun = function () {
        var seriesActionsRun = function (elements, callback) {
            async.forEachSeries(
                elements,
                function (element, asyncCallback) {
                    //NOTE: since v.14.1.5 it's recommended to run actions with the inIFrame function. But we should support old-style iframes
                    //using, so, it'll be resolved here.
                    iterator._checkIFrame(element, function (iframe) {
                        if (!iframe) {
                            actionBarrier.waitActionSideEffectsCompletion(function (barrierCallback) {
                                action(element, barrierCallback);
                            }, asyncCallback);
                        }
                        else {
                            var iFrameStartXhrBarrier = iframe.contentWindow[xhrBarrier.GLOBAL_START_XHR_BARRIER],
                                iFrameWaitXhrBarrier  = iframe.contentWindow[xhrBarrier.GLOBAL_WAIT_XHR_BARRIER];

                            actionBarrier.waitActionSideEffectsCompletion(function (barrierCallback) {
                                var iFrameBeforeUnloadRaised = false;

                                iterator.iFrameActionCallback = function () {
                                    iterator.iFrameActionCallback = null;
                                    iterator.waitedIFrame         = null;
                                    barrierCallback();
                                };

                                iterator.waitedIFrame = iframe;

                                iFrameStartXhrBarrier(function () {
                                    if (!iFrameBeforeUnloadRaised)
                                        iterator.iFrameActionCallback();
                                });

                                function onBeforeUnload () {
                                    nativeMethods.windowRemoveEventListener.call(iframe.contentWindow, 'beforeunload', onBeforeUnload);
                                    iFrameBeforeUnloadRaised = true;
                                }

                                nativeMethods.windowAddEventListener.call(iframe.contentWindow, 'beforeunload', onBeforeUnload, true);

                                action(element, function () {
                                    iFrameWaitXhrBarrier();
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

    iterator.state.inAsyncAction = true;

    if (SETTINGS.get().TAKE_SCREENSHOT_ON_FAILS && this.state.needScreeshot) {
        this.takeScreenshot(function () {
            iterator.state.needScreeshot = false;
            actionsRun();
        }, true);
    }
    else
        actionsRun();
};

StepIterator.prototype._init = function () {
    this.initialized = true;

    this._setupUnloadPrediction();
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

    this.eventEmitter.emit(StepIterator.ERROR_EVENT, $.extend({
        stepNum: this.state.step - 1
    }, err));
};

StepIterator.prototype.onAssertionFailed = function (err) {
    if (this.state.stopped)
        return;

    this.eventEmitter.emit(StepIterator.ASSERTION_FAILED_EVENT, {
        err:         err,
        stepNum:     this.state.step - 1,
        isAssertion: true
    });
};

StepIterator.prototype.expectInactivity = function (duration, callback) {
    this.eventEmitter.emit(StepIterator.EXPECT_INACTIVITY_EVENT, {
        duration: duration,
        callback: callback
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

//Global __waitFor()
StepIterator.prototype.setGlobalWaitFor = function (event, timeout) {
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

    var timeoutID = window.setTimeout(function () {
        iterator.onError({
            code:     ERROR_TYPE.waitForActionTimeoutExceeded,
            stepName: SETTINGS.get().CURRENT_TEST_STEP_NAME
        });
    }, this.globalWaitForTimeout);


    this.expectInactivity(this.globalWaitForTimeout, function () {
        iterator.callWithSharedDataContext(function () {
            iterator.globalWaitForEvent.call(this, function () {
                window.clearTimeout(timeoutID);
                callback();
            });
        });
    });
};

StepIterator.prototype.takeScreenshot = function (callback, isFailedStep) {
    this.eventEmitter.emit(StepIterator.TAKE_SCREENSHOT_EVENT, {
        isFailedStep: isFailedStep,
        callback:     callback
    });
};


export default StepIterator;
