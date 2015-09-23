var expect             = require('chai').expect;
var EventEmitter       = require('events').EventEmitter;
var format             = require('../../lib/reporters/errors/format');
var plainTextDecorator = require('../../lib/reporters/errors/decorators/plain-text');
var readFile           = require('../../lib/utils/read-file-relative');
var reporters          = require('../../lib/reporters');
var TYPE               = require('../../lib/reporters/errors/type');
var util               = require('util');

var MAX_STRING_LENGTH = 10;

var messages = Object.keys(TYPE);

var testMock = [{
    name:    'fixtureTest',
    fixture: {
        name: 'fixture',
        path: './fixture.js'
    }
}];

// Task mock
var TaskMock = function () {
    EventEmitter.call(this);

    this.tests              = testMock;
    this.browserConnections = browserConnectionMocks;
};

util.inherits(TaskMock, EventEmitter);

var browserConnectionMocks = [
    { userAgent: 'Chrome' }
];

var userAgentMock = browserConnectionMocks[0].userAgent;

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

    var expectedMsg = readFile('./data/expected-test-errors/' + file).replace(/(\r\n)/gm, '\n');

    expect(expectedMsg).eql(outStreamMock.data);

    //NOTE: remove tested messages from list
    var msgPos = messages.indexOf(err.code);

    if (msgPos > -1)
        messages.splice(msgPos, 1);
}

describe('Should build test error messages', function () {
    describe('Assertion messages', function () {
        it('eq', function () {
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
            }
        );

        it('notEq', function () {
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

        it('ok', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'ok(false)',
                actual:            'false',
                code:              TYPE.okAssertion,
                userAgent:         userAgentMock
            };

            assertErrorMessage('ok-assertion', err);
        });

        it('notOk', function () {
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

    describe('Error messages', function () {
        it('xhrRequestTimeout', function () {
            var err = {
                code:      TYPE.xhrRequestTimeout,
                userAgent: userAgentMock
            };

            assertErrorMessage('xhr-request-timeout', err);
        });

        it('iframeLoadingTimeout', function () {
            var err = {
                code:      TYPE.iframeLoadingTimeout,
                userAgent: userAgentMock
            };

            assertErrorMessage('iframe-loading-timeout', err);
        });

        it('inIFrameTargetLoadingTimeout', function () {
            var err = {
                code:      TYPE.inIFrameTargetLoadingTimeout,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('in-iframe-target-loading-timeout', err);
        });

        it('urlUtilProtocolIsNotSupported', function () {
            var err = {
                code:      TYPE.urlUtilProtocolIsNotSupported,
                destUrl:   'http://url',
                userAgent: userAgentMock
            };

            assertErrorMessage('url-util-protocol-is-not-supported', err);
        });

        it('uncaughtJSError', function () {
            var err = {
                code:      TYPE.uncaughtJSError,
                scriptErr: 'test-error',
                pageUrl:   'http://page',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error', err);
        });

        it('uncaughtJSErrorInTestCodeStep', function () {
            var err = {
                code:      TYPE.uncaughtJSErrorInTestCodeStep,
                stepName:  'Step',
                scriptErr: 'error',
                userAgent: userAgentMock
            };

            assertErrorMessage('uncaught-js-error-in-test-code-step', err);
        });

        it('storeDomNodeOrJqueryObject', function () {
            var err = {
                code:      TYPE.storeDomNodeOrJqueryObject,
                stepName:  'Step',
                userAgent: userAgentMock
            };

            assertErrorMessage('store-dom-node-or-jquery-object', err);
        });

        it('emptyFirstArgument', function () {
            var err = {
                code:              TYPE.emptyFirstArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'testAction',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-first-argument', err);
        });

        it('invisibleActionElement', function () {
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

        it('incorrectDraggingSecondArgument', function () {
            var err = {
                code:              TYPE.incorrectDraggingSecondArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'action',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-dragging-second-argument', err);
        });

        it('incorrectPressActionArgument', function () {
            var err = {
                code:              TYPE.incorrectPressActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-press-action-argument', err);
        });

        it('emptyTypeActionArgument', function () {
            var err = {
                code:              TYPE.emptyTypeActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-type-action-argument', err);
        });

        it('unexpectedDialog', function () {
            var err = {
                code:      TYPE.unexpectedDialog,
                stepName:  'Step',
                dialog:    'test-dialog',
                message:   'message',
                userAgent: userAgentMock
            };

            assertErrorMessage('unexpected-dialog', err);
        });

        it('expectedDialogDoesntAppear', function () {
            var err = {
                code:      TYPE.expectedDialogDoesntAppear,
                stepName:  'Step',
                dialog:    'test-dialog',
                userAgent: userAgentMock
            };

            assertErrorMessage('expected-dialog-doesnt-appear', err);
        });

        it('incorrectSelectActionArguments', function () {
            var err = {
                code:              TYPE.incorrectSelectActionArguments,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-select-action-arguments', err);
        });

        it('incorrectWaitActionMillisecondsArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitActionMillisecondsArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-action-milliseconds-arguments', err);
        });

        it('incorrectWaitForActionEventArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionEventArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-event-argument', err);
        });

        it('incorrectWaitForActionTimeoutArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionTimeoutArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-wait-for-action-timeout-argument', err);
        });

        it('waitForActionTimeoutExceeded', function () {
            var err = {
                code:              TYPE.waitForActionTimeoutExceeded,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('wait-for-action-timeout-exceeded', err);
        });

        it('emptyIFrameArgument', function () {
            var err = {
                code:              TYPE.emptyIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('empty-iframe-argument', err);
        });

        it('iframeArgumentIsNotIFrame', function () {
            var err = {
                code:              TYPE.iframeArgumentIsNotIFrame,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('iframe-argument-is-not-iframe', err);
        });

        it('multipleIFrameArgument', function () {
            var err = {
                code:              TYPE.multipleIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('multiple-iframe-argument', err);
        });

        it('incorrectIFrameArgument', function () {
            var err = {
                code:              TYPE.incorrectIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('incorrect-iframe-argument', err);
        });

        it('uploadCanNotFindFileToUpload', function () {
            var err = {
                code:              TYPE.uploadCanNotFindFileToUpload,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePaths:         ['path1', 'path2'],
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-can-not-find-file-to-upload', err);
        });

        it('uploadElementIsNotFileInput', function () {
            var err = {
                code:              TYPE.uploadElementIsNotFileInput,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePath:          'path',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-element-is-not-file-input', err);
        });

        it('uploadInvalidFilePathArgument', function () {
            var err = {
                code:              TYPE.uploadInvalidFilePathArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                userAgent:         userAgentMock
            };

            assertErrorMessage('upload-invalid-file-path-argument', err);
        });
    });

    describe('Should test all messages', function () {
        it('all messages were tested', function () {
            expect(messages).eql([]);
        });
    });
});
