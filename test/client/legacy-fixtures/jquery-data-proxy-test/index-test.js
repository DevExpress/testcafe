const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const dataMethodProxy      = testCafeLegacyRunner.get('./jquery-extensions/data-proxy');

const field1    = 'field1';
const value1    = 'value1';
const field2    = 'field2';
const value2    = 'value2';
const elementId = 'testElement';

let $testElement = null;

QUnit.testStart(function () {
    $testElement = $('<div>')
        .attr('id', elementId)
        .data(field1, value1)
        .appendTo($('body'));
});

QUnit.testDone(function () {
    $testElement.remove();
});

module('jQuery data proxy');

(function (jQuery, $) {
    dataMethodProxy.setup(jQuery);

    const getTestElement = function () {
        return $('#' + elementId);
    };

    test('Get data from outer script', function () {
        const $el = getTestElement();

        equal($el.data(field1), value1);
        equal($el.data().field1, value1);
    });

    test('Set data in internal script', function () {
        const $el = getTestElement();

        $el.data(field2, value2);

        equal($el.data(field2), value2);
        ok(!$testElement.data(field2));
    });

    module('Regression tests');

    test('B234339 - Incorrect substitution of local page\'s jQuery.data if it\'s null or isn\'t a function', function () {
        const $el  = getTestElement();
        const data = window.jQuery.fn.data;

        window.jQuery.fn.data = null;

        ok(!$el.data(field1));

        window.jQuery.fn.data = data;
    });

    test('B234321 - Select input throws JS error during playback on facebook.com', function () {
        const $el        = getTestElement();
        const rootJQuery = window.jQuery;

        window.jQuery = null;

        ok(!$el.data(field1));

        window.jQuery = rootJQuery;
    });
    /*eslint-disable no-undef*/
})(_jQuery, _jQuery);
/*eslint-enable no-undef*/
