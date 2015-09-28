var TYPE = require('../../lib/reporters/errors/type');

module.exports = [
    [
        {
            stepName:          'Check for arrays equality',
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
        },
        {
            stepName:          'Compare two strings',
            relatedSourceCode: 'notEq("test", "test")',
            actual:            '"test"',
            expected:          '"test"',
            code:              TYPE.notEqAssertion
        },
        {
            stepName:          'Check value',
            relatedSourceCode: 'ok(false)',
            actual:            'false',
            code:              TYPE.okAssertion
        },

        {
            stepName:          'Check value',
            relatedSourceCode: 'notOk("test")',
            actual:            '"test"',
            code:              TYPE.notOkAssertion
        },
        {
            code: TYPE.xhrRequestTimeout
        },
        {
            code: TYPE.iframeLoadingTimeout
        },
        {
            code:     TYPE.inIFrameTargetLoadingTimeout,
            stepName: 'Do action in iframe'
        },
        {
            code:    TYPE.urlUtilProtocolIsNotSupported,
            destUrl: 'ftp://host:8080/'
        },
        {
            code:      TYPE.uncaughtJSError,
            scriptErr: 'Cannot read property \'name\' of null',
            pageUrl:   'http://host:8080/index.aspx'
        }
    ],
    [
        {
            code:      TYPE.uncaughtJSErrorInTestCodeStep,
            stepName:  'Step',
            scriptErr: 'error'
        },
        {
            code:     TYPE.storeDomNodeOrJqueryObject,
            stepName: 'Share Jquery object between steps'
        },
        {
            code:              TYPE.emptyFirstArgument,
            stepName:          'Click Login button',
            relatedSourceCode: 'act.click(null, {offsetX: 0, offsetY: 1000})',
            action:            'act.click'
        },
        {
            code:              TYPE.invisibleActionElement,
            stepName:          'Drag options panel',
            relatedSourceCode: 'act.drag($("button.login"), $("div.dock"), {dragOffsetX: 1, dragOffsetY: 2})',
            action:            'act.drag',
            element:           '&lt;button class=&quot;login&quot;&gt;&lt;/button&gt;'
        },
        {
            code:              TYPE.incorrectDraggingSecondArgument,
            stepName:          'Drag options panel',
            relatedSourceCode: 'act.drag($("button.login"), 1)'
        },
        {
            code:              TYPE.incorrectPressActionArgument,
            stepName:          'Enter the authentication data',
            relatedSourceCode: 'act.press("some text some text some text")'
        },
        {
            code:              TYPE.emptyTypeActionArgument,
            stepName:          'Type username',
            relatedSourceCode: 'act.type($("input"), "username")'
        },
        {
            code:     TYPE.unexpectedDialog,
            stepName: 'Handle alert message',
            dialog:   'unexpectedDialog',
            message:  'message'
        },
        {
            code:     TYPE.expectedDialogDoesntAppear,
            stepName: 'Handle prompt message',
            dialog:   'prompt'
        },
        {
            code:              TYPE.incorrectSelectActionArguments,
            stepName:          'Select the input text',
            relatedSourceCode: 'act.select($("input.username"));'
        },
        {
            code:              TYPE.incorrectWaitActionMillisecondsArgument,
            stepName:          'Wait 1000 milliseconds',
            relatedSourceCode: 'act.wait("1000")'
        },
        {
            code:              TYPE.incorrectWaitForActionEventArgument,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(callback) {\n callback(); \n})'
        },
        {
            code:              TYPE.incorrectWaitForActionTimeoutArgument,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(cb) {\ncb();\n}, "1000")'
        },
        {
            code:              TYPE.waitForActionTimeoutExceeded,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(cb) {\ncb();\n}, 1000);'
        }
    ],
    [
        {
            code:              TYPE.emptyIFrameArgument,
            stepName:          'Click button in IFrame',
            relatedSourceCode: 'inIFrame("#iFrame", function () {\nact.click($("button"))\n})'
        },
        {
            code:              TYPE.iframeArgumentIsNotIFrame,
            stepName:          'Click button in IFrame',
            relatedSourceCode: 'inIFrame("#content", function () {\nact.click($("button"))\n})'
        },
        {
            code:              TYPE.multipleIFrameArgument,
            stepName:          'Type text in IFrame',
            relatedSourceCode: 'inIFrame(".IFrame", function () {\nact.press("123")\n})'
        },
        {
            code:              TYPE.incorrectIFrameArgument,
            stepName:          'Type text in IFrame',
            relatedSourceCode: 'inIFrame(IFrame, function () {\nact.press("123")\n})'
        },
        {
            code:              TYPE.uploadCanNotFindFileToUpload,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload", ["./test-images/picture1", "./test-images/picture2"]);',
            filePaths:         ['./test-images/picture1', './test-images/picture2']
        },
        {
            code:              TYPE.uploadElementIsNotFileInput,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload-btn", ["./test-images/picture1", "./test-images/picture2"]);',
            filePath:          ['./test-images/picture1', './test-images/picture2']
        },
        {
            code:              TYPE.uploadInvalidFilePathArgument,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload", uploadFiles);'
        }
    ]
];
