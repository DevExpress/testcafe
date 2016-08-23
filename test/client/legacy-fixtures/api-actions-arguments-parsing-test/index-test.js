var testCafeCore = window.getTestCafeModule('testCafeCore');
var domUtils     = testCafeCore.get('./utils/dom');

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');


$(document).ready(function () {
    var parse = actionsAPI.parseActionArgument;

    var isArrayOfElements = function (target) {
        if (!$.isArray(target))
            return false;
        for (var i = 0; i < target.length; i++) {
            if (!domUtils.isDomElement(target[i]))
                return false;
        }
        return true;
    };

    test('isArrayOfElements function test', function () {
        var div1 = document.getElementById('div1');
        var div2 = document.getElementById('div2');

        ok(isArrayOfElements([div1, div2]));
        ok(!isArrayOfElements(div1));
        ok(!isArrayOfElements([1, 2]));
        ok(!isArrayOfElements({}));
        ok(!isArrayOfElements($('body')));
    });

    test('dom element', function () {
        var target = parse(document.getElementById('div1'));

        ok(isArrayOfElements(target));
        equal(target.length, 1);
    });

    test('jQuery object', function () {
        var target = parse($('.testDiv'));

        ok(isArrayOfElements(target));
        equal(target.length, 2);
    });

    test('css selector', function () {
        var target = parse('#div1');

        ok(isArrayOfElements(target));
        equal(target.length, 1);
    });
});
