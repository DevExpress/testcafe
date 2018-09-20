const testCafeCore = window.getTestCafeModule('testCafeCore');
const domUtils     = testCafeCore.get('./utils/dom');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');


$(document).ready(function () {
    const parse = actionsAPI.parseActionArgument;

    const isArrayOfElements = function (target) {
        if (!$.isArray(target))
            return false;
        for (let i = 0; i < target.length; i++) {
            if (!domUtils.isDomElement(target[i]))
                return false;
        }
        return true;
    };

    test('isArrayOfElements function test', function () {
        const div1 = document.getElementById('div1');
        const div2 = document.getElementById('div2');

        ok(isArrayOfElements([div1, div2]));
        ok(!isArrayOfElements(div1));
        ok(!isArrayOfElements([1, 2]));
        ok(!isArrayOfElements({}));
        ok(!isArrayOfElements($('body')));
    });

    test('dom element', function () {
        const target = parse(document.getElementById('div1'));

        ok(isArrayOfElements(target));
        equal(target.length, 1);
    });

    test('jQuery object', function () {
        const target = parse($('.testDiv'));

        ok(isArrayOfElements(target));
        equal(target.length, 2);
    });

    test('css selector', function () {
        const target = parse('#div1');

        ok(isArrayOfElements(target));
        equal(target.length, 1);
    });
});
