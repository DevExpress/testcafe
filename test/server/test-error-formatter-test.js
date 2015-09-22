var expect             = require('chai').expect;
var format             = require('../../lib/test-error');
var plainTextDecorator = require('../../lib/test-error/plain-text-decorator');
var readFile           = require('../../lib/utils/read-file-relative');
var TYPE               = require('../../lib/test-error/type');

var MAX_STRING_LENGTH = 10;

var messages = Object.keys(TYPE);

function assertErrorMessage (file, err) {
    var expectedMsg = readFile('./data/expected-test-errors/' + file).replace(/(\r\n)/gm, '\n');

    expect(expectedMsg).eql(format(err, plainTextDecorator, MAX_STRING_LENGTH));

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
                code:              TYPE.notEqAssertion
            };

            assertErrorMessage('not-eq-assertion', err);
        });

        it('ok', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'ok(false)',
                actual:            'false',
                code:              TYPE.okAssertion
            };

            assertErrorMessage('ok-assertion', err);
        });

        it('notOk', function () {
            var err = {
                stepName:          'Step',
                relatedSourceCode: 'notOk("test")',
                actual:            '"test"',
                code:              TYPE.notOkAssertion
            };

            assertErrorMessage('not-ok-assertion', err);
        });
    });

    describe('Error messages', function () {
        it('xhrRequestTimeout', function () {
            var err = {
                code: TYPE.xhrRequestTimeout
            };

            assertErrorMessage('xhr-request-timeout', err);
        });

        it('iframeLoadingTimeout', function () {
            var err = {
                code: TYPE.iframeLoadingTimeout
            };

            assertErrorMessage('iframe-loading-timeout', err);
        });

        it('inIFrameTargetLoadingTimeout', function () {
            var err = {
                code:     TYPE.inIFrameTargetLoadingTimeout,
                stepName: 'Step'
            };

            assertErrorMessage('in-iframe-target-loading-timeout', err);
        });

        it('urlUtilProtocolIsNotSupported', function () {
            var err = {
                code:    TYPE.urlUtilProtocolIsNotSupported,
                destUrl: 'http://url'
            };

            assertErrorMessage('url-util-protocol-is-not-supported', err);
        });

        it('uncaughtJSError', function () {
            var err = {
                code:      TYPE.uncaughtJSError,
                scriptErr: 'test-error',
                pageUrl:   'http://page'
            };

            assertErrorMessage('uncaught-js-error', err);
        });

        it('uncaughtJSErrorInTestCodeStep', function () {
            var err = {
                code:      TYPE.uncaughtJSErrorInTestCodeStep,
                stepName:  'Step',
                scriptErr: 'error'
            };

            assertErrorMessage('uncaught-js-error-in-test-code-step', err);
        });

        it('storeDomNodeOrJqueryObject', function () {
            var err = {
                code:     TYPE.storeDomNodeOrJqueryObject,
                stepName: 'Step'
            };

            assertErrorMessage('store-dom-node-or-jquery-object', err);
        });

        it('emptyFirstArgument', function () {
            var err = {
                code:              TYPE.emptyFirstArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'testAction'
            };

            assertErrorMessage('empty-first-argument', err);
        });

        it('invisibleActionElement', function () {
            var err = {
                code:              TYPE.invisibleActionElement,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'test-action',
                element:           'element'
            };

            assertErrorMessage('invisible-action-element', err);
        });

        it('incorrectDraggingSecondArgument', function () {
            var err = {
                code:              TYPE.incorrectDraggingSecondArgument,
                stepName:          'Step',
                relatedSourceCode: 'code',
                action:            'action'
            };

            assertErrorMessage('incorrect-dragging-second-argument', err);
        });

        it('incorrectPressActionArgument', function () {
            var err = {
                code:              TYPE.incorrectPressActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-press-action-argument', err);
        });

        it('emptyTypeActionArgument', function () {
            var err = {
                code:              TYPE.emptyTypeActionArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('empty-type-action-argument', err);
        });

        it('unexpectedDialog', function () {
            var err = {
                code:     TYPE.unexpectedDialog,
                stepName: 'Step',
                dialog:   'test-dialog',
                message:  'message'
            };

            assertErrorMessage('unexpected-dialog', err);
        });

        it('expectedDialogDoesntAppear', function () {
            var err = {
                code:     TYPE.expectedDialogDoesntAppear,
                stepName: 'Step',
                dialog:   'test-dialog'
            };

            assertErrorMessage('expected-dialog-doesnt-appear', err);
        });

        it('incorrectSelectActionArguments', function () {
            var err = {
                code:              TYPE.incorrectSelectActionArguments,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-select-action-arguments', err);
        });

        it('incorrectWaitActionMillisecondsArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitActionMillisecondsArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-wait-action-milliseconds-arguments', err);
        });

        it('incorrectWaitForActionEventArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionEventArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-wait-for-action-event-argument', err);
        });

        it('incorrectWaitForActionTimeoutArgument', function () {
            var err = {
                code:              TYPE.incorrectWaitForActionTimeoutArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-wait-for-action-timeout-argument', err);
        });

        it('waitForActionTimeoutExceeded', function () {
            var err = {
                code:              TYPE.waitForActionTimeoutExceeded,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('wait-for-action-timeout-exceeded', err);
        });

        it('emptyIFrameArgument', function () {
            var err = {
                code:              TYPE.emptyIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('empty-iframe-argument', err);
        });

        it('iframeArgumentIsNotIFrame', function () {
            var err = {
                code:              TYPE.iframeArgumentIsNotIFrame,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('iframe-argument-is-not-iframe', err);
        });

        it('multipleIFrameArgument', function () {
            var err = {
                code:              TYPE.multipleIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('multiple-iframe-argument', err);
        });

        it('incorrectIFrameArgument', function () {
            var err = {
                code:              TYPE.incorrectIFrameArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
            };

            assertErrorMessage('incorrect-iframe-argument', err);
        });

        it('uploadCanNotFindFileToUpload', function () {
            var err = {
                code:              TYPE.uploadCanNotFindFileToUpload,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePaths:         ['path1', 'path2']
            };

            assertErrorMessage('upload-can-not-find-file-to-upload', err);
        });

        it('uploadElementIsNotFileInput', function () {
            var err = {
                code:              TYPE.uploadElementIsNotFileInput,
                stepName:          'Step',
                relatedSourceCode: 'code',
                filePath:          'path'
            };

            assertErrorMessage('upload-element-is-not-file-input', err);
        });

        it('uploadInvalidFilePathArgument', function () {
            var err = {
                code:              TYPE.uploadInvalidFilePathArgument,
                stepName:          'Step',
                relatedSourceCode: 'code'
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
