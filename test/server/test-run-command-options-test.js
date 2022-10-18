const expect = require('chai').expect;
const {
    ActionOptions,
    OffsetOptions,
    ScrollOptions,
    MouseOptions,
    DragToElementOptions,
    ClickOptions,
    MoveOptions,
    TypeOptions,
    ElementScreenshotOptions,
    ResizeToFitDeviceOptions,
    AssertionOptions,
    CookieOptions,
    SkipJsErrorsOptions,
}      = require('../../lib/test-run/commands/options');

// NOTE: chai's throws doesn't perform deep comparison of error objects
function assertThrow (fn, expectedErr) {
    let actualErr = null;

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
            const options = new OffsetOptions({
                offsetY: 15,
                dummy:   false,
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX: null,
                offsetY: 15,
                speed:   null,
            });
        });

        it('Should create ScrollOptions from object', function () {
            const options = new ScrollOptions({
                offsetX: 15,
                dummy:   false,
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:          15,
                offsetY:          null,
                scrollToCenter:   false,
                speed:            null,
                skipParentFrames: false,
            });
        });

        it('Should create MouseOptions from object', function () {
            const options = new MouseOptions({
                offsetX: 15,
                dummy:   false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo',
                },
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX: 15,
                offsetY: null,
                speed:   null,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false,
                },
            });
        });

        it('Should create ClickOptions from object', function () {
            const options = new ClickOptions({
                offsetX:  15,
                caretPos: 20,
                dummy:    false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo',
                },
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
                    meta:  false,
                },
            });
        });

        it('Should create MoveOptions from object', function () {
            const options = new MoveOptions({
                offsetY:        15,
                dragOffsetX:    20,
                dummy:          false,
                speed:          20,
                holdLeftButton: true,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo',
                },
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX:                 null,
                offsetY:                 15,
                speed:                   20,
                minMovingTime:           null,
                holdLeftButton:          true,
                skipDefaultDragBehavior: false,
                skipScrolling:           false,

                modifiers: {
                    ctrl:  true,
                    alt:   false,
                    shift: true,
                    meta:  false,
                },
            });
        });

        it('Should create TypeOptions from object', function () {
            const options = new TypeOptions({
                offsetX:  15,
                caretPos: 20,
                replace:  true,
                dummy:    false,
                paste:    true,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo',
                },
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
                    meta:  false,
                },
            });
        });

        it('Should create DragToElementOptions from object', function () {
            const options = new DragToElementOptions({
                offsetX:            15,
                destinationOffsetX: 20,
                dummy:              false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo',
                },
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
                    meta:  false,
                },
            });
        });

        it('Should create ElementScreenshotOptions from object', function () {
            const options = new ElementScreenshotOptions({
                scrollTargetX: 42,

                crop: {
                    left:   146,
                    bottom: 50,
                },

                includeMargins: true,

                modifiers: {
                    alt: true,
                },
            });

            expect(JSON.parse(JSON.stringify(options))).eql({
                scrollTargetX: 42,
                scrollTargetY: null,
                speed:         null,

                crop: {
                    left:   146,
                    right:  null,
                    top:    null,
                    bottom: 50,
                },

                includeMargins:  true,
                includeBorders:  true,
                includePaddings: true,
            });
        });

        it('Should create ResizeToFitDeviceOptions from object', function () {
            const options = new ResizeToFitDeviceOptions({
                portraitOrientation: true,
                dummy:               false,
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                portraitOrientation: true,
            });
        });

        it('Should create AssertionOptions from object', function () {
            const options = new AssertionOptions({
                timeout: 100,
                dummy:   false,
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                timeout:               100,
                allowUnawaitedPromise: false,
            });
        });

        it('Should create CookieOptions from object', function () {
            const options = new CookieOptions({
                name:     'cookieName',
                value:    'cookieValue',
                domain:   'localhost',
                path:     '/',
                expires:  'Infinity',
                maxAge:   'Infinity',
                secure:   false,
                httpOnly: true,
                sameSite: 'none',
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                name:     'cookieName',
                value:    'cookieValue',
                domain:   'localhost',
                path:     '/',
                expires:  'Infinity',
                maxAge:   'Infinity',
                secure:   false,
                httpOnly: true,
                sameSite: 'none',
            });
        });
    });

    describe('Validation', function () {
        it('Should throw an error if the invalid property is in any object inherited from "Assignable"', function () {
            assertThrow(
                function () {
                    return new ActionOptions({ speed: '1', invalidProp: 'value' }, true);
                },
                {
                    isTestCafeError:     true,
                    code:                'E100',
                    objectName:          'ActionOptions',
                    propertyName:        'invalidProp',
                    availableProperties: ['speed'],
                    callsite:            null,
                }
            );

            assertThrow(
                function () {
                    return new ClickOptions({ invalidProp: 'value' }, true);
                },
                {
                    isTestCafeError:     true,
                    code:                'E100',
                    objectName:          'ClickOptions',
                    propertyName:        'invalidProp',
                    availableProperties: [
                        'caretPos',
                        'isDefaultOffset',
                        'modifiers',
                        'offsetX',
                        'offsetY',
                        'speed',
                    ],
                    callsite: null,
                }
            );

            assertThrow(
                function () {
                    return new SkipJsErrorsOptions({ message: '1', invalidProp: 'value' }, true);
                },
                {
                    isTestCafeError:     true,
                    code:                'E100',
                    objectName:          'SkipJsErrorsOptions',
                    propertyName:        'invalidProp',
                    availableProperties: [
                        'message',
                        'pageUrl',
                        'stack',
                    ],
                    callsite: null,
                }
            );
        });

        it('Should validate ActionOptions', function () {
            assertThrow(
                function () {
                    return new ActionOptions({ speed: '1' }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E12',
                    actualValue:     'string',
                    optionName:      'ActionOptions.speed',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new ActionOptions({ speed: 5 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E12',
                    actualValue:     5,
                    optionName:      'ActionOptions.speed',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new ActionOptions({ speed: 0 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E12',
                    actualValue:     0,
                    optionName:      'ActionOptions.speed',
                    callsite:        null,
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
                    code:            'E9',
                    actualValue:     'object',
                    optionName:      'OffsetOptions.offsetX',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new OffsetOptions({ offsetX: NaN }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    actualValue:     NaN,
                    optionName:      'OffsetOptions.offsetX',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new OffsetOptions({ offsetX: 3.14 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    actualValue:     3.14,
                    optionName:      'OffsetOptions.offsetX',
                    callsite:        null,
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
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'ModifiersOptions.ctrl',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { alt: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'ModifiersOptions.alt',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { shift: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'ModifiersOptions.shift',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new MouseOptions({ modifiers: { meta: 42 } }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'ModifiersOptions.meta',
                    callsite:        null,
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
                    code:            'E10',
                    actualValue:     -1,
                    optionName:      'ClickOptions.caretPos',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new ClickOptions({ caretPos: 3.14 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E10',
                    actualValue:     3.14,
                    optionName:      'ClickOptions.caretPos',
                    callsite:        null,
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
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'TypeOptions.replace',
                    callsite:        null,
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
                    code:            'E9',
                    actualValue:     'object',
                    optionName:      'DragToElementOptions.destinationOffsetX',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new DragToElementOptions({ destinationOffsetY: NaN }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    actualValue:     NaN,
                    optionName:      'DragToElementOptions.destinationOffsetY',
                    callsite:        null,
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
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'ResizeToFitDeviceOptions.portraitOrientation',
                    callsite:        null,
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
                    code:            'E10',
                    actualValue:     -1,
                    optionName:      'AssertionOptions.timeout',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new AssertionOptions({ timeout: '100' }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E10',
                    actualValue:     'string',
                    optionName:      'AssertionOptions.timeout',
                    callsite:        null,
                }
            );
        });

        it('Should validate CookieOptions', function () {
            assertThrow(
                function () {
                    return new CookieOptions({ name: false }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E90',
                    actualValue:     'boolean',
                    optionName:      'CookieOptions.name',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ value: {} }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E90',
                    actualValue:     'object',
                    optionName:      'CookieOptions.value',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ domain: 213 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E90',
                    actualValue:     'number',
                    optionName:      'CookieOptions.domain',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ path: true }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E90',
                    actualValue:     'boolean',
                    optionName:      'CookieOptions.path',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ expires: -Infinity }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E91',
                    actualValue:     -Infinity,
                    optionName:      'CookieOptions.expires',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ maxAge: 'age' }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E92',
                    actualValue:     'string',
                    optionName:      'CookieOptions.maxAge',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ secure: 0 }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    actualValue:     'number',
                    optionName:      'CookieOptions.secure',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ httpOnly: 'str' }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    actualValue:     'string',
                    optionName:      'CookieOptions.httpOnly',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return new CookieOptions({ sameSite: {} }, true);
                },
                {
                    isTestCafeError: true,
                    code:            'E90',
                    actualValue:     'object',
                    optionName:      'CookieOptions.sameSite',
                    callsite:        null,
                }
            );
        });
    });
});
