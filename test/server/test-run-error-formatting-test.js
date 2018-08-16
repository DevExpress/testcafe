const expect                                            = require('chai').expect;
const read                                              = require('read-file-relative').readSync;
const remove                                            = require('lodash').pull;
const escapeRe                                          = require('lodash').escapeRegExp;
const ReporterPluginHost                                = require('../../lib/reporter/plugin-host');
const TEST_RUN_PHASE                                    = require('../../lib/test-run/phase');
const TYPE                                              = require('../../lib/errors/test-run/type');
const TestRunErrorFormattableAdapter                    = require('../../lib/errors/test-run/formattable-adapter');
const testCallsite                                      = require('./data/test-callsite');
const AssertionExecutableArgumentError                  = require('../../lib/errors/test-run').AssertionExecutableArgumentError;
const AssertionUnawaitedPromiseError                    = require('../../lib/errors/test-run').AssertionUnawaitedPromiseError;
const ActionIntegerOptionError                          = require('../../lib/errors/test-run').ActionIntegerOptionError;
const ActionPositiveIntegerOptionError                  = require('../../lib/errors/test-run').ActionPositiveIntegerOptionError;
const ActionIntegerArgumentError                        = require('../../lib/errors/test-run').ActionIntegerArgumentError;
const ActionPositiveIntegerArgumentError                = require('../../lib/errors/test-run').ActionPositiveIntegerArgumentError;
const ActionBooleanOptionError                          = require('../../lib/errors/test-run').ActionBooleanOptionError;
var ActionBooleanArgumentError                        = require('../../lib/errors/test-run').ActionBooleanArgumentError;
const ActionSpeedOptionError                            = require('../../lib/errors/test-run').ActionSpeedOptionError;
const ActionSelectorError                               = require('../../lib/errors/test-run').ActionSelectorError;
const ActionOptionsTypeError                            = require('../../lib/errors/test-run').ActionOptionsTypeError;
const ActionStringArgumentError                         = require('../../lib/errors/test-run').ActionStringArgumentError;
const ActionNullableStringArgumentError                 = require('../../lib/errors/test-run').ActionNullableStringArgumentError;
const ActionStringOrStringArrayArgumentError            = require('../../lib/errors/test-run').ActionStringOrStringArrayArgumentError;
const ActionStringArrayElementError                     = require('../../lib/errors/test-run').ActionStringArrayElementError;
const PageLoadError                                     = require('../../lib/errors/test-run').PageLoadError;
const UncaughtErrorOnPage                               = require('../../lib/errors/test-run').UncaughtErrorOnPage;
const UncaughtErrorInTestCode                           = require('../../lib/errors/test-run').UncaughtErrorInTestCode;
const UncaughtErrorInClientFunctionCode                 = require('../../lib/errors/test-run').UncaughtErrorInClientFunctionCode;
const UncaughtNonErrorObjectInTestCode                  = require('../../lib/errors/test-run').UncaughtNonErrorObjectInTestCode;
const UncaughtErrorInCustomDOMPropertyCode              = require('../../lib/errors/test-run').UncaughtErrorInCustomDOMPropertyCode;
const UnhandledPromiseRejectionError                    = require('../../lib/errors/test-run').UnhandledPromiseRejectionError;
const UncaughtExceptionError                            = require('../../lib/errors/test-run').UncaughtExceptionError;
const ActionElementNotFoundError                        = require('../../lib/errors/test-run').ActionElementNotFoundError;
const ActionElementIsInvisibleError                     = require('../../lib/errors/test-run').ActionElementIsInvisibleError;
const ActionSelectorMatchesWrongNodeTypeError           = require('../../lib/errors/test-run').ActionSelectorMatchesWrongNodeTypeError;
const ActionAdditionalElementNotFoundError              = require('../../lib/errors/test-run').ActionAdditionalElementNotFoundError;
const ActionAdditionalElementIsInvisibleError           = require('../../lib/errors/test-run').ActionAdditionalElementIsInvisibleError;
const ActionAdditionalSelectorMatchesWrongNodeTypeError = require('../../lib/errors/test-run').ActionAdditionalSelectorMatchesWrongNodeTypeError;
const ActionElementNonEditableError                     = require('../../lib/errors/test-run').ActionElementNonEditableError;
const ActionElementNonContentEditableError              = require('../../lib/errors/test-run').ActionElementNonContentEditableError;
const ActionRootContainerNotFoundError                  = require('../../lib/errors/test-run').ActionRootContainerNotFoundError;
const ActionElementNotTextAreaError                     = require('../../lib/errors/test-run').ActionElementNotTextAreaError;
const ActionIncorrectKeysError                          = require('../../lib/errors/test-run').ActionIncorrectKeysError;
const ActionCanNotFindFileToUploadError                 = require('../../lib/errors/test-run').ActionCanNotFindFileToUploadError;
const ActionElementIsNotFileInputError                  = require('../../lib/errors/test-run').ActionElementIsNotFileInputError;
const ActionUnsupportedDeviceTypeError                  = require('../../lib/errors/test-run').ActionUnsupportedDeviceTypeError;
const ActionInvalidScrollTargetError                    = require('../../lib/errors/test-run').ActionInvalidScrollTargetError;
const ClientFunctionExecutionInterruptionError          = require('../../lib/errors/test-run').ClientFunctionExecutionInterruptionError;
const ActionElementNotIframeError                       = require('../../lib/errors/test-run').ActionElementNotIframeError;
const ActionIframeIsNotLoadedError                      = require('../../lib/errors/test-run').ActionIframeIsNotLoadedError;
const CurrentIframeIsNotLoadedError                     = require('../../lib/errors/test-run').CurrentIframeIsNotLoadedError;
const CurrentIframeNotFoundError                        = require('../../lib/errors/test-run').CurrentIframeNotFoundError;
const CurrentIframeIsInvisibleError                     = require('../../lib/errors/test-run').CurrentIframeIsInvisibleError;
const MissingAwaitError                                 = require('../../lib/errors/test-run').MissingAwaitError;
const ExternalAssertionLibraryError                     = require('../../lib/errors/test-run').ExternalAssertionLibraryError;
const DomNodeClientFunctionResultError                  = require('../../lib/errors/test-run').DomNodeClientFunctionResultError;
const InvalidSelectorResultError                        = require('../../lib/errors/test-run').InvalidSelectorResultError;
const NativeDialogNotHandledError                       = require('../../lib/errors/test-run').NativeDialogNotHandledError;
const UncaughtErrorInNativeDialogHandler                = require('../../lib/errors/test-run').UncaughtErrorInNativeDialogHandler;
const SetNativeDialogHandlerCodeWrongTypeError          = require('../../lib/errors/test-run').SetNativeDialogHandlerCodeWrongTypeError;
const CantObtainInfoForElementSpecifiedBySelectorError  = require('../../lib/errors/test-run').CantObtainInfoForElementSpecifiedBySelectorError;
const WindowDimensionsOverflowError                     = require('../../lib/errors/test-run').WindowDimensionsOverflowError;
const InvalidElementScreenshotDimensionsError           = require('../../lib/errors/test-run').InvalidElementScreenshotDimensionsError;
const SetTestSpeedArgumentError                         = require('../../lib/errors/test-run').SetTestSpeedArgumentError;
const RoleSwitchInRoleInitializerError                  = require('../../lib/errors/test-run').RoleSwitchInRoleInitializerError;
const ActionRoleArgumentError                           = require('../../lib/errors/test-run').ActionRoleArgumentError;

const TEST_FILE_STACK_ENTRY_RE = new RegExp('\\s*\\n?\\(' + escapeRe(require.resolve('./data/test-callsite')), 'g');

const untestedErrorTypes = Object.keys(TYPE).map(function (key) {
    return TYPE[key];
});

const userAgentMock = 'Chrome 15.0.874 / Mac OS X 10.8.1';

const testAssertionError = (function () {
    try {
        expect(true).eql(false);
    }
    catch (err) {
        return err;
    }

    return null;
})();

// Output stream and errorDecorator mocks
function createOutStreamMock () {
    return {
        data: '',

        write: function (text) {
            this.data += text;
        }
    };
}

function assertErrorMessage (file, err) {
    const screenshotPath = '/unix/path/with/<tag>';
    const outStreamMock  = createOutStreamMock();
    const plugin         = new ReporterPluginHost({}, outStreamMock);

    const errAdapter = new TestRunErrorFormattableAdapter(err, {
        userAgent:      userAgentMock,
        screenshotPath: screenshotPath,
        callsite:       testCallsite,
        testRunPhase:   TEST_RUN_PHASE.initial
    });

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(errAdapter));

    const expectedMsg = read('./data/expected-test-run-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    const actual = outStreamMock.data.replace(TEST_FILE_STACK_ENTRY_RE, ' (testfile.js');

    expect(actual).eql(expectedMsg);

    // NOTE: check that the list of error types contains an
    // error of this type and remove tested messages from the list
    expect(untestedErrorTypes.indexOf(err.type) !== -1).to.be.ok;
    remove(untestedErrorTypes, err.type);
}

describe('Error formatting', function () {
    describe('Errors', function () {
        it('Should format "actionIntegerOptionError" message', function () {
            assertErrorMessage('action-integer-option-error', new ActionIntegerOptionError('offsetX', '1.01'));
        });

        it('Should format "actionPositiveIntegerOptionError" message', function () {
            assertErrorMessage('action-positive-integer-option-error', new ActionPositiveIntegerOptionError('caretPos', '-1'));
        });

        it('Should format "actionIntegerArgumentError" message', function () {
            assertErrorMessage('action-integer-argument-error', new ActionIntegerArgumentError('dragOffsetX', 'NaN'));
        });

        it('Should format "actionPositiveIntegerArgumentError" message', function () {
            assertErrorMessage('action-positive-integer-argument-error', new ActionPositiveIntegerArgumentError('startPos', '-1'));
        });

        it('Should format "actionBooleanOptionError" message', function () {
            assertErrorMessage('action-boolean-option-error', new ActionBooleanOptionError('modifier.ctrl', 'object'));
        });

        it('Should format the "actionBooleanArgumentError" message', function () {
            assertErrorMessage('action-boolean-argument-error', new ActionBooleanArgumentError('isAsyncExpression', 'object'));
        });

        it('Should format "actionSpeedOptionError" message', function () {
            assertErrorMessage('action-speed-option-error', new ActionSpeedOptionError('speed', 'object'));
        });

        it('Should format "pageLoadError" message', function () {
            assertErrorMessage('page-load-error', new PageLoadError('Failed to find a DNS-record for the resource'));
        });

        it('Should format "uncaughtErrorOnPage" message', function () {
            assertErrorMessage('uncaught-js-error-on-page', new UncaughtErrorOnPage('Custom script error', 'http://example.org'));
        });

        it('Should format "uncaughtErrorInTestCode" message', function () {
            assertErrorMessage('uncaught-js-error-in-test-code', new UncaughtErrorInTestCode(new Error('Custom script error'), testCallsite));
        });

        it('Should format "uncaughtNonErrorObjectInTestCode" message', function () {
            assertErrorMessage('uncaught-non-error-object-in-test-code', new UncaughtNonErrorObjectInTestCode('Hey ya!'));
        });

        it('Should format "uncaughtErrorInAddCustomDOMProperties" message', function () {
            assertErrorMessage('uncaught-error-in-add-custom-dom-properties-code', new UncaughtErrorInCustomDOMPropertyCode(testCallsite, new Error('Custom script error'), 'prop'));
        });

        it('Should format "unhandledPromiseRejectionError" message', function () {
            assertErrorMessage('unhandled-promise-rejection-error', new UnhandledPromiseRejectionError('Hey ya!'));
        });

        it('Should format "uncaughtExceptionError" message', function () {
            assertErrorMessage('uncaught-exception-error', new UncaughtExceptionError('Hey ya!'));
        });

        it('Should format "actionElementNotFoundError" message', function () {
            assertErrorMessage('action-element-not-found-error', new ActionElementNotFoundError());
        });

        it('Should format "actionElementIsInvisibleError" message', function () {
            assertErrorMessage('action-element-is-invisible-error', new ActionElementIsInvisibleError());
        });

        it('Should format "actionSelectorMatchesWrongNodeTypeError" message', function () {
            assertErrorMessage('action-selector-matches-wrong-node-type-error', new ActionSelectorMatchesWrongNodeTypeError('text'));
        });

        it('Should format "actionElementNonEditableError" message', function () {
            assertErrorMessage('action-element-non-editable-error', new ActionElementNonEditableError());
        });

        it('Should format "actionRootContainerNotFoundError" message', function () {
            assertErrorMessage('action-root-container-not-found-error', new ActionRootContainerNotFoundError());
        });

        it('Should format "actionElementNonContentEditableError" message', function () {
            assertErrorMessage('action-element-non-content-editable-error', new ActionElementNonContentEditableError('startSelector'));
        });

        it('Should format "actionElementNotTextAreaError" message', function () {
            assertErrorMessage('action-element-not-text-area-error', new ActionElementNotTextAreaError());
        });

        it('Should format "actionElementNotIframeError" message', function () {
            assertErrorMessage('action-element-not-iframe-error', new ActionElementNotIframeError());
        });

        it('Should format "actionSelectorError" message', function () {
            assertErrorMessage('action-selector-error', new ActionSelectorError('selector', 'Yo!'));
        });

        it('Should format "actionOptionsTypeError" message', function () {
            assertErrorMessage('action-options-type-error', new ActionOptionsTypeError(typeof 1));
        });

        it('Should format "actionAdditionalElementNotFoundError" message', function () {
            assertErrorMessage('action-additional-element-not-found-error', new ActionAdditionalElementNotFoundError('startSelector'));
        });

        it('Should format "actionAdditionalElementIsInvisibleError" message', function () {
            assertErrorMessage('action-additional-element-is-invisible-error', new ActionAdditionalElementIsInvisibleError('startSelector'));
        });

        it('Should format "actionAdditionalSelectorMatchesWrongNodeTypeError" message', function () {
            assertErrorMessage('action-additional-selector-matches-wrong-node-type-error', new ActionAdditionalSelectorMatchesWrongNodeTypeError('startSelector', 'text'));
        });

        it('Should format "actionStringArgumentError" message', function () {
            assertErrorMessage('action-string-argument-error', new ActionStringArgumentError('text', typeof 1));
        });

        it('Should format "actionNullableStringArgumentError" message', function () {
            assertErrorMessage('action-nullable-string-argument-error', new ActionNullableStringArgumentError('text', typeof 1));
        });

        it('Should format "actionIncorrectKeysError" message', function () {
            assertErrorMessage('action-incorrect-keys-error', new ActionIncorrectKeysError('keys'));
        });

        it('Should format "actionNonEmptyStringArrayArgumentError" message', function () {
            assertErrorMessage('action-non-empty-string-array-argument-error', new ActionStringOrStringArrayArgumentError('array', null));
        });

        it('Should format "actionStringArrayElementError" message', function () {
            assertErrorMessage('action-string-array-element-error', new ActionStringArrayElementError('array', 'number', 1));
        });

        it('Should format "actionElementIsNotFileInputError" message', function () {
            assertErrorMessage('action-element-is-not-file-input-error', new ActionElementIsNotFileInputError());
        });

        it('Should format "actionCanNotFindFileToUploadError" message', function () {
            assertErrorMessage('action-can-not-find-file-to-upload-error', new ActionCanNotFindFileToUploadError(['/path/1', '/path/2']));
        });

        it('Should format "actionUnsupportedDeviceTypeError" message', function () {
            assertErrorMessage('action-unsupported-device-type-error', new ActionUnsupportedDeviceTypeError('device', 'iPhone 555'));
        });

        it('Should format "actionInvalidScrollTargetError" message', function () {
            assertErrorMessage('action-invalid-scroll-target-error', new ActionInvalidScrollTargetError(false, true));
        });

        it('Should format "actionIframeIsNotLoadedError" message', function () {
            assertErrorMessage('action-iframe-is-not-loaded-error', new ActionIframeIsNotLoadedError());
        });

        it('Should format "currentIframeIsNotLoadedError" message', function () {
            assertErrorMessage('current-iframe-is-not-loaded-error', new CurrentIframeIsNotLoadedError());
        });

        it('Should format "currentIframeNotFoundError" message', function () {
            assertErrorMessage('current-iframe-not-found-error', new CurrentIframeNotFoundError());
        });

        it('Should format "currentIframeIsInvisibleError" message', function () {
            assertErrorMessage('current-iframe-is-invisible-error', new CurrentIframeIsInvisibleError());
        });

        it('Should format "missingAwaitError', function () {
            assertErrorMessage('missing-await-error', new MissingAwaitError(testCallsite));
        });

        it('Should format "externalAssertionLibraryError', function () {
            assertErrorMessage('external-assertion-library-error', new ExternalAssertionLibraryError(testAssertionError, testCallsite));
        });

        it('Should format "uncaughtErrorInClientFunctionCode"', function () {
            assertErrorMessage('uncaught-error-in-client-function-code', new UncaughtErrorInClientFunctionCode('Selector', new Error('Some error.')));
        });

        it('Should format "clientFunctionExecutionInterruptionError"', function () {
            assertErrorMessage('client-function-execution-interruption-error', new ClientFunctionExecutionInterruptionError('eval'));
        });

        it('Should format "domNodeClientFunctionResultError"', function () {
            assertErrorMessage('dom-node-client-function-result-error', new DomNodeClientFunctionResultError('ClientFunction'));
        });

        it('Should format "invalidSelectorResultError"', function () {
            assertErrorMessage('invalid-selector-result-error', new InvalidSelectorResultError());
        });

        it('Should format "nativeDialogNotHandledError"', function () {
            assertErrorMessage('native-dialog-not-handled-error', new NativeDialogNotHandledError('alert', 'http://example.org'));
        });

        it('Should format "uncaughtErrorInNativeDialogHandler"', function () {
            assertErrorMessage('uncaught-error-in-native-dialog-handler', new UncaughtErrorInNativeDialogHandler('alert', 'error message', 'http://example.org'));
        });

        it('Should format "setNativeDialogHandlerCodeWrongTypeError"', function () {
            assertErrorMessage('set-native-dialog-handler-code-wrong-type-error', new SetNativeDialogHandlerCodeWrongTypeError('number'));
        });

        it('Should format "cantObtainInfoForElementSpecifiedBySelectorError"', function () {
            assertErrorMessage('cant-obtain-info-for-element-specified-by-selector-error', new CantObtainInfoForElementSpecifiedBySelectorError(testCallsite));
        });

        it('Should format "windowDimensionsOverflowError"', function () {
            assertErrorMessage('window-dimensions-overflow-error', new WindowDimensionsOverflowError());
        });

        it('Should format "InvalidElementScreenshotDimensionsError"', function () {
            assertErrorMessage('invalid-element-screenshot-dimensions-error', new InvalidElementScreenshotDimensionsError(0, 10));
        });

        it('Should format "setTestSpeedArgumentError"', function () {
            assertErrorMessage('set-test-speed-argument-error', new SetTestSpeedArgumentError('speed', 'string'));
        });

        it('Should format "roleSwitchInRoleInitializerError"', function () {
            assertErrorMessage('role-switch-in-role-initializer-error', new RoleSwitchInRoleInitializerError(testCallsite));
        });

        it('Should format "actionRoleArgumentError"', function () {
            assertErrorMessage('action-role-argument-error', new ActionRoleArgumentError('role', 'number'));
        });

        it('Should format "assertionExecutableArgumentError"', function () {
            assertErrorMessage('assertion-executable-argument-error', new AssertionExecutableArgumentError('actual', '1 + temp', 'Unexpected identifier'));
        });

        it('Should format "assertionUnawaitedPromiseError"', function () {
            assertErrorMessage('assertion-unawaited-promise-error', new AssertionUnawaitedPromiseError(testCallsite));
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
