var expect                                  = require('chai').expect;
var read                                    = require('read-file-relative').readSync;
var remove                                  = require('lodash').pull;
var escapeRe                                = require('lodash').escapeRegExp;
var ReporterPluginHost                      = require('../../lib/reporter/plugin-host');
var TYPE                                    = require('../../lib/errors/test-run/type');
var TestRunErrorFormattableAdapter          = require('../../lib/errors/test-run/formattable-adapter');
var testCallsite                            = require('./data/test-callsite');
var ActionIntegerOptionError                = require('../../lib/errors/test-run').ActionIntegerOptionError;
var ActionPositiveIntegerOptionError        = require('../../lib/errors/test-run').ActionPositiveIntegerOptionError;
var ActionIntegerArgumentError              = require('../../lib/errors/test-run').ActionIntegerArgumentError;
var ActionPositiveIntegerArgumentError      = require('../../lib/errors/test-run').ActionPositiveIntegerArgumentError;
var ActionBooleanOptionError                = require('../../lib/errors/test-run').ActionBooleanOptionError;
var ActionSelectorTypeError                 = require('../../lib/errors/test-run').ActionSelectorTypeError;
var ActionOptionsTypeError                  = require('../../lib/errors/test-run').ActionOptionsTypeError;
var ActionStringArgumentError               = require('../../lib/errors/test-run').ActionStringArgumentError;
var ActionUnsupportedUrlProtocolError       = require('../../lib/errors/test-run').ActionUnsupportedUrlProtocolError;
var ActionStringOrStringArrayArgumentError  = require('../../lib/errors/test-run').ActionStringOrStringArrayArgumentError;
var ActionStringArrayElementError           = require('../../lib/errors/test-run').ActionStringArrayElementError;
var ActionAdditionalSelectorTypeError       = require('../../lib/errors/test-run').ActionAdditionalSelectorTypeError;
var UncaughtErrorOnPage                     = require('../../lib/errors/test-run').UncaughtErrorOnPage;
var UncaughtErrorInTestCode                 = require('../../lib/errors/test-run').UncaughtErrorInTestCode;
var UncaughtErrorInClientExecutedCode       = require('../../lib/errors/test-run').UncaughtErrorInClientExecutedCode;
var UncaughtNonErrorObjectInTestCode        = require('../../lib/errors/test-run').UncaughtNonErrorObjectInTestCode;
var ActionElementNotFoundError              = require('../../lib/errors/test-run').ActionElementNotFoundError;
var ActionElementIsInvisibleError           = require('../../lib/errors/test-run').ActionElementIsInvisibleError;
var ActionAdditionalElementNotFoundError    = require('../../lib/errors/test-run').ActionAdditionalElementNotFoundError;
var ActionAdditionalElementIsInvisibleError = require('../../lib/errors/test-run').ActionAdditionalElementIsInvisibleError;
var ActionElementNonEditableError           = require('../../lib/errors/test-run').ActionElementNonEditableError;
var ActionElementNonContentEditableError    = require('../../lib/errors/test-run').ActionElementNonContentEditableError;
var ActionRootContainerNotFoundError        = require('../../lib/errors/test-run').ActionRootContainerNotFoundError;
var ActionElementNotTextAreaError           = require('../../lib/errors/test-run').ActionElementNotTextAreaError;
var ActionIncorrectKeysError                = require('../../lib/errors/test-run').ActionIncorrectKeysError;
var ActionCanNotFindFileToUploadError       = require('../../lib/errors/test-run').ActionCanNotFindFileToUploadError;
var ActionElementIsNotFileInputError        = require('../../lib/errors/test-run').ActionElementIsNotFileInputError;
var ClientCodeExecutionInterruptionError    = require('../../lib/errors/test-run').ClientCodeExecutionInterruptionError;
var MissingAwaitError                       = require('../../lib/errors/test-run').MissingAwaitError;
var ExternalAssertionLibraryError           = require('../../lib/errors/test-run').ExternalAssertionLibraryError;

var TEST_FILE_STACK_ENTRY_RE = new RegExp('\\s*\\n?\\(' + escapeRe(require.resolve('./data/test-callsite')), 'g');

var untestedErrorTypes = Object.keys(TYPE).map(function (key) {
    return TYPE[key];
});

var userAgentMock = 'Chrome 15.0.874 / Mac OS X 10.8.1';

var reporterPluginMock = {
    createErrorDecorator: function () {
        var decorator = ReporterPluginHost.prototype.createErrorDecorator.call(this);

        decorator ['span category'] = function (str) {
            return 'CATEGORY=' + str + '\n';
        };

        return decorator;
    }
};

var testAssertionError = (function () {
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
    var screenshotPath = '/unix/path/with/<tag>';
    var outStreamMock  = createOutStreamMock();
    var plugin         = new ReporterPluginHost(reporterPluginMock, outStreamMock);

    var errAdapter = new TestRunErrorFormattableAdapter(err, {
        userAgent:      userAgentMock,
        screenshotPath: screenshotPath,
        callsite:       testCallsite
    });

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(errAdapter));

    var expectedMsg = read('./data/expected-test-run-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    var actual = outStreamMock.data.replace(TEST_FILE_STACK_ENTRY_RE, ' (testfile.js');

    expect(actual).eql(expectedMsg);

    //NOTE: remove tested messages from list
    remove(untestedErrorTypes, err.type);
}

describe('Error formatting', function () {
    describe('Errors', function () {
        it('Should format "actionIntegerOptionError" message', function () {
            assertErrorMessage('action-integer-option-error', new ActionIntegerOptionError('offsetX', 'NaN'));
        });

        it('Should format "ActionPositiveIntegerOptionError" message', function () {
            assertErrorMessage('action-positive-integer-option-error', new ActionPositiveIntegerOptionError('caretPos', '-1'));
        });

        it('Should format "actionIntegerArgumentError" message', function () {
            assertErrorMessage('action-integer-argument-error', new ActionIntegerArgumentError('dragOffsetX', 'NaN'));
        });

        it('Should format "ActionPositiveIntegerArgumentError" message', function () {
            assertErrorMessage('action-positive-integer-argument-error', new ActionPositiveIntegerArgumentError('startPos', '-1'));
        });

        it('Should format "actionBooleanOptionError" message', function () {
            assertErrorMessage('action-boolean-option-error', new ActionBooleanOptionError('modifier.ctrl', 'object'));
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

        it('Should format "actionElementNotFoundError" message', function () {
            assertErrorMessage('action-element-not-found-error', new ActionElementNotFoundError());
        });

        it('Should format "actionElementIsInvisibleError" message', function () {
            assertErrorMessage('action-element-is-invisible-error', new ActionElementIsInvisibleError());
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

        it('Should format "actionSelectorTypeError" message', function () {
            assertErrorMessage('action-selector-type-error', new ActionSelectorTypeError(typeof 1));
        });

        it('Should format "actionOptionsTypeError" message', function () {
            assertErrorMessage('action-options-type-error', new ActionOptionsTypeError(typeof 1));
        });

        it('Should format "actionAdditionalSelectorTypeError" message', function () {
            assertErrorMessage('action-additional-selector-type-error', new ActionAdditionalSelectorTypeError('startSelector', typeof 1));
        });

        it('Should format "actionAdditionalElementNotFoundError" message', function () {
            assertErrorMessage('action-additional-element-not-found-error', new ActionAdditionalElementNotFoundError('startSelector'));
        });

        it('Should format "actionAdditionalElementIsInvisibleError" message', function () {
            assertErrorMessage('action-additional-element-is-invisible-error', new ActionAdditionalElementIsInvisibleError('startSelector'));
        });

        it('Should format "actionStringArgumentError" message', function () {
            assertErrorMessage('action-string-argument-error', new ActionStringArgumentError('text', typeof 1));
        });

        it('Should format "actionUnsupportedUrlProtocolError" message', function () {
            assertErrorMessage('action-unsupported-url-protocol-error', new ActionUnsupportedUrlProtocolError('url', 'mail'));
        });

        it('Should format "actionIncorrectKeysError" message', function () {
            assertErrorMessage('action-incorrect-keys-error', new ActionIncorrectKeysError('keys'));
        });

        it('Should format "actionNonEmptyStringArrayArgumentError" message', function () {
            assertErrorMessage('action-string-or-string-array-argument-error', new ActionStringOrStringArrayArgumentError('array', null));
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

        it('Should format "missingAwaitError', function () {
            assertErrorMessage('missing-await-error', new MissingAwaitError(testCallsite));
        });

        it('Should format "externalAssertionLibraryError', function () {
            assertErrorMessage('external-assertion-library-error', new ExternalAssertionLibraryError(testAssertionError, testCallsite));
        });

        it('Should format "uncaughtErrorInClientExecutedCode"', function () {
            assertErrorMessage('uncaught-error-in-client-executed-code', new UncaughtErrorInClientExecutedCode(new Error('Some error.')));
        });

        it('Should format "clientCodeExecutionInterruptionError"', function () {
            assertErrorMessage('client-code-execution-interruption-error', new ClientCodeExecutionInterruptionError());
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
