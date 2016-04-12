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
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    'yo',

                    modifiers: {
                        ctrl:  true,
                        shift: true,
                        dummy: 'yo',
                        alt:   true,
                        meta:  true
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: true,
                        meta:  true
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

        it('Should create RightClickCommand from object', function () {
            var commandObj = {
                type:     TYPE.rightClick,
                selector: '#yo',
                yo:       'test',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    'yo',

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   true,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.rightClick,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:     TYPE.rightClick,
                selector: '#yo'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.rightClick,
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

        it('Should create DoubleClickCommand from object', function () {
            var commandObj = {
                type:     TYPE.doubleClick,
                selector: '#yo',
                yo:       'test',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    'yo',

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   true,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.doubleClick,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:     TYPE.doubleClick,
                selector: '#yo'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.doubleClick,
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

        it('Should create HoverCommand from object', function () {
            var commandObj = {
                type:     TYPE.hover,
                selector: '#yo',
                yo:       'test',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    'yo',

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   true,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.hover,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX: 23,
                    offsetY: 32,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:     TYPE.hover,
                selector: '#yo'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.hover,
                selector: "(function () { return document.querySelector('#yo') })()",

                options: {
                    offsetX: 0,
                    offsetY: 0,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });
        });

        it('Should create DragCommand from object', function () {
            var commandObj = {
                type:        TYPE.drag,
                selector:    '#yo',
                dragOffsetX: 10,
                dragOffsetY: -15,
                dummy:       false,

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    1,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   true,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:        TYPE.drag,
                selector:    "(function () { return document.querySelector('#yo') })()",
                dragOffsetX: 10,
                dragOffsetY: -15,

                options: {
                    offsetX: 23,
                    offsetY: 32,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:        TYPE.drag,
                selector:    '#yo',
                dragOffsetX: 10,
                dragOffsetY: -15
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:        TYPE.drag,
                selector:    "(function () { return document.querySelector('#yo') })()",
                dragOffsetX: 10,
                dragOffsetY: -15,

                options: {
                    offsetX: 0,
                    offsetY: 0,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });
        });

        it('Should create DragToElementCommand from object', function () {
            var commandObj = {
                type:                TYPE.dragToElement,
                selector:            '#yo',
                destinationSelector: '#destination',
                dragOffsetX:         10,

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    1,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   true,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:                TYPE.dragToElement,
                selector:            "(function () { return document.querySelector('#yo') })()",
                destinationSelector: "(function () { return document.querySelector('#destination') })()",

                options: {
                    offsetX: 23,
                    offsetY: 32,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:                TYPE.dragToElement,
                selector:            '#yo',
                destinationSelector: '#destination'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:                TYPE.dragToElement,
                selector:            "(function () { return document.querySelector('#yo') })()",
                destinationSelector: "(function () { return document.querySelector('#destination') })()",

                options: {
                    offsetX: 0,
                    offsetY: 0,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });
        });

        it('Should create TypeTextCommand from object', function () {
            var commandObj = {
                type:     TYPE.typeText,
                selector: '#yo',
                text:     'testText',
                yo:       'test',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    dummy:    'yo',
                    replace:  true,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        dummy: 'yo',
                        alt:   false,
                        meta:  false
                    }
                }
            };

            var command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.typeText,
                selector: "(function () { return document.querySelector('#yo') })()",
                text:     'testText',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    replace:  true,

                    modifiers: {
                        ctrl:  true,
                        alt:   false,
                        shift: false,
                        meta:  false
                    }
                }
            });

            commandObj = {
                type:     TYPE.typeText,
                selector: '#yo',
                text:     'testText'
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.typeText,
                selector: "(function () { return document.querySelector('#yo') })()",
                text:     'testText',

                options: {
                    offsetX:  0,
                    offsetY:  0,
                    caretPos: null,
                    replace:  false,

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
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetX',
                    actualValue:     'string',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  {
                            offsetX: 10.5
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetX',
                    actualValue:     10.5,
                    callsite:        null
                }
            );
        });

        it('Should validate RightСlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.rightClick
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
                        type:     TYPE.rightClick,
                        selector: true
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionSelectorTypeError,
                    actualType:      'boolean',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  'options'
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionOptionsTypeError,
                    actualType:      'string',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  {
                            offsetX: false
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetX',
                    actualValue:     'boolean',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  {
                            modifiers: {
                                shift: 'true'
                            }
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    optionName:      'modifiers.shift',
                    actualValue:     'string',
                    callsite:        null
                }
            );
        });

        it('Should validate DoubleСlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.doubleClick
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
                        type:     TYPE.doubleClick,
                        selector: true
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionSelectorTypeError,
                    actualType:      'boolean',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.doubleClick,
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
                        type:     TYPE.doubleClick,
                        selector: 'element',
                        options:  {
                            caretPos: '5'
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'caretPos',
                    actualValue:     'string',
                    callsite:        null
                }
            );
        });

        it('Should validate HoverСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.hover
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
                        type:     TYPE.hover,
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
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  true
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionOptionsTypeError,
                    actualType:      'boolean',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  {
                            offsetX: 'offsetX'
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetX',
                    actualValue:     'string',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  {
                            offsetY: -10
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetY',
                    actualValue:     -10,
                    callsite:        null
                }
            );
        });

        it('Should validate DragСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.drag
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
                        type:     TYPE.drag,
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
                        type:     TYPE.drag,
                        selector: 'element'
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    optionName:      'dragOffsetX',
                    actualValue:     'undefined',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 10
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    optionName:      'dragOffsetY',
                    actualValue:     'undefined',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 10,
                        dragOffsetY: 10.5
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    optionName:      'dragOffsetY',
                    actualValue:     10.5,
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 1,
                        dragOffsetY: -1,
                        options:     1
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
        });

        it('Should validate DragToElementСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.dragToElement
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
                        type:     TYPE.dragToElement,
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
                        type:     TYPE.dragToElement,
                        selector: 'element'
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.dragDestinationSelectorTypeError,
                    actualType:      'undefined',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:                TYPE.dragToElement,
                        selector:            'element',
                        destinationSelector: 1
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.dragDestinationSelectorTypeError,
                    actualType:      'number',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:                TYPE.dragToElement,
                        selector:            'element',
                        destinationSelector: 'destination',
                        options:             1
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
        });

        it('Should validate TypeTextСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.typeText
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
                        type:     TYPE.typeText,
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
                        type:     TYPE.typeText,
                        selector: 'element'
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionStringArgumentError,
                    argumentName:    'text',
                    actualType:      'undefined',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     2
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionStringArgumentError,
                    argumentName:    'text',
                    actualType:      'number',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     ''
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionStringArgumentError,
                    argumentName:    'text',
                    actualType:      'empty',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  true
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionOptionsTypeError,
                    actualType:      'boolean',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  {
                            offsetX: 'offsetX'
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    optionName:      'offsetX',
                    actualValue:     'string',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  {
                            replace: 10
                        }
                    });
                },
                {
                    isTestCafeError: true,
                    category:        ERROR_CATEGORY.actionError,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    optionName:      'replace',
                    actualValue:     'number',
                    callsite:        null
                }
            );
        });
    });
});
