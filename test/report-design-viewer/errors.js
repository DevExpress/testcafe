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
            type:              TYPE.eqAssertion,

            diffType: {
                isStrings: true,
                diffIndex: 0
            },

            screenshotPath: '/screenshots/1445437598847/Chrome_46.0.2490_Windows_7_0.0.0/1.Failed_step_-_Fail.png'
        },
        {
            stepName:          'Compare two strings',
            relatedSourceCode: 'notEq("test", "test")',
            actual:            '"test"',
            expected:          '"test"',
            type:              TYPE.notEqAssertion
        },
        {
            stepName:          'Check value',
            relatedSourceCode: 'ok(false)',
            actual:            'false',
            type:              TYPE.okAssertion
        },

        {
            stepName:          'Check value',
            relatedSourceCode: 'notOk("test")',
            actual:            '"test"',
            type:              TYPE.notOkAssertion
        },
        {
            type: TYPE.iframeLoadingTimeout
        },
        {
            type:     TYPE.inIFrameTargetLoadingTimeout,
            stepName: 'Do action in iframe'
        },
        {
            type:      TYPE.uncaughtJSError,
            scriptErr: 'Cannot read property \'name\' of null',
            pageUrl:   'http://host:8080/index.aspx'
        }
    ],
    [
        {
            type:      TYPE.uncaughtJSErrorInTestCodeStep,
            stepName:  'Step',
            scriptErr: 'error'
        },
        {
            type:     TYPE.storeDomNodeOrJqueryObject,
            stepName: 'Share Jquery object between steps'
        },
        {
            type:              TYPE.emptyFirstArgument,
            stepName:          'Click Login button',
            relatedSourceCode: 'act.click(null, {offsetX: 0, offsetY: 1000})',
            action:            'act.click'
        },
        {
            type:              TYPE.invisibleActionElement,
            stepName:          'Drag options panel',
            relatedSourceCode: 'act.drag($("button.login"), $("div.dock"), {dragOffsetX: 1, dragOffsetY: 2})',
            action:            'act.drag',
            element:           '&lt;button class=&quot;login&quot;&gt;&lt;/button&gt;'
        },
        {
            type:              TYPE.incorrectDraggingSecondArgument,
            stepName:          'Drag options panel',
            relatedSourceCode: 'act.drag($("button.login"), 1)'
        },
        {
            type:              TYPE.incorrectPressActionArgument,
            stepName:          'Enter the authentication data',
            relatedSourceCode: 'act.press("some text some text some text")'
        },
        {
            type:              TYPE.emptyTypeActionArgument,
            stepName:          'Type username',
            relatedSourceCode: 'act.type($("input"), "username")'
        },
        {
            type:     TYPE.unexpectedDialog,
            stepName: 'Handle alert message',
            dialog:   'unexpectedDialog',
            message:  'message'
        },
        {
            type:     TYPE.expectedDialogDoesntAppear,
            stepName: 'Handle prompt message',
            dialog:   'prompt'
        },
        {
            type:              TYPE.incorrectSelectActionArguments,
            stepName:          'Select the input text',
            relatedSourceCode: 'act.select($("input.username"));'
        },
        {
            type:              TYPE.incorrectWaitActionMillisecondsArgument,
            stepName:          'Wait 1000 milliseconds',
            relatedSourceCode: 'act.wait("1000")'
        },
        {
            type:              TYPE.incorrectWaitForActionEventArgument,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(callback) {\n    callback();\n})'
        },
        {
            type:              TYPE.incorrectWaitForActionTimeoutArgument,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(cb) {\n    cb();\n}, "1000")'
        },
        {
            type:              TYPE.waitForActionTimeoutExceeded,
            stepName:          'Wait for request handling',
            relatedSourceCode: 'act.waitFor(function(cb) {\n    cb();\n}, 1000);'
        }
    ],
    [
        {
            type:              TYPE.emptyIFrameArgument,
            stepName:          'Click button in IFrame',
            relatedSourceCode: 'inIFrame("#iFrame", function () {\n    act.click($("button"))\n})'
        },
        {
            type:              TYPE.iframeArgumentIsNotIFrame,
            stepName:          'Click button in IFrame',
            relatedSourceCode: 'inIFrame("#content", function () {\n    act.click($("button"))\n})'
        },
        {
            type:              TYPE.multipleIFrameArgument,
            stepName:          'Type text in IFrame',
            relatedSourceCode: 'inIFrame(".IFrame", function () {\n    act.press("123")\n})'
        },
        {
            type:              TYPE.incorrectIFrameArgument,
            stepName:          'Type text in IFrame',
            relatedSourceCode: 'inIFrame(IFrame, function () {\n    act.press("123")\n})'
        },
        {
            type:              TYPE.uploadCanNotFindFileToUpload,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload", ["./test-images/picture1", "./test-images/picture2"]);',
            filePaths:         ['./test-images/picture1', './test-images/picture2']
        },
        {
            type:              TYPE.uploadElementIsNotFileInput,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload-btn", ["./test-images/picture1", "./test-images/picture2"]);',
            filePath:          ['./test-images/picture1', './test-images/picture2']
        },
        {
            type:              TYPE.uploadInvalidFilePathArgument,
            stepName:          'Upload the user images',
            relatedSourceCode: 'act.upload(".upload", uploadFiles);'
        }
    ]
];
