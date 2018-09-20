const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');

const transport      = testCafeLegacyRunner.get('./transport');
const StepIterator   = testCafeLegacyRunner.get('./step-iterator');
const initAutomation = testCafeLegacyRunner.get('./init-automation');
const actionsAPI     = testCafeLegacyRunner.get('./api/actions');

initAutomation();

const stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

let errorRaised = false;

transport.fatalError = function (err) {
    if (err) {
        errorRaised = true;
        ok(!errorRaised, 'error raised');
        start();
    }
};

const setupTestIterator = function (iteratorCallback) {
    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        const seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(elements, action, callback);
        };

        runArgumentsIterator(items, seriesActionsRun, iteratorCallback);
    };
};

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //utils
    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        errorRaised = false;
    });

    //tests
    asyncTest('invisible element waiting', function () {
        let clickRaised = false;

        const actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        const $element = $('<input>').addClass(TEST_ELEMENT_CLASS)
            .css('display', 'none')
            .click(function () {
                clickRaised = true;
            })
            .appendTo('body');

        window.setTimeout(function () {
            $element.css('display', '');
        }, 1000);

        actionsAPI.click($element, {});
    });

    asyncTest('element from jQuery selector argument is not exist on the start', function () {
        let clickRaised = false;

        const actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        const id = 'element';

        window.setTimeout(function () {
            $('<input />').attr('id', id)
                .addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clickRaised = true;
                })
                .appendTo('body');
        }, 1000);

        actionsAPI.click('#' + id, {});
    });

    asyncTest('element from function argument is not exist on the start', function () {
        let clickRaised = false;

        const actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        const id = 'element';

        let $element = null;

        window.setTimeout(function () {
            $element = $('<input />').attr('id', id)
                .addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clickRaised = true;
                })
                .appendTo('body');
        }, 1000);

        actionsAPI.click(function () {
            return $element;
        }, {});
    });

    asyncTest('element from array argument is not exist on the start', function () {
        let clickRaised = false;

        const actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        const id        = 'element';
        const $element1 = $('<input />').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        window.setTimeout(function () {
            $('<input />').attr('id', id)
                .addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clickRaised = true;
                })
                .appendTo('body');
        }, 1000);

        actionsAPI.click([$element1, '#' + id], {});
    });

    asyncTest('argument function returns empty jQuery object', function () {
        let clickRaised = false;

        const actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();
        };

        setupTestIterator(actionCallback);

        const id = 'element';

        window.setTimeout(function () {
            $('<input />').attr('id', id)
                .addClass(TEST_ELEMENT_CLASS)
                .click(function () {
                    clickRaised = true;
                })
                .appendTo('body');
        }, 1000);

        actionsAPI.click(function () {
            return $('#' + id);
        }, {});
    });
});
