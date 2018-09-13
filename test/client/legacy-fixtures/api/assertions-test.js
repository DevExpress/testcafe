const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const ERROR_TYPE           = testCafeLegacyRunner.get('../test-run-error/type');
const AssertionsAPI        = testCafeLegacyRunner.get('./api/assertions');
const SETTINGS             = testCafeLegacyRunner.get('./settings').get();


let currentError = null;

const onAssertionFailed = function (err) {
    currentError = err;
};

const assertionsAPI = new AssertionsAPI(onAssertionFailed);

QUnit.testDone(function () {
    currentError                 = null;
    SETTINGS.ENABLE_SOURCE_INDEX = false;
});

test('successfull ok assertion', function () {
    assertionsAPI.ok(true);
    equal(currentError, null, 'error not sent');
});

test('failed ok assertion', function () {
    SETTINGS.ENABLE_SOURCE_INDEX = true;

    const message = 'ok assertion';

    assertionsAPI.ok(false, message, '#213');
    equal(currentError.type, ERROR_TYPE.okAssertion, 'correct error type sent');
    equal(currentError.message, message, 'correct error message sent');
    equal(currentError.__sourceIndex, 213);
});

test('successfull not ok assertion', function () {
    assertionsAPI.notOk(false);
    equal(currentError, null, 'error not sent');
});

test('failed not ok assertion', function () {
    SETTINGS.ENABLE_SOURCE_INDEX = true;

    const message = 'notOk assertion';

    assertionsAPI.notOk(true, message, '#805');
    equal(currentError.type, ERROR_TYPE.notOkAssertion, 'correct error type sent');
    equal(currentError.message, message, 'correct error message sent');
    equal(currentError.__sourceIndex, 805);
});

test('successfull equal assertion', function () {
    assertionsAPI.eq(1, 1);
    equal(currentError, null, 'error not sent');
});

test('failed equal assertion', function () {
    SETTINGS.ENABLE_SOURCE_INDEX = true;

    const message = 'equal assertion';

    assertionsAPI.eq(1, 2, message, '#289');
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.message, message, 'correct error message sent');
    equal(currentError.__sourceIndex, 289);
});

test('successfull not equal assertion', function () {
    assertionsAPI.notEq(1, 2);
    equal(currentError, null, 'error not sent');
});

test('failed equal assertion', function () {
    SETTINGS.ENABLE_SOURCE_INDEX = true;

    const message = 'not equal assertion';

    assertionsAPI.notEq(1, 1, message, '#514');
    equal(currentError.type, ERROR_TYPE.notEqAssertion, 'correct error type sent');
    equal(currentError.message, message, 'correct error message sent');
    equal(currentError.__sourceIndex, 514);
});

module('deepEq tests');

test('objects', function () {
    const obj1 = { f1: 1 };
    const obj2 = obj1;
    const obj3 = { f2: 2 };
    const obj4 = { f1: 2 };
    const obj5 = { f1: { f2: 1 } };
    const obj6 = { f1: { f2: 2 } };
    const obj7 = { f1: { f3: 3 } };

    const circularDep1 = {};
    const circularDep2 = {};
    const circularDep3 = {};

    circularDep1.test = circularDep1;
    circularDep2.test = circularDep2;
    circularDep3.test = circularDep1;

    assertionsAPI.eq(obj1, obj2);
    equal(currentError, null, 'error not sent');

    assertionsAPI.eq(obj1, obj3);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    ok(currentError.isObjects);
    equal(currentError.key, 'f1');
    equal(currentError.actual, '1');
    equal(currentError.expected, 'undefined');
    currentError = null;

    assertionsAPI.eq(obj1, obj4);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    ok(currentError.isObjects);
    equal(currentError.key, 'f1');
    equal(currentError.actual, 1);
    equal(currentError.expected, 2);
    currentError = null;

    assertionsAPI.eq(obj5, obj6);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    ok(currentError.isObjects);
    equal(currentError.key, 'f1.f2');
    equal(currentError.actual, 1);
    equal(currentError.expected, 2);
    currentError = null;

    assertionsAPI.eq(obj6, obj7);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    ok(currentError.isObjects);
    equal(currentError.key, 'f1.f2');
    equal(currentError.actual, 2);
    equal(currentError.expected, 'undefined');
    currentError = null;

    assertionsAPI.eq(obj5, obj3);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    ok(currentError.isObjects);
    equal(currentError.key, 'f1');
    equal(currentError.actual, JSON.stringify({ f2: 1 }));
    equal(currentError.expected, 'undefined');
    currentError = null;

    assertionsAPI.eq(circularDep1, circularDep2);
    equal(currentError, null, 'error not sent');

    assertionsAPI.eq(circularDep1, circularDep3);
    equal(currentError, null, 'error not sent');
});

test('arrays', function () {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    assertionsAPI.eq(arr1, arr2);
    equal(currentError, null, 'error not sent');

    const checkErrSent = function (testData) {
        assertionsAPI.eq(testData.actual, testData.expected);
        equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
        ok(currentError.isArrays);
        equal(testData.key, currentError.key);
        equal(testData.actualVal, currentError.actual);
        equal(testData.expectedVal, currentError.expected);
        currentError = null;
    };

    checkErrSent({ actual: [1], expected: [2], key: 0, actualVal: '1', expectedVal: '2' });
    checkErrSent({ actual: [1], expected: [1, 2], key: 1, actualVal: 'undefined', expectedVal: '2' });
    checkErrSent({ actual: [1, 2], expected: [1], key: 1, actualVal: '2', expectedVal: 'undefined' });

    checkErrSent({ actual: [1, 2, 3], expected: [1, 7, 3], key: 1, actualVal: '2', expectedVal: '7' });
    checkErrSent({ actual: [1, 2, 3], expected: [], key: 0, actualVal: '1', expectedVal: 'undefined' });

    checkErrSent({ actual: [[2, 3], 3], expected: [[2, 4], 3], key: 0, actualVal: '[2, 3]', expectedVal: '[2, 4]' });
});

test('dates', function () {
    const d1 = new Date(1, 2, 3);
    const d2 = new Date(1, 2, 3);
    const d3 = new Date();
    const d4 = new Date(1);
    const d5 = new Date(2);

    assertionsAPI.eq(d1, d2);
    equal(currentError, null, 'error not sent');

    assertionsAPI.eq(d1, d3);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.actual, d1.getTime());
    equal(currentError.expected, d3.getTime());

    currentError = null;

    assertionsAPI.eq(d4, d5);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.actual, d4.getTime());
    equal(currentError.expected, d5.getTime());
});

test('dom elements', function () {
    const divString = '<div></div>';
    const $body     = $('body');

    const div1 = $(divString).appendTo($body)[0];
    const div2 = $(divString).addClass('testClass').appendTo($body)[0];

    assertionsAPI.eq(div1, div1);
    equal(currentError, null, 'error not sent');

    assertionsAPI.eq(div1, div2);
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.actual, '<div>');
    equal(currentError.expected, '<div class="testClass">');

    $(div1).remove();
    $(div2).remove();
});

test('jQuery objects', function () {
    const commonClass   = 'common';
    const specificClass = 'specific';
    const divString     = '<div></div>';
    const $body         = $('body');

    $(divString).addClass(commonClass).addClass(specificClass).appendTo($body);
    $(divString).addClass(commonClass).addClass(specificClass).appendTo($body);
    $(divString).addClass(commonClass).appendTo($body);

    const commonClassElementDescription   = '<div class="common">';
    const specificClassElementDescription = '<div class="common specific">';

    const commonClassElementsDescription = ['[',
        specificClassElementDescription,
        ', ',
        specificClassElementDescription,
        ', ',
        commonClassElementDescription,
        ']'
    ].join('');

    const specificClassElementsDescription = ['[',
        specificClassElementDescription,
        ', ',
        specificClassElementDescription,
        ']'
    ].join('');

    assertionsAPI.eq($('div.' + commonClass), $('.' + commonClass));
    equal(currentError, null, 'error not sent');

    assertionsAPI.eq($('.' + commonClass), $('.' + specificClass));
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.actual, commonClassElementsDescription);
    equal(currentError.expected, specificClassElementsDescription);

    $('.' + commonClass).remove();
});

test('NodeLists', function () {
    const commonClass   = 'common';
    const specificClass = 'specific';
    const divString     = '<div></div>';
    const $body         = $('body');

    $(divString).addClass(commonClass).addClass(specificClass).appendTo($body);
    $(divString).addClass(commonClass).addClass(specificClass).appendTo($body);
    $(divString).addClass(commonClass).appendTo($body);

    const commonClassElementDescription   = '<div class="common">';
    const specificClassElementDescription = '<div class="common specific">';

    const commonClassElementsDescription = ['[',
        specificClassElementDescription,
        ', ',
        specificClassElementDescription,
        ', ',
        commonClassElementDescription,
        ']'
    ].join('');

    const specificClassElementsDescription = ['[',
        specificClassElementDescription,
        ', ',
        specificClassElementDescription,
        ']'
    ].join('');

    assertionsAPI.eq(document.getElementsByClassName(commonClass), document.getElementsByClassName(specificClass));
    equal(currentError.type, ERROR_TYPE.eqAssertion, 'correct error type sent');
    equal(currentError.actual, commonClassElementsDescription);
    equal(currentError.expected, specificClassElementsDescription);
    ok(!currentError.isArray);
    ok(!currentError.isObject);

    $('.' + commonClass).remove();
});


test('null, undefined, false, true', function () {
    assertionsAPI.eq(true, false);
    equal(currentError.type, ERROR_TYPE.eqAssertion);
    equal(currentError.actual, 'true');
    equal(currentError.expected, 'false');
    currentError = null;

    const arr = [1, 2];
    const obj = { f1: 1 };

    assertionsAPI.eq(arr, obj);
    equal(currentError.type, ERROR_TYPE.eqAssertion);
    equal(currentError.actual, '[1, 2]');
    equal(currentError.expected, JSON.stringify(obj));
});

test('functions', function () {
    const obj = {};

    assertionsAPI.eq(obj.toString, obj.toString);
    equal(currentError, null, 'error not sent');
    assertionsAPI.eq(obj.toString, obj.hasOwnProperty);
    equal(currentError.type, ERROR_TYPE.eqAssertion);
    equal(currentError.actual, obj.toString.toString());
    equal(currentError.expected, obj.hasOwnProperty.toString());
    ok(!currentError.isObject);
});

test('notDeepEq', function () {
    const obj1 = { f1: 1 };
    const obj2 = { f1: 1 };
    const obj3 = { f2: 2 };

    assertionsAPI.notEq(obj1, obj3);
    equal(currentError, null, 'error not sent');

    assertionsAPI.notEq(obj1, obj2);
    equal(currentError.type, ERROR_TYPE.notEqAssertion, 'correct error type sent');
    equal(currentError.actual, JSON.stringify(obj1));
});

test('type cast', function () {
    assertionsAPI.eq('1', 1);
    equal(currentError, null);

    assertionsAPI.eq('', false);
    equal(currentError, null);

    assertionsAPI.eq(null, 'null');
    ok(currentError);
});
