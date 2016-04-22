var expect                           = require('chai').expect;
var read                             = require('read-file-relative').readSync;
var remove                           = require('lodash').pull;
var escapeRe                         = require('lodash').escapeRegExp;
var ReporterPluginHost               = require('../../lib/reporter/plugin-host');
var TYPE                             = require('../../lib/errors/test-run/type');
var TestRunErrorFormattableAdapter   = require('../../lib/errors/test-run/formattable-adapter');
var testCallsite                     = require('./data/test-callsite');
var ActionIntegerOptionError         = require('../../lib/errors/test-run').ActionIntegerOptionError;
var ActionPositiveIntegerOptionError = require('../../lib/errors/test-run').ActionPositiveIntegerOptionError;
var ActionBooleanOptionError         = require('../../lib/errors/test-run').ActionBooleanOptionError;
var ActionSelectorTypeError          = require('../../lib/errors/test-run').ActionSelectorTypeError;
var ActionOptionsTypeError           = require('../../lib/errors/test-run').ActionOptionsTypeError;
var DragDestinationSelectorTypeError = require('../../lib/errors/test-run').DragDestinationSelectorTypeError;
var UncaughtErrorOnPage              = require('../../lib/errors/test-run').UncaughtErrorOnPage;
var UncaughtErrorInTestCode          = require('../../lib/errors/test-run').UncaughtErrorInTestCode;
var UncaughtNonErrorObjectInTestCode = require('../../lib/errors/test-run').UncaughtNonErrorObjectInTestCode;
var ActionElementNotFoundError       = require('../../lib/errors/test-run').ActionElementNotFoundError;
var ActionElementIsInvisibleError    = require('../../lib/errors/test-run').ActionElementIsInvisibleError;
var DragDestinationNotFoundError     = require('../../lib/errors/test-run').DragDestinationNotFoundError;
var DragDestinationIsInvisibleError  = require('../../lib/errors/test-run').DragDestinationIsInvisibleError;
var MissingAwaitError                = require('../../lib/errors/test-run').MissingAwaitError;
var ExternalAssertionLibraryError    = require('../../lib/errors/test-run').ExternalAssertionLibraryError;

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

        it('Should format "actionPositiveIntegerNumberError" message', function () {
            assertErrorMessage('action-positive-integer-option-error', new ActionPositiveIntegerOptionError('caretPos', '-1'));
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

        it('Should format "actionSelectorTypeError" message', function () {
            assertErrorMessage('action-selector-type-error', new ActionSelectorTypeError(typeof 1));
        });

        it('Should format "actionOptionsTypeError" message', function () {
            assertErrorMessage('action-options-type-error', new ActionOptionsTypeError(typeof 1));
        });

        it('Should format "dragDestinationSelectorTypeError" message', function () {
            assertErrorMessage('drag-destination-selector-type-error', new DragDestinationSelectorTypeError(typeof 1));
        });

        it('Should format "dragDestinationNotFoundError" message', function () {
            assertErrorMessage('drag-destination-not-found-error', new DragDestinationNotFoundError());
        });

        it('Should format "dragDestinationIsInvisibleError" message', function () {
            assertErrorMessage('drag-destination-is-invisible-error', new DragDestinationIsInvisibleError());
        });

        it('Should format "missingAwaitError', function () {
            assertErrorMessage('missing-await-error', new MissingAwaitError(testCallsite));
        });

        it('Should format "externalAssertionLibraryError', function () {
            assertErrorMessage('external-assertion-library-error', new ExternalAssertionLibraryError(testAssertionError, testCallsite));
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
