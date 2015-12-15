import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import * as sourceIndexTracker from '../source-index';


var messageSandbox = hammerhead.eventSandbox.message;
var isJQueryObj    = hammerhead.utils.isJQueryObj;

var SETTINGS              = testCafeCore.SETTINGS;
var ERROR_TYPE            = testCafeCore.ERROR_TYPE;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var arrayUtils            = testCafeCore.arrayUtils;
var domUtils              = testCafeCore.domUtils;


function createDiffObject (actual, expected) {
    return {
        actual:   getDescription(actual),
        expected: getDescription(expected)
    };
}

function isElementsCollection (obj) {
    return obj instanceof NodeList || obj instanceof HTMLCollection;
}

function getObjectsDiff (actual, expected, comparablePath, checkedElements) {
    //We store references of object for resolving circular dependencies.
    //If actual and expected object already were in checkedElements, they are equal
    if (!checkedElements)
        checkedElements = {
            actual:   {},
            expected: {}
        };

    if (actual === expected)
        return null;

    //date
    if (actual instanceof Date && expected instanceof Date) {
        var actualTime   = actual.getTime(),
            expectedTime = expected.getTime();

        return actualTime === expectedTime ?
               null :
               {
                   actual:   actualTime,
                   expected: expectedTime,
                   isDates:  true
               };
    }

    //strings
    if (typeof actual === 'string' && typeof expected === 'string')
        return getStringDiff(actual, expected);

    //arrays
    if (arrayUtils.isArray(actual) || arrayUtils.isArray(expected)) {
        return (!(arrayUtils.isArray(actual)) || !(arrayUtils.isArray(expected))) ?
               createDiffObject(actual, expected) :
               getArraysDiff(actual, expected);
    }

    //NodeList
    if (isElementsCollection(actual) || isElementsCollection(expected)) {
        if (!(isElementsCollection(actual)) || !(isElementsCollection(expected)))
            return createDiffObject(actual, expected);

        var actualAsArray   = arrayUtils.toArray(actual),
            expectedAsArray = arrayUtils.toArray(expected);

        return getArraysDiff(actualAsArray, expectedAsArray) ? createDiffObject(actualAsArray, expectedAsArray) : null;
    }

    //dom elements
    if (domUtils.isDomElement(actual) || domUtils.isDomElement(expected)) {
        if (!domUtils.isDomElement(actual) || !domUtils.isDomElement(expected) || actual !== expected)
            return createDiffObject(actual, expected);
        return null;
    }

    //jQuery objects
    if (isJQueryObj(actual) || isJQueryObj(expected)) {
        if (!isJQueryObj(actual) || !isJQueryObj(expected) ||
            getArraysDiff(arrayUtils.toArray(actual), arrayUtils.toArray(expected)))
            return createDiffObject(actual, expected);
        return null;
    }

    if (actual === null || typeof actual === 'undefined' || expected === null || typeof expected === 'undefined')
        return createDiffObject(actual, expected);

    //functions
    if (typeof actual === 'function' || typeof expected === 'function') {
        if (typeof actual !== 'function' || typeof expected !== 'function' || actual !== expected)
            return createDiffObject(actual, expected);
        return null;
    }

    //other pairs, not objects
    if (typeof actual !== 'object' || typeof expected !== 'object') {
        //NOTE: force comparison with cast here for jshint
        /* jshint -W116 */
        return actual == expected ? null : createDiffObject(actual, expected);
        /* jshint +W116 */
    }

    //objects
    if (actual.prototype !== expected.prototype)
        return createDiffObject(actual, expected);

    var actualKeys   = getKeys(actual),
        expectedKeys = getKeys(expected);

    actualKeys.sort();
    expectedKeys.sort();

    var keysArrayDiff = getKeysDiff(actualKeys, expectedKeys);

    if (keysArrayDiff) {
        var keyDiff = keysArrayDiff.actual || keysArrayDiff.expected;

        return {
            key:       comparablePath ? [comparablePath, keyDiff].join('.') : keyDiff,
            actual:    getDescription(actual[keyDiff], true),
            expected:  getDescription(expected[keyDiff], true),
            isObjects: true
        };
    }

    var key         = null,
        objectsDiff = null;

    for (var i = 0; i < actualKeys.length; i++) {
        key            = actualKeys[i];
        var objectPath = comparablePath ? [comparablePath, key].join('.') : key;

        if (isCircularDependency(checkedElements.actual, actual[key]) &&
            isCircularDependency(checkedElements.expected, expected[key]))
            return null;

        checkedElements.actual[objectPath]   = actual[key];
        checkedElements.expected[objectPath] = expected[key];

        objectsDiff = getObjectsDiff(actual[key], expected[key], objectPath, checkedElements);

        if (objectsDiff) {
            return { //NOTE: if we're comparing not objects, we're specifying current path in object
                key:       objectsDiff.key ? objectsDiff.key : objectPath,
                actual:    objectsDiff.isArrays ? getDescription(actual[key]) : objectsDiff.actual,
                expected:  objectsDiff.isArrays ? getDescription(expected[key]) : objectsDiff.expected,
                isObjects: true,
                diffType:  {
                    isObjects: objectsDiff.isObjects,
                    isArrays:  objectsDiff.isArrays,
                    isStrings: objectsDiff.isStrings,
                    isDates:   objectsDiff.isDates
                }
            };
        }
    }

    return null;
}

function isCircularDependency (elements, obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;

    for (var key in elements) {
        if (elements.hasOwnProperty(key) && elements[key] === obj)
            return true;
    }

    return false;
}

function getArrayDiffIndex (actual, expected) {
    for (var i = 0; i < Math.min(actual.length, expected.length); i++) {
        if (getObjectsDiff(actual[i], expected[i]))
            return i;
    }

    //NOTE: we compare length of arrays in the end, because otherwise first difference index will calculate incorrect
    //eg. [1,2,3,4], [1,3,3] - first difference index - 1, not 2
    if (actual.length !== expected.length)
        return Math.min(actual.length, expected.length);
    else
        return -1;
}

function getKeysDiff (actualKeys, expectedKeys) {
    var diffIndex = -1;

    for (var i = 0; i < Math.min(actualKeys.length, expectedKeys.length); i++) {
        if (actualKeys[i] !== expectedKeys[i])
            diffIndex = i;
    }

    if (actualKeys.length !== expectedKeys.length)
        diffIndex = Math.min(Math.max(actualKeys.length - 1, 0), Math.max(expectedKeys.length - 1, 0));

    if (diffIndex > -1)
        return {
            key:      diffIndex,
            actual:   getDescription(actualKeys[diffIndex], true),
            expected: getDescription(expectedKeys[diffIndex], true),
            isArrays: true
        };

    return null;
}

function getStringDiff (actual, expected) {
    var diffIndex = -1,
        minLength = Math.min(actual.length, expected.length);

    for (var strIndex = 0; strIndex < minLength; strIndex++) {
        if (actual[strIndex] !== expected[strIndex]) {
            diffIndex = strIndex;
            break;
        }
    }

    if (diffIndex < 0 && actual.length !== expected.length)
        diffIndex = minLength ? minLength - 1 : 0;

    if (diffIndex > -1)
        return {
            key:       diffIndex,
            actual:    getDescription(actual),
            expected:  getDescription(expected),
            isStrings: true
        };

    return null;
}

function getArraysDiff (actual, expected) {
    var diffIndex = getArrayDiffIndex(actual, expected),
        diffType  = {};

    if (typeof actual[diffIndex] === 'string' && typeof expected[diffIndex] === 'string') {
        diffType.isStrings = true;
        diffType.diffIndex = getStringDiff(actual[diffIndex], expected[diffIndex]).key;
    }
    else if (actual[diffIndex] instanceof Date && expected[diffIndex] instanceof Date)
        diffType.isDates = true;

    if (diffIndex > -1)
        return {
            key:      diffIndex,
            actual:   diffType.isDates ? actual[diffIndex].getTime() : getDescription(actual[diffIndex]),
            expected: diffType.isDates ? expected[diffIndex].getTime() : getDescription(expected[diffIndex]),
            isArrays: true,
            diffType: diffType
        };

    return null;
}

function getKeys (obj) {
    var keys = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    return keys;
}

function getDescription (obj, doNotWrapStr) {
    if (typeof obj === 'string' && !doNotWrapStr)
        return '\'' + obj + '\'';

    if (obj instanceof Date || /string|number|boolean|function/.test(typeof obj))
        return obj.toString();

    //arrays
    if (arrayUtils.isArray(obj)) {
        return getArrayDescription(obj);
    }

    //jQuery objects
    if (isJQueryObj(obj))
        return getArrayDescription(arrayUtils.toArray(obj));

    if (obj === null)
        return 'null';

    if (typeof obj === 'undefined')
        return 'undefined';

    if (domUtils.isDomElement(obj))
        return domUtils.getElementDescription(obj);

    try {
        return JSON.stringify(obj);
    } catch (e) {
        //NOTE: we don't return all object's fields description, because it may be too long
        return obj.toString();
    }
}

function getArrayDescription (arr) {
    var resArr = [];

    for (var i = 0; i < arr.length; i++)
        resArr.push(getDescription(arr[i]));

    return '[' + resArr.join(', ') + ']';
}

var AssertionsAPI = function (onAssertionFailed) {
    this.onAssertionFailed = onAssertionFailed;
};

AssertionsAPI.prototype._fail = function (err) {
    err.stepName      = SETTINGS.get().CURRENT_TEST_STEP_NAME;
    err.__sourceIndex = sourceIndexTracker.currentIndex;
    this.onAssertionFailed(err);
};

AssertionsAPI.prototype.ok = function (actual, message) {
    if (!actual) {
        this._fail({
            type:    ERROR_TYPE.okAssertion,
            message: message,
            actual:  getDescription(actual)
        });
    }
};

AssertionsAPI.prototype.notOk = function (actual, message) {
    if (actual) {
        this._fail({
            type:    ERROR_TYPE.notOkAssertion,
            message: message,
            actual:  getDescription(actual)
        });
    }
};

AssertionsAPI.prototype.eq = function (actual, expected, message) {
    var diff = getObjectsDiff(actual, expected);

    if (diff) {
        this._fail({
            type:      ERROR_TYPE.eqAssertion,
            message:   message,
            actual:    diff.actual,
            expected:  diff.expected,
            key:       diff.key,
            isStrings: diff.isStrings,
            isArrays:  diff.isArrays,
            isObjects: diff.isObjects,
            isDates:   diff.isDates,
            diffType:  diff.diffType || {}
        });
    }
};

AssertionsAPI.prototype.notEq = function (actual, unexpected, message, callback) {
    var diff = getObjectsDiff(actual, unexpected);

    if (!diff) {
        this._fail({
            type:     ERROR_TYPE.notEqAssertion,
            message:  message,
            actual:   getDescription(actual),
            callback: callback
        });
    }
    else if (callback)
        callback();
};

AssertionsAPI.assert = function (operator, args, callback, context) {
    function onMessage (e) {
        if (e.message.cmd === CROSS_DOMAIN_MESSAGES.ASSERT_RESPONSE_CMD) {
            messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
            callback(e.message.err);
        }
    }

    if (context) {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);

        var msg = {
            cmd:      CROSS_DOMAIN_MESSAGES.ASSERT_REQUEST_CMD,
            operator: operator,
            args:     args
        };

        messageSandbox.sendServiceMsg(msg, context);

        return;
    }

    var err           = null,
        assertionsAPI = new AssertionsAPI(function (e) {
            err = e;
        });

    assertionsAPI[operator].apply(assertionsAPI, args);

    callback(err);
};

//NOTE: add sourceIndex wrapper
sourceIndexTracker.wrapTrackableMethods(AssertionsAPI.prototype, [
    'ok', 'notOk', 'eq', 'notEq'
]);


export default AssertionsAPI;
