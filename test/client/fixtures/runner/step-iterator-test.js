var testCafeCore = window.getTestCafeModule('testCafeCore');
var COMMANDS     = testCafeCore.get('./service-msg-cmd');
var ERRORS       = testCafeCore.get('./errors');
var SETTINGS     = testCafeCore.get('./settings').get();
var transport    = testCafeCore.get('./transport');
var event        = testCafeCore.get('./util/event');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var StepIterator   = testCafeRunner.get('./step-iterator');

var stepIterator    = null,
    nextStep        = 0,
    stepsSharedData = null,
    states          = [],
    onError         = null;

QUnit.testStart(function () {
    stepIterator    = new StepIterator();
    nextStep        = 0;
    stepsSharedData = null;
    states          = [];
    onError         = null;

    stepIterator.on(StepIterator.NEXT_STEP_STARTED_EVENT, function (e) {
        states.push(COMMANDS.SET_NEXT_STEP);
        nextStep = e.nextStep;
        e.callback();
    });

    stepIterator.on(StepIterator.SET_STEPS_SHARED_DATA_EVENT, function (e) {
        states.push(COMMANDS.SET_STEPS_SHARED_DATA);
        stepsSharedData = e.stepsSharedData;
        e.callback();
    });

    stepIterator.on(StepIterator.GET_STEPS_SHARED_DATA_EVENT, function (e) {
        states.push(COMMANDS.GET_STEPS_SHARED_DATA);
        e.callback(stepsSharedData);
    });

    stepIterator.on(StepIterator.TEST_COMPLETE_EVENT, function () {
        states.push(COMMANDS.TEST_COMPLETE);
        transport.switchToWorkerIdle();
    });

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        if (typeof onError === 'function')
            onError(err);
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

        transport.switchToWorkerIdle = function () {
            states.push('switchToWorkerIdle');
            deepEqual(states, expectedStates);
            start();
        };

        var expectedStates = [
            COMMANDS.GET_STEPS_SHARED_DATA,
            COMMANDS.SET_NEXT_STEP,
            'step0_setup',
            'step0',
            'step0_action',
            'step0_done',
            COMMANDS.SET_NEXT_STEP,
            'step1_setup',
            'step1',
            COMMANDS.SET_STEPS_SHARED_DATA,
            'step1_action',
            'step1_done',
            COMMANDS.SET_NEXT_STEP,
            'step2_setup',
            'step2',
            'step2_action',
            'step2_done',
            COMMANDS.SET_NEXT_STEP,
            'step3_setup',
            'step3',
            ERRORS.UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP,
            COMMANDS.GET_STEPS_SHARED_DATA,
            'step3_done',
            COMMANDS.SET_NEXT_STEP,
            'step4_setup',
            'step4',
            'step4_0_action',
            'step4_1_action',
            'step4_done',
            COMMANDS.TEST_COMPLETE,
            'switchToWorkerIdle'
        ];

        expect(8);

        //NOTE: simulate execution interruption (see 2nd step)
        onError = function (err) {
            stepIterator.state.stoppedOnFail = false;
            states.push(err.code);
            stepIterator.start(stepNames, steps, stepSetup, stepDone, nextStep);
            onError                          = null;
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

        transport.switchToWorkerIdle = function () {
            states.push('switchToWorkerIdle');
            deepEqual(states, expectedStates);
            start();
        };

        var expectedStates = [
            COMMANDS.GET_STEPS_SHARED_DATA,
            COMMANDS.SET_NEXT_STEP,
            COMMANDS.INACTIVITY_EXPECTED,
            'step0_pre_setup',
            'step0_setup',
            'step0',
            'step0_action',
            'step0_done',
            COMMANDS.SET_NEXT_STEP,
            COMMANDS.INACTIVITY_EXPECTED,
            'step1_pre_setup',
            'step1_setup',
            'step1',
            'step1_action',
            'step1_done',
            COMMANDS.TEST_COMPLETE,
            'switchToWorkerIdle'
        ];

        expect(1);

        stepIterator.expectInactivity = function (timeout, callback) {
            states.push(COMMANDS.INACTIVITY_EXPECTED);
            callback();
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

        stepIterator.setGlobalWaitFor(function (callback) {
            states.push('step' + SETTINGS.CURRENT_TEST_STEP_NAME + '_pre_setup');
        }, 1000);

        transport.switchToWorkerIdle = function () {
            states.push('switchToWorkerIdle');
            deepEqual(states, expectedStates);
            start();
        };

        var expectedStates = [
            COMMANDS.GET_STEPS_SHARED_DATA,
            COMMANDS.SET_NEXT_STEP,
            COMMANDS.INACTIVITY_EXPECTED,
            'step0_pre_setup',
            ERRORS.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED,
            COMMANDS.TEST_COMPLETE,
            'switchToWorkerIdle'
        ];

        expect(1);

        onError = function (err) {
            states.push(err.code);
            states.push(COMMANDS.TEST_COMPLETE);
            transport.switchToWorkerIdle();
        };

        stepIterator.expectInactivity = function (timeout, callback) {
            states.push(COMMANDS.INACTIVITY_EXPECTED);
            callback();
        };

        stepIterator.start(stepNames, steps, stepSetup, stepDone, 0);
    });

    module('Regression');
    test('T162970 - Delays between steps are very long on the github.com page', function () {
        var $a          = $('<a href="http://test.org">Link</a>').appendTo('body'),
            clickRaised = false;

        stepIterator._setupUnloadPrediction();

        $a.on('click', function (e) {
            clickRaised = true;
            event.preventDefault(e, false);
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

        transport.switchToWorkerIdle = function () {
            states.push('switchToWorkerIdle');
            deepEqual(states, expectedStates);
            start();
        };

        var expectedStates = [
            COMMANDS.GET_STEPS_SHARED_DATA,
            COMMANDS.SET_NEXT_STEP,
            'step0',
            ERRORS.STORE_DOM_NODE_OR_JQUERY_OBJECT,
            COMMANDS.TEST_COMPLETE,
            'switchToWorkerIdle'
        ];

        expect(1);

        onError = function (err) {
            states.push(err.code);
            states.push(COMMANDS.TEST_COMPLETE);
            transport.switchToWorkerIdle();
        };

        stepIterator.expectInactivity = function (timeout, callback) {
            callback();
        };

        stepIterator.start(stepNames, steps, null, null, 0);
    });
});
