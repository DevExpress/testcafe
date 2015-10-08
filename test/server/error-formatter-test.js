var expect             = require('chai').expect;
var read               = require('read-file-relative').readSync;
var util               = require('util');
var EventEmitter       = require('events').EventEmitter;
var plainTextDecorator = require('../../lib/reporters/errors/decorators/plain-text');
var reporters          = require('../../lib/reporters');
var TYPE               = require('../../lib/reporters/errors/type');
var remove             = require('../../lib/utils/array-remove');


var untestedErrorCodes = Object.keys(TYPE);

var testMock = {
    name:    'fixtureTest',
    fixture: {
        name: 'fixture',
        path: './fixture.js'
    }
};

var browserConnectionMock = { userAgent: 'Chrome 15.0.874 / Mac OS X 10.8.1' };

// Task mock
var TaskMock = function () {
    EventEmitter.call(this);

    this.tests              = [testMock];
    this.browserConnections = [browserConnectionMock];
};

util.inherits(TaskMock, EventEmitter);

var userAgentMock = browserConnectionMock.userAgent;

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
    var taskMock      = new TaskMock();
    var outStreamMock = createOutStreamMock();
    var Reporter      = reporters['list'];
    var reporter      = new Reporter(taskMock, outStreamMock, plainTextDecorator);

    reporter._write(reporter._formatError(err));

    var expectedMsg = read('./data/expected-test-errors/' + file)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    expect(outStreamMock.data).eql(expectedMsg);

    //NOTE: remove tested messages from list
    remove(untestedErrorCodes, err.code);
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
                code:              TYPE.eqAssertion,
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
                code:              TYPE.notEqAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('not-eq-assertion', err);
        });

        it('Should format "ok" assertion message', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'ok(false)',
                actual:            'false',
                code:              TYPE.okAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('ok-assertion', err);
        });

        it('Should format "notOk" assertion message', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'notOk("test")',
                actual:            '"test"',
                code:              TYPE.notOkAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('not-ok-assertion', err);
        });
    });

    describe('Errors', function () {
        it('Should format "xhrRequestTimeout" error message', function () {
            var err = {
                code:      TYPE.xhrRequestTimeout,
                userAgent: userAgentMock
            };

            assertErrorMessage('xhr-request-timeout', err);
        });

        it('Should format "iframeLoadingTimeout" error message', function () {
            var err = {
                code:      TYPE.iframeLoadingTimeout,
                userAgent: userAgentMock
            };

            assertErrorMessage('iframe-loading-timeout', err);
        });

        it('Should format "inIFrameTargetLoadingTimeout" error message', function () {
            var err = {
                code:      TYPE.inIFrameTargetLoadingTimeout,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('in-iframe-target-loading-timeout', err);
        });

        it('Should format "urlUtilProtocolIsNotSupported" error message', function () {
            var err = {
                code:      TYPE.urlUtilProtocolIsNotSupported,
                destUrl:   'http://url',
                userAgent: userAgentMock
            };

            assertErrorMessage('url-util-protocol-is-not-supported', err);
        });

        it('Should format "uncaughtJSError" error message', function () {
            var err = {
                code:      TYPE.uncaughtJSError,
                scriptErr: 'test-error',
                pageUrl:   'http://page',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error', err);
        });

        it('Should format "uncaughtJSErrorInTestCodeStep" error message', function () {
            var err = {
                code:      TYPE.uncaughtJSErrorInTestCodeStep,
                stepName:  'Step',
                scriptErr: 'error',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error-in-test-code-step', err);
        });

        it('Should format "storeDomNodeOrJqueryObject" error message', function () {
            var err = {
                code:      TYPE.storeDomNodeOrJqueryObject,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('store-dom-node-or-jquery-object', err);
        });

        it('Should format "emptyFirstArgument" error message', function () {
            var err = {
                code:              TYPE.emptyFirstArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'testAction',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-first-argument', err);
        });

        it('Should format "invisibleActionElement" error message', function () {
            var err = {
                code:              TYPE.invisibleActionElement,
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
                code:              TYPE.incorrectDraggingSecondArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-dragging-second-argument', err);
        });

        it('Should format "incorrectPressActionArgument" error message', function () {
            var err = {
                code:              TYPE.incorrectPressActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-press-action-argument', err);
        });

        it('Should format "emptyTypeActionArgument" error message', function () {
            var err = {
                code:              TYPE.emptyTypeActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-type-action-argument', err);
        });

        it('Should format "unexpectedDialog" error message', function () {
            var err = {
                code:      TYPE.unexpectedDialog,
                stepName:  'Step',
                dialog:    'test-dialog',
                message:   'message',
                userAgent: userAgentMock
            };

            assertErrorMessage('unexpected-dialog', err);
        });

        it('Should format "expectedDialogDoesntAppear" error message', function () {
            var err = {
                code:      TYPE.expectedDialogDoesntAppear,
                stepName:  'Step',
                dialog:    'test-dialog',
                userAgent: userAgentMock
            };

            assertErrorMessage('expected-dialog-doesnt-appear', err);
        });

        it('Should format "incorrectSelectActionArguments" error message', function () {
            var err = {
                code:              TYPE.incorrectSelectActionArguments,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-select-action-arguments', err);
        });

        it('Should format "incorrectWaitActionMillisecondsArgument" error message', function () {
            var err = {
                code:              TYPE.incorrectWaitActionMillisecondsArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-action-milliseconds-arguments', err);
        });

        it('Should format "incorrectWaitForActionEventArgument" error message', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionEventArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-event-argument', err);
        });

        it('Should format "incorrectWaitForActionTimeoutArgument" error message', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionTimeoutArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-timeout-argument', err);
        });

        it('Should format "waitForActionTimeoutExceeded" error message', function () {
            var err = {
                code:              TYPE.waitForActionTimeoutExceeded,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('wait-for-action-timeout-exceeded', err);
        });

        it('Should format "emptyIFrameArgument" error message', function () {
            var err = {
                code:              TYPE.emptyIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-iframe-argument', err);
        });

        it('Should format "iframeArgumentIsNotIFrame" error message', function () {
            var err = {
                code:              TYPE.iframeArgumentIsNotIFrame,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('iframe-argument-is-not-iframe', err);
        });

        it('Should format "multipleIFrameArgument" error message', function () {
            var err = {
                code:              TYPE.multipleIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('multiple-iframe-argument', err);
        });

        it('Should format "incorrectIFrameArgument" error message', function () {
            var err = {
                code:              TYPE.incorrectIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-iframe-argument', err);
        });

        it('Should format "uploadCanNotFindFileToUpload" error message', function () {
            var err = {
                code:              TYPE.uploadCanNotFindFileToUpload,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePaths:         ['path1', 'path2'],
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-can-not-find-file-to-upload', err);
        });

        it('Should format "uploadElementIsNotFileInput" error message', function () {
            var err = {
                code:              TYPE.uploadElementIsNotFileInput,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePath:          'path',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-element-is-not-file-input', err);
        });

        it('Should format "uploadInvalidFilePathArgument" error message', function () {
            var err = {
                code:              TYPE.uploadInvalidFilePathArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-invalid-file-path-argument', err);
        });
    });

    describe('Test coverage', function () {
        it('Should test messages for all error codes', function () {
            expect(untestedErrorCodes).to.be.empty;
        });
    });
});
