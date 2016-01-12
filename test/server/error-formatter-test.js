var expect             = require('chai').expect;
var read               = require('read-file-relative').readSync;
var ReporterPluginHost = require('../../lib/reporter/plugin-host');
var TYPE               = require('../../lib/reporter/errors/type');
var remove             = require('../../lib/utils/array-remove');


var untestedErrorTypes = Object.keys(TYPE);
var userAgentMock      = 'Chrome 15.0.874 / Mac OS X 10.8.1';

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

function assertErrorMessage (file, err) {
    var outStreamMock = createOutStreamMock();
    var plugin        = new ReporterPluginHost(reporterPluginMock, outStreamMock);

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(err));

    var expectedMsg = read('./data/expected-test-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    expect(outStreamMock.data).eql(expectedMsg);

    //NOTE: remove tested messages from list
    remove(untestedErrorTypes, err.type);
}

describe('Error formatter', function () {
    describe('Assertions', function () {
        it('Should format "eq" assertion message', function () {
            var err = {
                stepName:          'Step',
                expected:          '"12345678901"',
                actual:            '"00000000000"',
                relatedSourceCode: 'eq(["12345678901"], ["00000000000"])',
                key:               0,
                isArrays:          true,
                type:              TYPE.eqAssertion,
                userAgent:         userAgentMock,

                diffType: {
                    isStrings: true,
                    diffIndex: 0
                }
            };

            assertErrorMessage('eq-assertion', err);
        });

        it('Should format "notEq" assertion message', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'notEq("test", "test")',
                actual:            '"test"',
                expected:          '"test"',
                type:              TYPE.notEqAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('not-eq-assertion', err);
        });

        it('Should format "ok" assertion message', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'ok(false)',
                actual:            'false',
                type:              TYPE.okAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('ok-assertion', err);
        });

        it('Should format "notOk" assertion message', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'notOk("test")',
                actual:            '"test"',
                type:              TYPE.notOkAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('not-ok-assertion', err);
        });
    });

    describe('Errors', function () {
        it('Should format "iframeLoadingTimeout" error message', function () {
            var err = {
                type:      TYPE.iframeLoadingTimeout,
                userAgent: userAgentMock
            };

            assertErrorMessage('iframe-loading-timeout', err);
        });

        it('Should format "inIFrameTargetLoadingTimeout" error message', function () {
            var err = {
                type:      TYPE.inIFrameTargetLoadingTimeout,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('in-iframe-target-loading-timeout', err);
        });

        it('Should format "uncaughtJSError" error message', function () {
            var err = {
                type:      TYPE.uncaughtJSError,
                scriptErr: 'test-error',
                pageUrl:   'http://page',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error', err);
        });

        it('Should format "uncaughtJSErrorInTestCodeStep" error message', function () {
            var err = {
                type:      TYPE.uncaughtJSErrorInTestCodeStep,
                stepName:  'Step',
                scriptErr: 'error',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error-in-test-code-step', err);
        });

        it('Should format "storeDomNodeOrJqueryObject" error message', function () {
            var err = {
                type:      TYPE.storeDomNodeOrJqueryObject,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('store-dom-node-or-jquery-object', err);
        });

        it('Should format "emptyFirstArgument" error message', function () {
            var err = {
                type:              TYPE.emptyFirstArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'testAction',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-first-argument', err);
        });

        it('Should format "invisibleActionElement" error message', function () {
            var err = {
                type:              TYPE.invisibleActionElement,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'test-action',
                element:           'element',
                userAgent:         userAgentMock
            };

            assertErrorMessage('invisible-action-element', err);
        });

        it('Should format "incorrectDraggingSecondArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectDraggingSecondArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-dragging-second-argument', err);
        });

        it('Should format "incorrectPressActionArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectPressActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-press-action-argument', err);
        });

        it('Should format "emptyTypeActionArgument" error message', function () {
            var err = {
                type:              TYPE.emptyTypeActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-type-action-argument', err);
        });

        it('Should format "unexpectedDialog" error message', function () {
            var err = {
                type:      TYPE.unexpectedDialog,
                stepName:  'Step',
                dialog:    'test-dialog',
                message:   'message',
                userAgent: userAgentMock
            };

            assertErrorMessage('unexpected-dialog', err);
        });

        it('Should format "expectedDialogDoesntAppear" error message', function () {
            var err = {
                type:      TYPE.expectedDialogDoesntAppear,
                stepName:  'Step',
                dialog:    'test-dialog',
                userAgent: userAgentMock
            };

            assertErrorMessage('expected-dialog-doesnt-appear', err);
        });

        it('Should format "incorrectSelectActionArguments" error message', function () {
            var err = {
                type:              TYPE.incorrectSelectActionArguments,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-select-action-arguments', err);
        });

        it('Should format "incorrectWaitActionMillisecondsArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitActionMillisecondsArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-action-milliseconds-arguments', err);
        });

        it('Should format "incorrectWaitForActionEventArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitForActionEventArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-event-argument', err);
        });

        it('Should format "incorrectWaitForActionTimeoutArgument" error message', function () {
            var err = {
                type:              TYPE.incorrectWaitForActionTimeoutArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-timeout-argument', err);
        });

        it('Should format "waitForActionTimeoutExceeded" error message', function () {
            var err = {
                type:              TYPE.waitForActionTimeoutExceeded,
                stepName:          'Step',
                relatedSourceCode: 'act.waitFor(function(cb) {\n    cb();\n}, 1000);',
                userAgent:         userAgentMock
            };

            assertErrorMessage('wait-for-action-timeout-exceeded', err);
        });

        it('Should format "emptyIFrameArgument" error message', function () {
            var err = {
                type:      TYPE.emptyIFrameArgument,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('empty-iframe-argument', err);
        });

        it('Should format "iframeArgumentIsNotIFrame" error message', function () {
            var err = {
                type:      TYPE.iframeArgumentIsNotIFrame,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('iframe-argument-is-not-iframe', err);
        });

        it('Should format "multipleIFrameArgument" error message', function () {
            var err = {
                type:      TYPE.multipleIFrameArgument,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('multiple-iframe-argument', err);
        });

        it('Should format "incorrectIFrameArgument" error message', function () {
            var err = {
                type:      TYPE.incorrectIFrameArgument,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('incorrect-iframe-argument', err);
        });

        it('Should format "uploadCanNotFindFileToUpload" error message', function () {
            var err = {
                type:              TYPE.uploadCanNotFindFileToUpload,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePaths:         ['path1', 'path2'],
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-can-not-find-file-to-upload', err);
        });

        it('Should format "uploadElementIsNotFileInput" error message', function () {
            var err = {
                type:              TYPE.uploadElementIsNotFileInput,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePath:          'path',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-element-is-not-file-input', err);
        });

        it('Should format "uploadInvalidFilePathArgument" error message', function () {
            var err = {
                type:              TYPE.uploadInvalidFilePathArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-invalid-file-path-argument', err);
        });

        it('Should format "pageNotLoaded" error message', function () {
            var err = {
                type:      TYPE.pageNotLoaded,
                message:   'Failed to find a DNS-record for the resource at <a href="example.org">example.org</a>.',
                userAgent: userAgentMock
            };

            assertErrorMessage('page-not-loaded', err);
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorTypes).to.be.empty;
        });
    });
});
