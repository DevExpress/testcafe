const { assert, expect }                  = require('chai');
const { pull: remove, chain, values }     = require('lodash');
const TestRun                             = require('../../lib/test-run');
const TEST_RUN_PHASE                      = require('../../lib/test-run/phase');
const { TEST_RUN_ERRORS, RUNTIME_ERRORS } = require('../../lib/errors/types');
const TestRunErrorFormattableAdapter      = require('../../lib/errors/test-run/formattable-adapter');
const testCallsite                        = require('./data/test-callsite');
const assertTestRunError                  = require('./helpers/assert-test-run-error');

const {
    AssertionExecutableArgumentError,
    AssertionWithoutMethodCallError,
    AssertionUnawaitedPromiseError,
    ActionIntegerOptionError,
    ActionPositiveIntegerOptionError,
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionBooleanOptionError,
    ActionBooleanArgumentError,
    ActionSpeedOptionError,
    ActionSelectorError,
    ActionOptionsTypeError,
    ActionStringArgumentError,
    ActionNullableStringArgumentError,
    ActionStringOrStringArrayArgumentError,
    ActionStringArrayElementError,
    ActionFunctionArgumentError,
    PageLoadError,
    UncaughtErrorOnPage,
    UncaughtErrorInTestCode,
    UncaughtErrorInClientFunctionCode,
    UncaughtNonErrorObjectInTestCode,
    UncaughtErrorInCustomDOMPropertyCode,
    UnhandledPromiseRejectionError,
    UncaughtExceptionError,
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
    ActionElementNonEditableError,
    ActionElementNonContentEditableError,
    ActionRootContainerNotFoundError,
    ActionElementNotTextAreaError,
    ActionIncorrectKeysError,
    ActionCannotFindFileToUploadError,
    ActionElementIsNotFileInputError,
    ActionUnsupportedDeviceTypeError,
    ActionInvalidScrollTargetError,
    ClientFunctionExecutionInterruptionError,
    ActionElementNotIframeError,
    ActionIframeIsNotLoadedError,
    CurrentIframeIsNotLoadedError,
    CurrentIframeNotFoundError,
    CurrentIframeIsInvisibleError,
    MissingAwaitError,
    ExternalAssertionLibraryError,
    DomNodeClientFunctionResultError,
    InvalidSelectorResultError,
    NativeDialogNotHandledError,
    UncaughtErrorInNativeDialogHandler,
    SetNativeDialogHandlerCodeWrongTypeError,
    CannotObtainInfoForElementSpecifiedBySelectorError,
    WindowDimensionsOverflowError,
    ForbiddenCharactersInScreenshotPathError,
    InvalidElementScreenshotDimensionsError,
    SetTestSpeedArgumentError,
    RoleSwitchInRoleInitializerError,
    ActionRoleArgumentError,
    RequestHookNotImplementedMethodError,
    RequestHookUnhandledError,
    UncaughtErrorInCustomClientScriptCode,
    UncaughtErrorInCustomClientScriptLoadedFromModule,
    UncaughtErrorInCustomScript,
    UncaughtTestCafeErrorInCustomScript,
    ChildWindowIsNotLoadedError,
    ChildWindowNotFoundError,
    CannotSwitchToWindowError,
    CloseChildWindowError,
    ChildWindowClosedBeforeSwitchingError,
    WindowNotFoundError,
    ParentWindowNotFoundError,
    PreviousWindowNotFoundError,
    SwitchToWindowPredicateError,
    CannotCloseWindowWithChildrenError,
    MultipleWindowsModeIsDisabledError,
    CannotCloseWindowWithoutParentError,
    MultipleWindowsModeIsNotAvailableInRemoteBrowserError,
    CannotRestoreChildWindowError
} = require('../../lib/errors/test-run');

const untestedErrorTypes = Object.keys(TEST_RUN_ERRORS).map(key => TEST_RUN_ERRORS[key]);

const userAgentMock = 'Chrome 15.0.874.120 / macOS 10.15';

function equalAssertArray () {
    expect([1, 2, 3, [4, 5], 6]).eql([1, 4, 2, 3, [5, 6, [7]]]);
}

function equalAssertBoolean () {
    expect(true).eql(false);
}

function equalAssertBuffer () {
    expect(Buffer.from('test')).eql(Buffer.from([1, 2, 3]));
}

function equalAssertEmptyString () {
    expect([]).eql('');
}

function equalAssertFunction () {
    expect(function () {
        return true;
    }).eql(function () {
        return false;
    });
}

function equalAssertNumber () {
    expect(1).eql(2);
}

function equalAssertObject () {
    const obj1 = {
        first: {
            second: {
                third: {
                    fourth: {
                        fifth: {
                            hello: 'world',
                            six:   '6'
                        }
                    }
                }
            }
        }
    };

    const obj2 = {
        first: {
            second: {
                third: {
                    fourth: {
                        fifth: {
                            hello: 'world'
                        }
                    }
                }
            }
        }
    };

    expect(obj1).eql(obj2);
}

function equalAssertString () {
    expect('line1\nline2').eql('line1');
}

function equalAssertUndefinedNull () {
    expect(void 0).eql(null);
}

function notEqualAssertString () {
    assert.notEqual('foo', 'foo');
}

function okAssertBoolean () {
    expect(false).ok;
}

function notOkAssertBoolean () {
    expect(true).not.ok;
}

function containsAssertString () {
    expect('foo').contains('bar');
}

function notContainsAssertString () {
    expect('foobar').not.contains('bar');
}

function matchAssertRegExp () {
    expect('some text').match(/some regexp/);
}

function notMatchAssertRegExp () {
    expect('some text').not.match(/some \w+/);
}

function typeOfAssertNull () {
    assert.typeOf(false, 'null');
}

function notTypeOfAssertNull () {
    assert.notTypeOf(null, 'null');
}

function withinAssertNumber () {
    expect(0).within(1, 2);
}

function notWithinAssertNumber () {
    expect(0).not.within(0, 1);
}

function ltAssertNumber () {
    expect(1).lt(0);
}

function lteAssertNumber () {
    expect(1).lte(0);
}

function gtAssertNumber () {
    expect(0).gt(1);
}

function gteAssertNumber () {
    expect(0).gte(1);
}

const createAssertionError = fn => {
    try {
        fn();
    }
    catch (err) {
        return err;
    }

    return null;
};

const ASSERT_ERRORS = {
    equal: {
        array:         createAssertionError(equalAssertArray),
        boolean:       createAssertionError(equalAssertBoolean),
        buffer:        createAssertionError(equalAssertBuffer),
        emptyString:   createAssertionError(equalAssertEmptyString),
        function:      createAssertionError(equalAssertFunction),
        number:        createAssertionError(equalAssertNumber),
        object:        createAssertionError(equalAssertObject),
        string:        createAssertionError(equalAssertString),
        undefinedNull: createAssertionError(equalAssertUndefinedNull)
    },
    notEqual:    { string: createAssertionError(notEqualAssertString) },
    ok:          { boolean: createAssertionError(okAssertBoolean) },
    notOk:       { boolean: createAssertionError(notOkAssertBoolean) },
    contains:    { string: createAssertionError(containsAssertString) },
    notContains: { string: createAssertionError(notContainsAssertString) },
    match:       { regexp: createAssertionError(matchAssertRegExp) },
    notMatch:    { regexp: createAssertionError(notMatchAssertRegExp) },
    typeOf:      { null: createAssertionError(typeOfAssertNull) },
    notTypeOf:   { null: createAssertionError(notTypeOfAssertNull) },
    within:      { number: createAssertionError(withinAssertNumber) },
    notWithin:   { number: createAssertionError(notWithinAssertNumber) },
    lt:          { number: createAssertionError(ltAssertNumber) },
    lte:         { number: createAssertionError(lteAssertNumber) },
    gt:          { number: createAssertionError(gtAssertNumber) },
    gte:         { number: createAssertionError(gteAssertNumber) }
};

const longSelector = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

function getErrorAdapter (err) {
    const screenshotPath = '/unix/path/with/<tag>';

    return new TestRunErrorFormattableAdapter(err, {
        userAgent:      userAgentMock,
        screenshotPath: screenshotPath,
        callsite:       testCallsite,
        testRunPhase:   TEST_RUN_PHASE.initial
    });
}

function assertErrorMessage (file, err) {
    assertTestRunError(err, '../data/expected-test-run-errors/' + file);

    // NOTE: check that the list of error types contains an
    // error of this type and remove tested messages from the list
    expect(untestedErrorTypes.includes(err.code)).to.be.ok;
    remove(untestedErrorTypes, err.code);
}

describe('Error formatting', () => {
    describe('Errors', () => {
        it('Base error formattable adapter properties', () => {
            const testRunMock = TestRun.prototype;

            Object.assign(testRunMock, {
                session:           { id: 'test-run-id' },
                browserConnection: { userAgent: 'chrome' },
                errScreenshotPath: 'screenshot-path',
                phase:             'test-run-phase',
                callsite:          'callsite',
                errs:              []
            });

            TestRun.prototype.addError.call(testRunMock, { callsite: 'callsite' });

            const err = testRunMock.errs[0];

            expect(err).instanceOf(TestRunErrorFormattableAdapter);

            expect(err).eql({
                userAgent:      'chrome',
                screenshotPath: 'screenshot-path',
                testRunId:      'test-run-id',
                testRunPhase:   'test-run-phase',
                callsite:       'callsite'
            });
        });

        it('Should not throw if the specified decorator was not found', () => {
            expect(() => {
                const error = new ExternalAssertionLibraryError(createAssertionError(equalAssertArray), testCallsite);

                error.diff = '<div class="unknown-decorator">text</div>';

                getErrorAdapter(error).formatMessage('', 100);
            }).to.not.throw();
        });

        it('Should format "actionIntegerOptionError" message', () => {
            assertErrorMessage('action-integer-option-error', new ActionIntegerOptionError('offsetX', '1.01'));
        });

        it('Should format "actionPositiveIntegerOptionError" message', () => {
            assertErrorMessage('action-positive-integer-option-error', new ActionPositiveIntegerOptionError('caretPos', '-1'));
        });

        it('Should format "actionIntegerArgumentError" message', () => {
            assertErrorMessage('action-integer-argument-error', new ActionIntegerArgumentError('dragOffsetX', 'NaN'));
        });

        it('Should format "actionPositiveIntegerArgumentError" message', () => {
            assertErrorMessage('action-positive-integer-argument-error', new ActionPositiveIntegerArgumentError('startPos', '-1'));
        });

        it('Should format "actionBooleanOptionError" message', () => {
            assertErrorMessage('action-boolean-option-error', new ActionBooleanOptionError('modifier.ctrl', 'object'));
        });

        it('Should format the "actionBooleanArgumentError" message', () => {
            assertErrorMessage('action-boolean-argument-error', new ActionBooleanArgumentError('isAsyncExpression', 'object'));
        });

        it('Should format "actionSpeedOptionError" message', () => {
            assertErrorMessage('action-speed-option-error', new ActionSpeedOptionError('speed', 'object'));
        });

        it('Should format "pageLoadError" message', () => {
            assertErrorMessage('page-load-error', new PageLoadError('Failed to find a DNS-record for the resource', 'http://some-url.example.com'));
        });

        it('Should format "uncaughtErrorOnPage" message (with error stack)', () => {
            const errStack = [
                'Test error:',
                '    at method3 (http://example.com):1:3',
                '    at method2 (http://example.com):1:2',
                '    at method1 (http://example.com):1:1'
            ].join('\n');

            assertErrorMessage('uncaught-js-error-on-page', new UncaughtErrorOnPage(errStack, 'http://example.org'));
        });

        it('Should format "uncaughtErrorInTestCode" message', () => {
            assertErrorMessage('uncaught-js-error-in-test-code', new UncaughtErrorInTestCode(new Error('Custom script error'), testCallsite));
        });

        it('Should format "uncaughtNonErrorObjectInTestCode" message', () => {
            assertErrorMessage('uncaught-non-error-object-in-test-code', new UncaughtNonErrorObjectInTestCode('Hey ya!'));
        });

        it('Should format "uncaughtErrorInAddCustomDOMProperties" message', () => {
            assertErrorMessage('uncaught-error-in-add-custom-dom-properties-code', new UncaughtErrorInCustomDOMPropertyCode(testCallsite, new Error('Custom script error'), 'prop'));
        });

        it('Should format "unhandledPromiseRejectionError" message', () => {
            assertErrorMessage('unhandled-promise-rejection-error', new UnhandledPromiseRejectionError('Hey ya!'));
        });

        it('Should format "uncaughtExceptionError" message', () => {
            assertErrorMessage('uncaught-exception-error', new UncaughtExceptionError('Hey ya!'));
        });

        it('Should format "actionElementNotFoundError" message', () => {
            assertErrorMessage('action-element-not-found-error', new ActionElementNotFoundError({
                apiFnChain: [longSelector, 'one', 'two', 'three'],
                apiFnIndex: 1
            }));
        });

        it('Should format "actionElementIsInvisibleError" message', () => {
            assertErrorMessage('action-element-is-invisible-error', new ActionElementIsInvisibleError());
        });

        it('Should format "actionSelectorMatchesWrongNodeTypeError" message', () => {
            assertErrorMessage('action-selector-matches-wrong-node-type-error', new ActionSelectorMatchesWrongNodeTypeError('text'));
        });

        it('Should format "actionElementNonEditableError" message', () => {
            assertErrorMessage('action-element-non-editable-error', new ActionElementNonEditableError());
        });

        it('Should format "actionRootContainerNotFoundError" message', () => {
            assertErrorMessage('action-root-container-not-found-error', new ActionRootContainerNotFoundError());
        });

        it('Should format "actionElementNonContentEditableError" message', () => {
            assertErrorMessage('action-element-non-content-editable-error', new ActionElementNonContentEditableError('startSelector'));
        });

        it('Should format "actionElementNotTextAreaError" message', () => {
            assertErrorMessage('action-element-not-text-area-error', new ActionElementNotTextAreaError());
        });

        it('Should format "actionElementNotIframeError" message', () => {
            assertErrorMessage('action-element-not-iframe-error', new ActionElementNotIframeError());
        });

        it('Should format "actionSelectorError" message', () => {
            assertErrorMessage('action-selector-error', new ActionSelectorError('selector', { rawMessage: 'Yo!' }, true));
        });

        it('Should format "actionOptionsTypeError" message', () => {
            assertErrorMessage('action-options-type-error', new ActionOptionsTypeError(typeof 1));
        });

        it('Should format "actionAdditionalElementNotFoundError" message', () => {
            assertErrorMessage('action-additional-element-not-found-error', new ActionAdditionalElementNotFoundError('startSelector', {
                apiFnChain: [longSelector, 'one', 'two', 'three'],
                apiFnIndex: 1
            }));
        });

        it('Should format "actionAdditionalElementIsInvisibleError" message', () => {
            assertErrorMessage('action-additional-element-is-invisible-error', new ActionAdditionalElementIsInvisibleError('startSelector'));
        });

        it('Should format "actionAdditionalSelectorMatchesWrongNodeTypeError" message', () => {
            assertErrorMessage('action-additional-selector-matches-wrong-node-type-error', new ActionAdditionalSelectorMatchesWrongNodeTypeError('startSelector', 'text'));
        });

        it('Should format "actionStringArgumentError" message', () => {
            assertErrorMessage('action-string-argument-error', new ActionStringArgumentError('text', typeof 1));
        });

        it('Should format "actionNullableStringArgumentError" message', () => {
            assertErrorMessage('action-nullable-string-argument-error', new ActionNullableStringArgumentError('text', typeof 1));
        });

        it('Should format "actionIncorrectKeysError" message', () => {
            assertErrorMessage('action-incorrect-keys-error', new ActionIncorrectKeysError('keys'));
        });

        it('Should format "actionNonEmptyStringArrayArgumentError" message', () => {
            assertErrorMessage('action-non-empty-string-array-argument-error', new ActionStringOrStringArrayArgumentError('array', null));
        });

        it('Should format "actionStringArrayElementError" message', () => {
            assertErrorMessage('action-string-array-element-error', new ActionStringArrayElementError('array', 'number', 1));
        });

        it('Should format "actionElementIsNotFileInputError" message', () => {
            assertErrorMessage('action-element-is-not-file-input-error', new ActionElementIsNotFileInputError());
        });

        it('Should format "actionCannotFindFileToUploadError" message', () => {
            const filePaths        = ['/path/1', '/path/2'];
            const scannedFilepaths = ['full-path-to/path/1', 'full-path-to/path/2'];
            const err              = new ActionCannotFindFileToUploadError(filePaths, scannedFilepaths);

            assertErrorMessage('action-cannot-find-file-to-upload-error', err);
        });

        it('Should format "actionUnsupportedDeviceTypeError" message', () => {
            assertErrorMessage('action-unsupported-device-type-error', new ActionUnsupportedDeviceTypeError('device', 'iPhone 555'));
        });

        it('Should format "actionInvalidScrollTargetError" message', () => {
            assertErrorMessage('action-invalid-scroll-target-error', new ActionInvalidScrollTargetError(false, true));
        });

        it('Should format "actionIframeIsNotLoadedError" message', () => {
            assertErrorMessage('action-iframe-is-not-loaded-error', new ActionIframeIsNotLoadedError());
        });

        it('Should format "currentIframeIsNotLoadedError" message', () => {
            assertErrorMessage('current-iframe-is-not-loaded-error', new CurrentIframeIsNotLoadedError());
        });

        it('Should format "currentIframeNotFoundError" message', () => {
            assertErrorMessage('current-iframe-not-found-error', new CurrentIframeNotFoundError());
        });

        it('Should format "currentIframeIsInvisibleError" message', () => {
            assertErrorMessage('current-iframe-is-invisible-error', new CurrentIframeIsInvisibleError());
        });

        it('Should format "missingAwaitError"', () => {
            assertErrorMessage('missing-await-error', new MissingAwaitError(testCallsite));
        });

        describe('Should format "externalAssertionLibraryError"', () => {
            const filepath = function (assertion, filename) {
                return `../data/expected-test-run-errors/external-assertion-library-errors/builtin/${assertion}/${filename}`;
            };

            it('Deep Equal', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.array, testCallsite), filepath('equal', 'array'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.boolean, testCallsite), filepath('equal', 'boolean'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.buffer, testCallsite), filepath('equal', 'buffer'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.emptyString, testCallsite), filepath('equal', 'empty-string'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.function, testCallsite), filepath('equal', 'function'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.number, testCallsite), filepath('equal', 'number'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.object, testCallsite), filepath('equal', 'object'));
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.string, testCallsite), filepath('equal', 'string'));

                assertErrorMessage('external-assertion-library-errors/builtin/equal/undefined-null', new ExternalAssertionLibraryError(ASSERT_ERRORS.equal.undefinedNull, testCallsite));
            });

            it('Not Deep Equal', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notEqual.string, testCallsite), filepath('not-equal', 'string'));
            });

            it('Ok', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.ok.boolean, testCallsite), filepath('ok', 'boolean'));
            });

            it('Not Ok', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notOk.boolean, testCallsite), filepath('not-ok', 'boolean'));
            });

            it('Contains', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.contains.string, testCallsite), filepath('contains', 'string'));
            });

            it('Not Contains', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notContains.string, testCallsite), filepath('not-contains', 'string'));
            });

            it('Match', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.match.regexp, testCallsite), filepath('match', 'regexp'));
            });

            it('Not Match', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notMatch.regexp, testCallsite), filepath('not-match', 'regexp'));
            });

            it('Type of', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.typeOf.null, testCallsite), filepath('type-of', 'null'));
            });

            it('Not Type of', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notTypeOf.null, testCallsite), filepath('not-type-of', 'null'));
            });

            it('Within', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.within.number, testCallsite), filepath('within', 'number'));
            });

            it('Not Within', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.notWithin.number, testCallsite), filepath('not-within', 'number'));
            });

            it('Less than', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.lt.number, testCallsite), filepath('less-than', 'number'));
            });

            it('Less than or Equal to', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.lte.number, testCallsite), filepath('less-than-or-equal', 'number'));
            });

            it('Greater than', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.gt.number, testCallsite), filepath('greater-than', 'number'));
            });

            it('Greater than or Equal to', () => {
                assertTestRunError(new ExternalAssertionLibraryError(ASSERT_ERRORS.gte.number, testCallsite), filepath('greater-than-or-equal', 'number'));
            });
        });

        it('Should format "uncaughtErrorInClientFunctionCode"', () => {
            assertErrorMessage('uncaught-error-in-client-function-code', new UncaughtErrorInClientFunctionCode('Selector', new Error('Some error.')));
        });

        it('Should format "clientFunctionExecutionInterruptionError"', () => {
            assertErrorMessage('client-function-execution-interruption-error', new ClientFunctionExecutionInterruptionError('eval'));
        });

        it('Should format "domNodeClientFunctionResultError"', () => {
            assertErrorMessage('dom-node-client-function-result-error', new DomNodeClientFunctionResultError('ClientFunction'));
        });

        it('Should format "invalidSelectorResultError"', () => {
            assertErrorMessage('invalid-selector-result-error', new InvalidSelectorResultError());
        });

        it('Should format "nativeDialogNotHandledError"', () => {
            assertErrorMessage('native-dialog-not-handled-error', new NativeDialogNotHandledError('alert', 'http://example.org'));
        });

        it('Should format "uncaughtErrorInNativeDialogHandler"', () => {
            assertErrorMessage('uncaught-error-in-native-dialog-handler', new UncaughtErrorInNativeDialogHandler('alert', 'error message', 'http://example.org'));
        });

        it('Should format "setNativeDialogHandlerCodeWrongTypeError"', () => {
            assertErrorMessage('set-native-dialog-handler-code-wrong-type-error', new SetNativeDialogHandlerCodeWrongTypeError('number'));
        });

        it('Should format "cannotObtainInfoForElementSpecifiedBySelectorError"', () => {
            assertErrorMessage('cannot-obtain-info-for-element-specified-by-selector-error', new CannotObtainInfoForElementSpecifiedBySelectorError(testCallsite, {
                apiFnChain: [longSelector, 'one', 'two', 'three'],
                apiFnIndex: 1
            }));
        });

        it('Should format "windowDimensionsOverflowError"', () => {
            assertErrorMessage('window-dimensions-overflow-error', new WindowDimensionsOverflowError());
        });

        it('Should format "forbiddenCharactersInScreenshotPathError"', () => {
            assertErrorMessage('forbidden-characters-in-screenshot-path-error', new ForbiddenCharactersInScreenshotPathError('/root/bla:bla', [{
                chars: ':',
                index: 9
            }]));
        });

        it('Should format "invalidElementScreenshotDimensionsError"', () => {
            assertErrorMessage('invalid-element-screenshot-dimensions-error', new InvalidElementScreenshotDimensionsError(0, 10));
        });

        it('Should format "setTestSpeedArgumentError"', () => {
            assertErrorMessage('set-test-speed-argument-error', new SetTestSpeedArgumentError('speed', 'string'));
        });

        it('Should format "roleSwitchInRoleInitializerError"', () => {
            assertErrorMessage('role-switch-in-role-initializer-error', new RoleSwitchInRoleInitializerError(testCallsite));
        });

        it('Should format "actionRoleArgumentError"', () => {
            assertErrorMessage('action-role-argument-error', new ActionRoleArgumentError('role', 'number'));
        });

        it('Should format "assertionExecutableArgumentError"', () => {
            assertErrorMessage('assertion-executable-argument-error', new AssertionExecutableArgumentError('actual', '1 + temp', { rawMessage: 'Unexpected identifier' }, true));
        });

        it('Should format "assertionWithoutMethodCallError"', () => {
            assertErrorMessage('assertion-without-method-call-error', new AssertionWithoutMethodCallError(testCallsite));
        });

        it('Should format "assertionUnawaitedPromiseError"', () => {
            assertErrorMessage('assertion-unawaited-promise-error', new AssertionUnawaitedPromiseError(testCallsite));
        });

        it('Should format "requestHookNotImplementedError"', () => {
            assertErrorMessage('request-hook-method-not-implemented-error', new RequestHookNotImplementedMethodError('onRequest', 'MyHook'));
        });

        it('Should format "requestHookUnhandledError"', () => {
            assertErrorMessage('request-hook-unhandled-error', new RequestHookUnhandledError(new Error('Test error'), 'MyHook', 'onRequest'));
        });

        it('Should format "uncaughtErrorInCustomClientScriptCode"', () => {
            assertErrorMessage('uncaught-error-in-custom-client-script-code', new UncaughtErrorInCustomClientScriptCode(new TypeError('Cannot read property "prop" of undefined')));
        });

        it('Should format "uncaughtErrorInCustomClientScriptCodeLoadedFromModule"', () => {
            assertErrorMessage('uncaught-error-in-custom-client-script-code-loaded-from-module', new UncaughtErrorInCustomClientScriptLoadedFromModule(new TypeError('Cannot read property "prop" of undefined'), 'test-module'));
        });

        it('Should format "uncaughtErrorInCustomScript"', () => {
            assertErrorMessage('uncaught-error-in-custom-script', new UncaughtErrorInCustomScript(new Error('Test error'), '1+1', 1, 1, 'RAW API callsite'));
        });

        it('Should format "uncaughtTestCafeErrorInCustomScript"', () => {
            const expression  = 'Hey ya!';
            const originError = getErrorAdapter(new UncaughtNonErrorObjectInTestCode(expression));

            assertErrorMessage('uncaught-test-cafe-error-in-custom-script', new UncaughtTestCafeErrorInCustomScript(originError, expression, void 0, void 0, 'RAW API callsite'));
        });

        it('Should format "childWindowIsNotLoadedError"', () => {
            assertErrorMessage('child-window-is-not-loaded-error', new ChildWindowIsNotLoadedError());
        });

        it('Should format "childWindowNotFoundError"', () => {
            assertErrorMessage('child-window-not-found-error', new ChildWindowNotFoundError());
        });

        it('Should format "cannotSwitchToWindowError"', () => {
            assertErrorMessage('cannot-switch-to-child-window-error', new CannotSwitchToWindowError());
        });

        it('Should format "closeChildWindowError"', () => {
            assertErrorMessage('close-child-window-error', new CloseChildWindowError());
        });

        it('Should format "childWindowClosedBeforeSwitchingError"', () => {
            assertErrorMessage('child-window-closed-before-switching-error', new ChildWindowClosedBeforeSwitchingError());
        });

        it('Should format "cannotCloseWindowWithChildrenError"', () => {
            assertErrorMessage('cannot-close-window-with-children-error', new CannotCloseWindowWithChildrenError());
        });

        it('Should format "cannotCloseWindowWithoutParentError"', () => {
            assertErrorMessage('cannot-close-window-without-parent-error', new CannotCloseWindowWithoutParentError());
        });

        it('Should format "windowNotFoundError"', () => {
            assertErrorMessage('window-not-found-error', new WindowNotFoundError());
        });

        it('Should format "parentWindowNotFoundError"', () => {
            assertErrorMessage('parent-window-not-found-error', new ParentWindowNotFoundError());
        });

        it('Should format "previousWindowNotFoundError"', () => {
            assertErrorMessage('previous-window-not-found-error', new PreviousWindowNotFoundError());
        });

        it('Should format "switchToWindowPredicateError"', () => {
            assertErrorMessage('switch-to-window-predicate-error', new SwitchToWindowPredicateError('error message'));
        });

        it('Should format "actionFunctionArgumentError"', () => {
            assertErrorMessage('action-function-argument-error', new ActionFunctionArgumentError('predicate', 'number'));
        });

        it('Should format "multipleWindowsModeIsDisabledError"', () => {
            assertErrorMessage('multiple-windows-mode-is-disabled-error', new MultipleWindowsModeIsDisabledError('openWindow'));
        });

        it('Should format "multipleWindowsModeIsNotSupportedInRemoteBrowserError"', () => {
            assertErrorMessage('multiple-windows-mode-is-not-available-in-remote-browser-error', new MultipleWindowsModeIsNotAvailableInRemoteBrowserError('openWindow'));
        });

        it('Should format "cannotRestoreChildWindowError"', () => {
            assertErrorMessage('cannot-restore-child-window-error', new CannotRestoreChildWindowError());
        });
    });

    describe('Test coverage', () => {
        it('Should test messages for all error codes', () => {
            expect(untestedErrorTypes).to.be.empty;
        });

        it('Errors codes should be unique', () => {
            function getDuplicates (codes) {
                return chain(codes).groupBy().pickBy(x => x.length > 1).keys().value();
            }

            const testRunErrorCodes                    = values(TEST_RUN_ERRORS);
            const runtimeErrorCodes                    = values(RUNTIME_ERRORS);
            const testRunErrorCodeDuplicates           = getDuplicates(testRunErrorCodes);
            const runtimeErrorCodeDuplicates           = getDuplicates(runtimeErrorCodes);
            const testRunAndRuntimeErrorCodeDuplicates = getDuplicates(testRunErrorCodes.concat(runtimeErrorCodes));

            expect(testRunErrorCodeDuplicates, 'TestRunErrorCode duplicates').to.be.empty;
            expect(runtimeErrorCodeDuplicates, 'RuntimeErrorCode duplicates').to.be.empty;
            expect(testRunAndRuntimeErrorCodeDuplicates, 'Intersections between TestRunErrorCodes and RuntimeErrorCodes').to.be.empty;
        });
    });
});
