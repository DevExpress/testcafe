const testCafeCore = window.getTestCafeModule('testCafeCore');
const eventUtils   = testCafeCore.get('./utils/event');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const COMMAND              = testCafeLegacyRunner.get('../test-run/command');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();

let stepIterator            = null;
let nextStep                = 0;
let stepsSharedData         = null;
let states                  = [];
let onError                 = null;
let onStepIteratorCompleted = null;

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

        const stepNames = ['0', '1', '2', '3', '4'];

        const steps = [
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

                const runArgumentIteratorEmulator = function (items, actionRunner, callback) {
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

        const stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        const stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        const expectedStates = [
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

        const stepNames = ['0', '1'];

        const steps = [
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

        const stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        const stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        stepIterator.setGlobalWaitFor(function (callback) {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_pre_setup');
            callback();
        }, 1000);

        const expectedStates = [
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

        const stepNames = ['0', '1'];

        const steps = [
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

        const stepSetup = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_setup');
        };

        const stepDone = function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_done');
        };

        stepIterator.setGlobalWaitFor(function () {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_pre_setup');
        }, 1000);

        const expectedStates = [
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
        const $a          = $('<a href="http://test.org">Link</a>').appendTo('body');

        let clickRaised = false;

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
        const stepNames = ['0'];

        const steps = [
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

        const expectedStates = [
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
