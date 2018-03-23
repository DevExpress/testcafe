var expect                   = require('chai').expect;
var ActionOptions            = require('../../lib/test-run/commands/options').ActionOptions;
var OffsetOptions            = require('../../lib/test-run/commands/options').OffsetOptions;
var ScrollOptions            = require('../../lib/test-run/commands/options').ScrollOptions;
var MouseOptions             = require('../../lib/test-run/commands/options').MouseOptions;
var DragToElementOptions     = require('../../lib/test-run/commands/options').DragToElementOptions;
var ClickOptions             = require('../../lib/test-run/commands/options').ClickOptions;
var MoveOptions              = require('../../lib/test-run/commands/options').MoveOptions;
var TypeOptions              = require('../../lib/test-run/commands/options').TypeOptions;
var ElementScreenshotOptions = require('../../lib/test-run/commands/options').ElementScreenshotOptions;
var ResizeToFitDeviceOptions = require('../../lib/test-run/commands/options').ResizeToFitDeviceOptions;
var AssertionOptions         = require('../../lib/test-run/commands/options').AssertionOptions;
var ERROR_TYPE               = require('../../lib/errors/test-run/type');

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

describe('Test run command options', function () {
    describe('Construction from object and serialization', function () {
        it('Should create OffsetOptions from object', function () {
            var options = new OffsetOptions({
                offsetY: 15,
                dummy:   false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX: null,
                offsetY: 15,
                speed:   null
            });
        });

        it('Should create ScrollOptions from object', function () {
            var options = new ScrollOptions({
                offsetX: 15,
                dummy:   false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:          15,
                offsetY:          null,
                scrollToCenter:   false,
                speed:            null,
                skipParentFrames: false
            });
        });

        it('Should create MouseOptions from object', function () {
            var options = new MouseOptions({
                offsetX: 15,
                dummy:   false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX: 15,
                offsetY: null,
                speed:   null,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false
                }
            });
        });

        it('Should create ClickOptions from object', function () {
            var options = new ClickOptions({
                offsetX:  15,
                caretPos: 20,
                dummy:    false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:  15,
                offsetY:  null,
                caretPos: 20,
                speed:    null,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false
                }
            });
        });

        it('Should create MoveOptions from object', function () {
            var options = new MoveOptions({
                offsetY:        15,
                dragOffsetX:    20,
                dummy:          false,
                speed:          20,
                holdLeftButton: true,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:        null,
                offsetY:        15,
                speed:          20,
                minMovingTime:  null,
                holdLeftButton: true,
                skipScrolling:  false,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false
                }
            });
        });

        it('Should create TypeOptions from object', function () {
            var options = new TypeOptions({
                offsetX:  15,
                caretPos: 20,
                replace:  true,
                dummy:    false,
                paste:    true,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:  15,
                offsetY:  null,
                caretPos: 20,
                replace:  true,
                paste:    true,
                speed:    null,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false
                }
            });
        });

        it('Should create DragToElementOptions from object', function () {
            var options = new DragToElementOptions({
                offsetX:            15,
                destinationOffsetX: 20,
                dummy:              false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:            15,
                offsetY:            null,
                destinationOffsetX: 20,
                destinationOffsetY: null,
                speed:              null,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false
                }
            });
        });

        it('Should create ElementScreenshotOptions from object', function () {
            var options = new ElementScreenshotOptions({
                scrollTargetX: 42,

                crop: {
                    left:   146,
                    bottom: 50
                },

                includeMargins: true,

                modifiers: {
                    alt: true
                }
            });

            expect(JSON.parse(JSON.stringify(options))).eql({
                scrollTargetX: 42,
                scrollTargetY: null,
                speed:         null,

                crop: {
                    left:   146,
                    right:  null,
                    top:    null,
                    bottom: 50
                },

                includeMargins:  true,
                includeBorders:  true,
                includePaddings: true
            });
        });

        it('Should create ResizeToFitDeviceOptions from object', function () {
            var options = new ResizeToFitDeviceOptions({
                portraitOrientation: true,
                dummy:               false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                portraitOrientation: true
            });
        });

        it('Should create AssertionOptions from object', function () {
            var options = new AssertionOptions({
                timeout: 100,
                dummy:   false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                timeout:               100,
                allowUnawaitedPromise: false
            });
        });
    });

    describe('Validation', function () {
        it('Should validate ActionOptions', function () {
            assertThrow(
                function () {
                    return new ActionOptions({ speed: '1' }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionSpeedOptionError,
                    actualValue:     'string',
                    optionName:      'speed',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new ActionOptions({ speed: 5 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionSpeedOptionError,
                    actualValue:     5,
                    optionName:      'speed',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new ActionOptions({ speed: 0 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionSpeedOptionError,
                    actualValue:     0,
                    optionName:      'speed',
                    callsite:        null
                }
            );
        });

        it('Should validate OffsetOptions', function () {
            assertThrow(
                function () {
                    return new OffsetOptions({ offsetX: null }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    actualValue:     'object',
                    optionName:      'offsetX',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new OffsetOptions({ offsetX: NaN }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    actualValue:     NaN,
                    optionName:      'offsetX',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new OffsetOptions({ offsetX: 3.14 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    actualValue:     3.14,
                    optionName:      'offsetX',
                    callsite:        null
                }
            );
        });

        it('Should validate MouseOptions', function () {
            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { ctrl: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'modifiers.ctrl',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { alt: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'modifiers.alt',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { shift: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'modifiers.shift',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { meta: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'modifiers.meta',
                    callsite:        null
                }
            );
        });

        it('Should validate ClickOptions', function () {
            assertThrow(
                function () {
                    return new ClickOptions({ caretPos: -1 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    actualValue:     -1,
                    optionName:      'caretPos',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new ClickOptions({ caretPos: 3.14 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    actualValue:     3.14,
                    optionName:      'caretPos',
                    callsite:        null
                }
            );
        });

        it('Should validate TypeOptions', function () {
            assertThrow(
                function () {
                    return new TypeOptions({ replace: 42 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'replace',
                    callsite:        null
                }
            );
        });

        it('Should validate DragToElementOptions', function () {
            assertThrow(
                function () {
                    return new DragToElementOptions({ destinationOffsetX: null }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    actualValue:     'object',
                    optionName:      'destinationOffsetX',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new DragToElementOptions({ destinationOffsetY: NaN }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionIntegerOptionError,
                    actualValue:     NaN,
                    optionName:      'destinationOffsetY',
                    callsite:        null
                }
            );
        });

        it('Should validate ResizeToFitDeviceOptions', function () {
            assertThrow(
                function () {
                    return new ResizeToFitDeviceOptions({ portraitOrientation: 1 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionBooleanOptionError,
                    actualValue:     'number',
                    optionName:      'portraitOrientation',
                    callsite:        null
                }
            );
        });

        it('Should validate AssertionOptions', function () {
            assertThrow(
                function () {
                    return new AssertionOptions({ timeout: -1 }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    actualValue:     -1,
                    optionName:      'timeout',
                    callsite:        null
                }
            );

            assertThrow(
                function () {
                    return new AssertionOptions({ timeout: '100' }, true);
                },
                {
                    isTestCafeError: true,
                    type:            ERROR_TYPE.actionPositiveIntegerOptionError,
                    actualValue:     'string',
                    optionName:      'timeout',
                    callsite:        null
                }
            );
        });
    });
});
