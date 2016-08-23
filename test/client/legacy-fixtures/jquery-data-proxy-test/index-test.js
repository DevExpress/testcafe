var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var dataMethodProxy      = testCafeLegacyRunner.get('./jquery-extensions/data-proxy');

var field1       = 'field1';
var value1       = 'value1';
var field2       = 'field2';
var value2       = 'value2';
var elementId    = 'testElement';
var $testElement = null;

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

    var getTestElement = function () {
        return $('#' + elementId);
    };

    test('Get data from outer script', function () {
        var $el = getTestElement();

        equal($el.data(field1), value1);
        equal($el.data().field1, value1);
    });

    test('Set data in internal script', function () {
        var $el = getTestElement();

        $el.data(field2, value2);

        equal($el.data(field2), value2);
        ok(!$testElement.data(field2));
    });

    module('Regression tests');

    test('B234339 - Incorrect substitution of local page\'s jQuery.data if it\'s null or isn\'t a function', function () {
        var $el  = getTestElement();
        var data = window.jQuery.fn.data;

        window.jQuery.fn.data = null;

        ok(!$el.data(field1));

        window.jQuery.fn.data = data;
    });

    test('B234321 - Select input throws JS error during playback on facebook.com', function () {
        var $el        = getTestElement();
        var rootJQuery = window.jQuery;

        window.jQuery = null;

        ok(!$el.data(field1));

        window.jQuery = rootJQuery;
    });
    /*eslint-disable no-undef*/
})(_jQuery, _jQuery);
/*eslint-enable no-undef*/
