var expect                          = require('chai').expect;
var read                            = require('read-file-relative').readSync;
var remove                          = require('lodash').pull;
var escapeRe                        = require('lodash').escapeRegExp;
var ReporterPluginHost              = require('../../lib/reporter/plugin-host');
var TYPE                            = require('../../lib/errors/test-run/type');
var TestRunErrorFormattableAdapter  = require('../../lib/errors/test-run/formattable-adapter');
var testCallsite                    = require('./data/test-callsite');
var ActionNumberOptionError         = require('../../lib/errors/test-run').ActionNumberOptionError;
var ActionPositiveNumberOptionError = require('../../lib/errors/test-run').ActionPositiveNumberOptionError;
var ActionBooleanOptionError        = require('../../lib/errors/test-run').ActionBooleanOptionError;


var TEST_FILE_RE = new RegExp('\\s*\\n?\\(' + escapeRe(require.resolve('./data/test-callsite')), 'g');

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
    var errAdapter     = new TestRunErrorFormattableAdapter(err, userAgentMock, screenshotPath, testCallsite);

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(errAdapter));

    var expectedMsg = read('./data/expected-test-run-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    var actual = outStreamMock.data.replace(TEST_FILE_RE, ' (testfile.js');

    expect(actual).eql(expectedMsg);

    //NOTE: remove tested messages from list
    remove(untestedErrorTypes, err.type);
}

describe('Error formatting', function () {
    describe('Errors', function () {
        it('Should format "actionNumberOptionError" message', function () {
            assertErrorMessage('action-number-option-error', new ActionNumberOptionError('offsetX', 'NaN'));
        });

        it('Should format "actionPositiveNumberOptionError" message', function () {
            assertErrorMessage('action-positive-number-option-error', new ActionPositiveNumberOptionError('caretPos', '-1'));
        });

        it('Should format "actionBooleanOptionError" message', function () {
            assertErrorMessage('action-boolean-option-error', new ActionBooleanOptionError('modifier.ctrl', 'object'));
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
