const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

initAutomation();

const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    let currentErrorType         = null;
    let currentErrorElement      = null;
    let currentActionSourceIndex = null;

    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        const seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(
                elements,
                function (element, seriaCallback) {
                    action(element, seriaCallback);
                },
                function () {
                    callback();
                });
        };

        runArgumentsIterator(items, seriesActionsRun, function () {
        });
    };

    stepIterator.on(StepIterator.ERROR_EVENT, function (err) {
        stepIterator.state.stoppedOnFail = false;
        currentErrorType                 = err.type;
        currentActionSourceIndex         = err.__sourceIndex;

        if (err.element)
            currentErrorElement = err.element;
    });

    const createOption = function (parent, text) {
        return $('<option></option>').text(text)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(parent);
    };

    const createSelect = function (size) {
        const select = $('<select></select>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body')[0];

        createOption(select, 'one');
        createOption(select, 'two');
        createOption(select, 'three');
        createOption(select, 'four');
        createOption(select, 'five');

        if (size)
            $(select).attr('size', size);

        return select;
    };

    $('body').css('height', 1500);

    const startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();

        SETTINGS.ENABLE_SOURCE_INDEX = false;
    });

    //tests
    module('common tests');
    asyncTest('click on option in a collapsed option list raises error', function () {
        SETTINGS.ENABLE_SOURCE_INDEX = true;
        const select                   = createSelect();
        const option                   = $(select).children()[1];

        actionsAPI.click(option, '#312');

        setTimeout(function () {
            equal(currentErrorType, ERROR_TYPE.invisibleActionElement);
            equal(currentErrorElement, '<option class="testElement">');
            equal(currentActionSourceIndex, 312);

            startNext();
        }, 1500);
    });

    // NOTE: Android and iOS ignore the size and multiple attributes, all select elements behave like select with size=1
    if (featureDetection.isTouchDevice) {
        asyncTest('in select elements with "size" more than 1, click on an option raises an error when the option list is collapsed', function () {
            SETTINGS.ENABLE_SOURCE_INDEX = true;
            const select                   = createSelect(2);
            const option                   = $(select).children()[1];

            actionsAPI.click(option, '#312');

            setTimeout(function () {
                equal(currentErrorType, ERROR_TYPE.invisibleActionElement);
                equal(currentErrorElement, '<option class="testElement">');
                equal(currentActionSourceIndex, 312);

                startNext();
            }, 1500);
        });

        asyncTest('in select elements with the "multiple" attribute, click on an option raises an error when option list is collapsed', function () {
            SETTINGS.ENABLE_SOURCE_INDEX = true;
            const select                   = createSelect();
            const option                   = $(select).children()[1];

            $(select).attr('multiple', 'multiple');

            actionsAPI.click(option, '#312');

            setTimeout(function () {
                equal(currentErrorType, ERROR_TYPE.invisibleActionElement);
                equal(currentErrorElement, '<option class="testElement">');
                equal(currentActionSourceIndex, 312);

                startNext();
            }, 1500);
        });
    }
});
