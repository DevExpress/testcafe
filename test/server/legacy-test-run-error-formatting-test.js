var expect                               = require('chai').expect;
var read                                 = require('read-file-relative').readSync;
var remove                               = require('lodash').pull;
var ReporterPluginHost                   = require('../../lib/reporter/plugin-host');
var TYPE                                 = require('../../lib/legacy/test-run-error/type');
var LegacyTestRunErrorFormattableAdapter = require('../../lib/legacy/test-run-error/formattable-adapter');


var untestedErrorTypes = Object.keys(TYPE).map(function (key) {
    return TYPE[key];
});

var userAgentMock = 'Chrome 15.0.874 / Mac OS X 10.8.1';

var reporterPluginMock = {
    noColors: true,

    createErrorDecorator: function () {
        var plugin = this;

        return {
            'span category': function (str) {
                return 'CATEGORY=' + str + '\n';
            },

            'span step-name': function (str) {
                return '"' + str + '"';
            },

            'span user-agent': function (str) {
                return str;
            },

            'div screenshot-info': function (str) {
                return str;
            },

            'a screenshot-path': function (str) {
                return str;
            },

            'code': function (str) {
                return str;
            },

            'code step-source': function (str) {
                return plugin.indentString(str, 4);
            },

            'span code-line': function (str) {
                return str + '\n';
            },

            'span last-code-line': function (str) {
                return str;
            },

            'code api': function (str) {
                return str;
            },

            'strong': function (str) {
                return str;
            },

            'a': function (str) {
                return '"' + str + '"';
            }
        };
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

function assertErrorMessage (file, clientErr) {
    var outStreamMock = createOutStreamMock();
    var plugin        = new ReporterPluginHost(reporterPluginMock, outStreamMock);

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(new LegacyTestRunErrorFormattableAdapter(clientErr, userAgentMock)));

    var expectedMsg = read('./data/expected-legacy-test-run-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    expect(outStreamMock.data).eql(expectedMsg);

    //NOTE: remove tested messages from list
    remove(untestedErrorTypes, clientErr.type);
}

describe('Error formatter', function () {
    describe('Assertions', function () {
        it('Should format "eq" assertion message', function () {
            var err = {
                stepName:          'Step with <tag>',
                expected:          '"<another-tag>"',
                actual:            '"<some-tag>"',
                relatedSourceCode: 'eq({"<tag>": "<some-tag>"}, {"<tag>": "<another-tag>"})',
                key:               '<tag>',
                isObjects:         true,
                type:              TYPE.eqAssertion,
                screenshotPath:    '/unix/path/with/<tag>',
                message:           '<tagged> message',
                diffType:          {
                    isStrings: true,
                    diffIndex: 1
                }
            };

            assertErrorMessage('eq-assertion', err);
        });

        it('Should format "notEq" assertion message', function () {
            var err = {
                stepName:          'Step with <tag>',
                relatedSourceCode: 'notEq("<test>", "<test>")',
                actual:            '"<test>"',
                expected:          '"<test>"',
                type:              TYPE.notEqAssertion,
                screenshotPath:    '/unix/path/with/<tag>',
                message:           '<tagged> message'
            };

            assertErrorMessage('not-eq-assertion', err);
        });

        it('Should format "ok" assertion message', function () {
            var err = {
                stepName:          'Step with <tag>',
                relatedSourceCode: 'ok("<test>" === "<best>")',
                actual:            'false',
                type:              TYPE.okAssertion,
                screenshotPath:    '/unix/path/with/<tag>',
                message:           '<tagged> message'
            };

            assertErrorMessage('ok-assertion', err);
        });

        it('Should format "notOk" assertion message', function () {
            var err = {
                stepName:          'Step with <tag>',
                relatedSourceCode: 'notOk("<test>")',
                actual:            '"<test>"',
                type:              TYPE.notOkAssertion,
                screenshotPath:    '/unix/path/with/<tag>',
                message:           '<tagged> message'
            };

            assertErrorMessage('not-ok-assertion', err);
        });
    });

    describe('Errors', function () {
        it('Should format "iframeLoadingTimeout" error message', function () {
            var err = {
                type:           TYPE.iframeLoadingTimeout,
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('iframe-loading-timeout', err);
        });

        it('Should format "inIFrameTargetLoadingTimeout" error message', function () {
            var err = {
                type:           TYPE.inIFrameTargetLoadingTimeout,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('in-iframe-target-loading-timeout', err);
        });

        it('Should format "uncaughtJSError" error message', function () {
            var err = {
                type:           TYPE.uncaughtJSError,
                scriptErr:      'test-error-with-<tag>',
                pageDestUrl:    'http://page',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('uncaught-js-error', err);
        });

        it('Should format "uncaughtJSErrorInTestCodeStep" error message', function () {
            var err = {
                type:           TYPE.uncaughtJSErrorInTestCodeStep,
                stepName:       'Step with <tag>',
                scriptErr:      'error with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('uncaught-js-error-in-test-code-step', err);
        });

        it('Should format "storeDomNodeOrJqueryObject" error message', function () {
            var err = {
                type:           TYPE.storeDomNodeOrJqueryObject,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('store-dom-node-or-jquery-object', err);
        });

        it('Should format "emptyFirstArgument" error message', function () {
            var err = {
                type:              TYPE.emptyFirstArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                action:            'testAction',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('empty-first-argument', err);
        });

        it('Should format "invisibleActionElement" error message', function () {
            var err = {
                type:              TYPE.invisibleActionElement,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                action:            'test-action',
                element:           '<element>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('invisible-action-element', err);
        });

        it('Should format "incorrectDraggingSecondArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectDraggingSecondArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-dragging-second-argument', err);
        });

        it('Should format "incorrectPressActionArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectPressActionArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-press-action-argument', err);
        });

        it('Should format "emptyTypeActionArgument" error message', function () {
            var err = {
                type:              TYPE.emptyTypeActionArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('empty-type-action-argument', err);
        });

        it('Should format "unexpectedDialog" error message', function () {
            var err = {
                type:           TYPE.unexpectedDialog,
                stepName:       'Step with <tag>',
                dialog:         'test-dialog',
                message:        'message with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('unexpected-dialog', err);
        });

        it('Should format "expectedDialogDoesntAppear" error message', function () {
            var err = {
                type:           TYPE.expectedDialogDoesntAppear,
                stepName:       'Step with <tag>',
                dialog:         'test-dialog',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('expected-dialog-doesnt-appear', err);
        });

        it('Should format "incorrectSelectActionArguments" error message', function () {
            var err = {
                type:              TYPE.incorrectSelectActionArguments,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-select-action-arguments', err);
        });

        it('Should format "incorrectWaitActionMillisecondsArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitActionMillisecondsArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-wait-action-milliseconds-arguments', err);
        });

        it('Should format "incorrectWaitForActionEventArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitForActionEventArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-wait-for-action-event-argument', err);
        });

        it('Should format "incorrectWaitForActionTimeoutArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitForActionTimeoutArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-wait-for-action-timeout-argument', err);
        });

        it('Should format "waitForActionTimeoutExceeded" error message', function () {
            var err = {
                type:              TYPE.waitForActionTimeoutExceeded,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'act.waitFor(function(cb) {\n    $("<iframe>");\n    cb();\n}, 1000);',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('wait-for-action-timeout-exceeded', err);
        });

        it('Should format "emptyIFrameArgument" error message', function () {
            var err = {
                type:           TYPE.emptyIFrameArgument,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('empty-iframe-argument', err);
        });

        it('Should format "iframeArgumentIsNotIFrame" error message', function () {
            var err = {
                type:           TYPE.iframeArgumentIsNotIFrame,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('iframe-argument-is-not-iframe', err);
        });

        it('Should format "multipleIFrameArgument" error message', function () {
            var err = {
                type:           TYPE.multipleIFrameArgument,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('multiple-iframe-argument', err);
        });

        it('Should format "incorrectIFrameArgument" error message', function () {
            var err = {
                type:           TYPE.incorrectIFrameArgument,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-iframe-argument', err);
        });

        it('Should format "uploadCanNotFindFileToUpload" error message', function () {
            var err = {
                type:              TYPE.uploadCanNotFindFileToUpload,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                filePaths:         ['/unix/path/with/<tag>', 'path2'],
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('upload-can-not-find-file-to-upload', err);
        });

        it('Should format "uploadElementIsNotFileInput" error message', function () {
            var err = {
                type:              TYPE.uploadElementIsNotFileInput,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('upload-element-is-not-file-input', err);
        });

        it('Should format "uploadInvalidFilePathArgument" error message', function () {
            var err = {
                type:              TYPE.uploadInvalidFilePathArgument,
                stepName:          'Step with <tag>',
                relatedSourceCode: 'code and <tag>',
                screenshotPath:    '/unix/path/with/<tag>'
            };

            assertErrorMessage('upload-invalid-file-path-argument', err);
        });

        it('Should format "pageNotLoaded" error message', function () {
            var err = {
                type:    TYPE.pageNotLoaded,
                message: 'Failed to find a DNS-record for the resource at <a href="example.org">example.org</a>.'
            };

            assertErrorMessage('page-not-loaded', err);
        });

        it('Should format "incorrectGlobalWaitForActionEventArgument" error message', function () {
            var err = {
                type:           TYPE.incorrectGlobalWaitForActionEventArgument,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-global-wait-for-action-event-argument', err);
        });

        it('Should format "incorrectGlobalWaitForActionTimeoutArgument" error message', function () {
            var err = {
                type:           TYPE.incorrectGlobalWaitForActionTimeoutArgument,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('incorrect-global-wait-for-action-timeout-argument', err);
        });

        it('Should format "globalWaitForActionTimeoutExceeded" error message', function () {
            var err = {
                type:           TYPE.globalWaitForActionTimeoutExceeded,
                stepName:       'Step with <tag>',
                screenshotPath: '/unix/path/with/<tag>'
            };

            assertErrorMessage('global-wait-for-action-timeout-exceed', err);
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
