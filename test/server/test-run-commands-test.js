var expect         = require('chai').expect;
var TYPE           = require('../../lib/test-run/commands/type');
var createCommand  = require('../../lib/test-run/commands').createCommandFromObject;
var ERROR_TYPE     = require('../../lib/errors/test-run/type');
var ERROR_CATEGORY = require('../../lib/errors/test-run/category');

// NOTE: chai's throws doesn't perform deep comparison of error objects
function assertThrow (fn, expectedErr) {
    var actualErr = null;

    try {
        fn();
    }
    catch (err) {
        actualErr = err;
    }

    expect(actualErr).eql(expectedErr);
}

describe('Test run commands', function () {
    describe('Construction from object and serialization', function () {
        it('Should create ClickCommand from object', function () {
            var commandObj = {
                type:     TYPE.click,
                selector: '#yo',
                yo:       'test',

                options: {
                    offsetX: 23,
                    dummy:   'yo'
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX:  23,
                    offsetY:  0,
                    caretPos: null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:     TYPE.click,
                selector: '#yo'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX:  0,
                    offsetY:  0,
                    caretPos: null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });
        });

        it('Should create TestDone command from object', function () {
            var commandObj = { type: TYPE.testDone, hey: '42' };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({ type: TYPE.testDone });
        });
    });

    describe('Validation', function () {
        it('Should validate СlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.click
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionSelectorTypeError,
                    actualType:      'undefined',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 1
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionSelectorTypeError,
                    actualType:      'number',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  1
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionOptionsTypeError,
                    actualType:      'number',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  {
                            offsetX: 'offsetX'
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveNumberOptionError,
                    optionName:      'offsetX',
                    actualValue:     'string',
                    callsite:        null
                }
            );
        });
    });
});
