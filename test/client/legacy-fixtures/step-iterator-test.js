var testCafeCore = window.getTestCafeModule('testCafeCore');
var eventUtils   = testCafeCore.get('./utils/event');

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var COMMAND              = testCafeLegacyRunner.get('../test-run/command');
var ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var SETTINGS             = testCafeLegacyRunner.get('./settings').get();

var stepIterator            = null;
var nextStep                = 0;
var stepsSharedData         = null;
var states                  = [];
var onError                 = null;
var onStepIteratorCompleted = null;

QUnit.testStart(function () {
    stepIterator            = new StepIterator();
    nextStep                = 0;
    stepsSharedData         = null;
    states                  = [];
    onError                 = null;
    onStepIteratorCompleted = null;

    stepIterator.on(StepIterator.NEXT_STEP_STARTED_EVENT, function (e) {
        states.push(COMMAND.setNextStep);
        nextStep = e.nextStep;
        e.callback();
    });

    stepIterator.on(StepIterator.SET_STEPS_SHARED_DATA_EVENT, function (e) {
        states.push(COMMAND.setStepsSharedData);
        stepsSharedData = e.stepsSharedData;
        e.callback();
    });

    stepIterator.on(StepIterator.GET_STEPS_SHARED_DATA_EVENT, function (e) {
        states.push(COMMAND.getStepsSharedData);
        e.callback(stepsSharedData);
    });

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        if (typeof onError === 'function')
            onError(err);
    });

    stepIterator.on(StepIterator.TEST_COMPLETE_EVENT, function () {
        if (typeof onStepIteratorCompleted === 'function')
            onStepIteratorCompleted();
    });
});

$(document).ready(function () {
    asyncTest('Lifecycle', function () {
        states          = [];
        nextStep        = 0;
        stepsSharedData = null;

        stepIterator.setGlobalWaitFor();

        var stepNames = ['0', '1', '2', '3', '4'];

        var steps = [
            function () {
                strictEqual(SETTINGS.CURRENT_TEST_STEP_NAME, '0');

                states.push('step0');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step0_action');
                        callback();
                    }, 500);
                });
            },

            function () {
                strictEqual(SETTINGS.CURRENT_TEST_STEP_NAME, '1');

                this.counter = 1;

                states.push('step1');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step1_action');
                        callback();
                    }, 0);
                });
            },

            function () {
                strictEqual(SETTINGS.CURRENT_TEST_STEP_NAME, '2');

                states.push('step2');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step2_action');
                        callback();
                    }, 0);
                });
            },

            function () {
                strictEqual(SETTINGS.CURRENT_TEST_STEP_NAME, '3');
                strictEqual(this.counter, 1);

                states.push('step3');

                throw 'interrupt';
            },

            function () {
                strictEqual(SETTINGS.CURRENT_TEST_STEP_NAME, '4');
                strictEqual(this.counter, 1);

                states.push('step4');

                var runArgumentIteratorEmulator = function (items, actionRunner, callback) {
                    actionRunner(items, callback);
                };

                stepIterator.asyncActionSeries(['0', '1'], runArgumentIteratorEmulator, function (item, callback) {
                    window.setTimeout(function () {
                        states.push('step4_' + item + '_action');
                        callback();
                    }, 300);
                });
            }
        ];

        var stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        var stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        var expectedStates = [
            COMMAND.getStepsSharedData,
            COMMAND.setNextStep,
            'step0_setup',
            'step0',
            'step0_action',
            'step0_done',
            COMMAND.setNextStep,
            'step1_setup',
            'step1',
            COMMAND.setStepsSharedData,
            'step1_action',
            'step1_done',
            COMMAND.setNextStep,
            'step2_setup',
            'step2',
            'step2_action',
            'step2_done',
            COMMAND.setNextStep,
            'step3_setup',
            'step3',
            ERROR_TYPE.uncaughtJSErrorInTestCodeStep,
            COMMAND.getStepsSharedData,
            'step3_done',
            COMMAND.setNextStep,
            'step4_setup',
            'step4',
            'step4_0_action',
            'step4_1_action',
            'step4_done',
            COMMAND.done
        ];

        expect(8);

        //NOTE: simulate execution interruption (see 2nd step)
        onError = function (err) {
            stepIterator.state.stoppedOnFail = false;
            states.push(err.type);
            stepIterator.start(stepNames, steps, stepSetup, stepDone, nextStep);
            onError = null;
        };

        onStepIteratorCompleted = function () {
            states.push(COMMAND.done);
            deepEqual(states, expectedStates);
            start();
        };

        stepIterator.start(stepNames, steps, stepSetup, stepDone, 0);
    });

    asyncTest('Global __waitFor', function () {
        states          = [];
        nextStep        = 0;
        stepsSharedData = null;

        var stepNames = ['0', '1'];

        var steps = [
            function () {
                states.push('step0');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step0_action');
                        callback();
                    }, 500);
                });
            },

            function () {
                states.push('step1');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step1_action');
                        callback();
                    }, 500);
                });
            }
        ];

        var stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        var stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        stepIterator.setGlobalWaitFor(function (callback) {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_pre_setup');
            callback();
        }, 1000);

        var expectedStates = [
            COMMAND.getStepsSharedData,
            COMMAND.setNextStep,
            'step0_pre_setup',
            'step0_setup',
            'step0',
            'step0_action',
            'step0_done',
            COMMAND.setNextStep,
            'step1_pre_setup',
            'step1_setup',
            'step1',
            'step1_action',
            'step1_done',
            COMMAND.done
        ];

        expect(1);

        onStepIteratorCompleted = function () {
            states.push(COMMAND.done);
            deepEqual(states, expectedStates);
            start();
        };

        stepIterator.start(stepNames, steps, stepSetup, stepDone, 0);
    });

    asyncTest('Global __waitFor failed', function () {
        states          = [];
        nextStep        = 0;
        stepsSharedData = null;

        var stepNames = ['0', '1'];

        var steps = [
            function () {
                states.push('step0');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step0_action');
                        callback();
                    }, 500);
                });
            }
        ];

        var stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        var stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        stepIterator.setGlobalWaitFor(function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_pre_setup');
        }, 1000);

        var expectedStates = [
            COMMAND.getStepsSharedData,
            COMMAND.setNextStep,
            'step0_pre_setup',
            ERROR_TYPE.globalWaitForActionTimeoutExceeded,
            COMMAND.done
        ];

        expect(1);

        onError = function (err) {
            states.push(err.type);
            states.push(COMMAND.done);
            deepEqual(states, expectedStates);
            start();
        };

        stepIterator.start(stepNames, steps, stepSetup, stepDone, 0);
    });

    module('Regression');
    test('T162970 - Delays between steps are very long on the github.com page', function () {
        var $a          = $('<a href="http://test.org">Link</a>').appendTo('body');
        var clickRaised = false;

        stepIterator._setupUnloadHandlers();

        $a.on('click', function (e) {
            clickRaised = true;
            eventUtils.preventDefault(e, false);
            return false;
        });

        $a[0].click();

        ok(clickRaised);
        ok(!stepIterator.state.prolongStepDelay);

        $a.remove();
    });

    asyncTest('T226191 - The "Maximum call stack size exceeded" exception is raised when put an unserializable object to the shared data', function () {
        var stepNames = ['0'];

        var steps = [
            function () {
                states.push('step0');
                this.body = $('body');
                stepIterator.asyncAction(function (callback) {
                    window.setTimeout(function () {
                        states.push('step0_action');
                        callback();
                    }, 500);
                });
            }
        ];

        var expectedStates = [
            COMMAND.getStepsSharedData,
            COMMAND.setNextStep,
            'step0',
            ERROR_TYPE.storeDomNodeOrJqueryObject,
            COMMAND.done
        ];

        expect(1);

        onError = function (err) {
            states.push(err.type);
            states.push(COMMAND.done);
            deepEqual(states, expectedStates);
            start();
        };

        stepIterator.start(stepNames, steps, null, null, 0);
    });
});
