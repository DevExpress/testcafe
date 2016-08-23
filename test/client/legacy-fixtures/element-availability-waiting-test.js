var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');

var transport      = testCafeLegacyRunner.get('./transport');
var StepIterator   = testCafeLegacyRunner.get('./step-iterator');
var initAutomation = testCafeLegacyRunner.get('./init-automation');
var actionsAPI     = testCafeLegacyRunner.get('./api/actions');

initAutomation();

var stepIterator = new StepIterator();

actionsAPI.init(stepIterator);

var errorRaised = false;

transport.fatalError = function (err) {
    if (err) {
        errorRaised = true;
        ok(!errorRaised, 'error raised');
        start();
    }
};

var setupTestIterator = function (iteratorCallback) {
    StepIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var seriesActionsRun = function (elements, callback) {
            window.async.forEachSeries(elements, action, callback);
        };

        runArgumentsIterator(items, seriesActionsRun, iteratorCallback);
    };
};

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        errorRaised = false;
    });

    //tests
    asyncTest('invisible element waiting', function () {
        var clickRaised = false;

        var actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        var $element = $('<input>').addClass(TEST_ELEMENT_CLASS)
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
        var clickRaised = false;

        var actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        var id = 'element';

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
        var clickRaised = false;

        var actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        var id       = 'element';
        var $element = null;

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
        var clickRaised = false;

        var actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();

        };

        setupTestIterator(actionCallback);

        var id        = 'element';
        var $element1 = $('<input />').addClass(TEST_ELEMENT_CLASS).appendTo('body');

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
        var clickRaised = false;

        var actionCallback = function () {
            ok(!errorRaised);
            ok(clickRaised);
            start();
        };

        setupTestIterator(actionCallback);

        var id = 'element';

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
