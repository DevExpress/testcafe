const expect                  = require('chai').expect;
const TYPE                    = require('../../lib/test-run/commands/type');
const createCommandFromObject = require('../../lib/test-run/commands/from-object');
const SelectorBuilder         = require('../../lib/client-functions/selectors/selector-builder');
const assertThrow             = require('./helpers/assert-runtime-error').assertThrow;
const TestController          = require('../../lib/api/test-controller');
const path                    = require('path');

const testRunMock = {
    test: {
        testFile: {
            filename: path.join(__dirname, 'test.js'),
        },
    },
};

testRunMock.controller = new TestController(testRunMock);

const CHILD_SELECTOR_PROPERTY_NAMES = [
    'selector',
    'startSelector',
    'endSelector',
    'destinationSelector',
];

function ensureActionId (command, { type }) {
    if (!command.actionId)
        throw new Error('command does not have action id');

    command.actionId = type;

    for (const selectorProperty of CHILD_SELECTOR_PROPERTY_NAMES) {
        if (command[selectorProperty]) {
            if (!command[selectorProperty].actionId)
                throw new Error('nested command does not have action id');

            command[selectorProperty].actionId = 'child-command-selector';
        }
    }
}

function createCommand (obj) {
    try {
        const command = createCommandFromObject(obj, testRunMock);

        ensureActionId(command, obj);

        return command;
    }
    catch (e) {
        // TODO: add an assertion for APIError
        if (e.originError)
            e.originError = null;

        throw e;
    }
}

function assertErrorMessage (fn, expectedErrMessage) {
    let actualErr = null;

    try {
        fn();
    }
    catch (err) {
        actualErr = err;
    }

    expect(actualErr.message).eql(expectedErrMessage);
}

function makeSelector (str, skipVisibilityCheck, needError, strictError) {
    const builder = new SelectorBuilder(str, {
        visibilityCheck: !skipVisibilityCheck,
        needError, strictError,
    }, { instantiation: 'Selector' });
    const command = builder.getCommand();

    command.actionId = 'child-command-selector';

    return JSON.parse(JSON.stringify(command));
}

describe('Test run commands', () => {
    describe('Construction from object and serialization', () => {
        it('Should create ClickCommand from object', () => {
            let commandObj = {
                type:     TYPE.click,
                selector: '#yo',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: true,
                        alt:   true,
                        meta:  true,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                actionId: TYPE.click,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: true,
                        meta:  true,
                    },
                },
            });

            commandObj = {
                type:     TYPE.click,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                actionId: TYPE.click,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  null,
                    offsetY:  null,
                    caretPos: null,
                    speed:    null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create RightClickCommand from object', () => {
            let commandObj = {
                type:     TYPE.rightClick,
                selector: '#yo',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   true,
                        meta:  false,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.rightClick,
                actionId: TYPE.rightClick,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false,
                    },
                },
            });

            commandObj = {
                type:     TYPE.rightClick,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.rightClick,
                actionId: TYPE.rightClick,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  null,
                    offsetY:  null,
                    caretPos: null,
                    speed:    null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create DoubleClickCommand from object', () => {
            let commandObj = {
                type:     TYPE.doubleClick,
                selector: '#yo',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   true,
                        meta:  false,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.doubleClick,
                actionId: TYPE.doubleClick,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false,
                    },
                },
            });

            commandObj = {
                type:     TYPE.doubleClick,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.doubleClick,
                actionId: TYPE.doubleClick,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  null,
                    offsetY:  null,
                    caretPos: null,
                    speed:    null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create HoverCommand from object', () => {
            let commandObj = {
                type:     TYPE.hover,
                selector: '#yo',

                options: {
                    offsetX: 23,
                    offsetY: 32,
                    speed:   0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   true,
                        meta:  false,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.hover,
                actionId: TYPE.hover,
                selector: makeSelector('#yo'),

                options: {
                    offsetX: 23,
                    offsetY: 32,
                    speed:   0.5,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false,
                    },
                },
            });

            commandObj = {
                type:     TYPE.hover,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.hover,
                actionId: TYPE.hover,
                selector: makeSelector('#yo'),

                options: {
                    offsetX: null,
                    offsetY: null,
                    speed:   null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create DragCommand from object', () => {
            let commandObj = {
                type:        TYPE.drag,
                selector:    '#yo',
                dragOffsetX: 10,
                dragOffsetY: -15,

                options: {
                    offsetX: 23,
                    offsetY: 32,
                    speed:   0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   true,
                        meta:  false,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:        TYPE.drag,
                actionId:    TYPE.drag,
                selector:    makeSelector('#yo'),
                dragOffsetX: 10,
                dragOffsetY: -15,

                options: {
                    offsetX: 23,
                    offsetY: 32,
                    speed:   0.5,

                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false,
                    },
                },
            });

            commandObj = {
                type:        TYPE.drag,
                selector:    '#yo',
                dragOffsetX: 10,
                dragOffsetY: -15,
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:        TYPE.drag,
                actionId:    TYPE.drag,
                selector:    makeSelector('#yo'),
                dragOffsetX: 10,
                dragOffsetY: -15,

                options: {
                    offsetX: null,
                    offsetY: null,
                    speed:   null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create DragToElementCommand from object', () => {
            let commandObj = {
                type:                TYPE.dragToElement,
                selector:            '#yo',
                destinationSelector: '#destination',

                options: {
                    offsetX:            23,
                    offsetY:            32,
                    destinationOffsetX: 12,
                    destinationOffsetY: 21,
                    speed:              0.5,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   true,
                        meta:  false,
                    },
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:                TYPE.dragToElement,
                actionId:            TYPE.dragToElement,
                selector:            makeSelector('#yo'),
                destinationSelector: makeSelector('#destination'),

                options: {
                    offsetX:            23,
                    offsetY:            32,
                    destinationOffsetX: 12,
                    destinationOffsetY: 21,
                    speed:              0.5,


                    modifiers: {
                        ctrl:  true,
                        alt:   true,
                        shift: false,
                        meta:  false,
                    },
                },
            });

            commandObj = {
                type:                TYPE.dragToElement,
                selector:            '#yo',
                destinationSelector: '#destination',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.dragToElement,
                actionId: TYPE.dragToElement,

                selector:            makeSelector('#yo'),
                destinationSelector: makeSelector('#destination'),

                options: {
                    offsetX:            null,
                    offsetY:            null,
                    destinationOffsetX: null,
                    destinationOffsetY: null,
                    speed:              null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create TypeTextCommand from object', () => {
            let commandObj = {
                type:     TYPE.typeText,
                selector: '#yo',
                text:     'testText',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,
                    replace:  true,
                    paste:    true,

                    modifiers: {
                        ctrl:  true,
                        shift: false,
                        alt:   false,
                        meta:  false,
                    },

                    confidential: true,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.typeText,
                actionId: TYPE.typeText,
                selector: makeSelector('#yo', false, true, true),
                text:     'testText',

                options: {
                    offsetX:  23,
                    offsetY:  32,
                    caretPos: 2,
                    speed:    0.5,
                    replace:  true,
                    paste:    true,

                    modifiers: {
                        ctrl:  true,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },

                    confidential: true,
                },
            });

            commandObj = {
                type:     TYPE.typeText,
                selector: '#yo',
                text:     'testText',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.typeText,
                actionId: TYPE.typeText,
                selector: makeSelector('#yo', false, true, true),
                text:     'testText',

                options: {
                    offsetX:  null,
                    offsetY:  null,
                    caretPos: null,
                    speed:    null,
                    replace:  false,
                    paste:    false,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should create SelectTextCommand from object', () => {
            let commandObj = {
                type:     TYPE.selectText,
                selector: '#yo',
                startPos: 1,
                endPos:   2,

                options: {
                    speed: 0.5,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.selectText,
                actionId: TYPE.selectText,
                selector: makeSelector('#yo'),
                startPos: 1,
                endPos:   2,

                options: {
                    speed: 0.5,
                },
            });

            commandObj = {
                type:     TYPE.selectText,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.selectText,
                actionId: TYPE.selectText,
                selector: makeSelector('#yo'),
                startPos: null,
                endPos:   null,

                options: {
                    speed: null,
                },
            });
        });

        it('Should create SelectTextAreaContentCommand from object', () => {
            let commandObj = {
                type:      TYPE.selectTextAreaContent,
                selector:  '#yo',
                startLine: 0,
                startPos:  1,
                endLine:   2,
                endPos:    3,

                options: {
                    speed: 0.5,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:      TYPE.selectTextAreaContent,
                actionId:  TYPE.selectTextAreaContent,
                selector:  makeSelector('#yo'),
                startLine: 0,
                startPos:  1,
                endLine:   2,
                endPos:    3,

                options: {
                    speed: 0.5,
                },
            });

            commandObj = {
                type:     TYPE.selectTextAreaContent,
                selector: '#yo',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:      TYPE.selectTextAreaContent,
                actionId:  TYPE.selectTextAreaContent,
                selector:  makeSelector('#yo'),
                startLine: null,
                startPos:  null,
                endLine:   null,
                endPos:    null,

                options: {
                    speed: null,
                },
            });
        });

        it('Should create SelectEditableContentCommand from object', () => {
            let commandObj = {
                type:          TYPE.selectEditableContent,
                startSelector: '#node1',
                endSelector:   '#node2',

                options: {
                    speed: 0.5,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.selectEditableContent,
                actionId:      TYPE.selectEditableContent,
                startSelector: makeSelector('#node1'),
                endSelector:   makeSelector('#node2'),

                options: {
                    speed: 0.5,
                },
            });

            commandObj = {
                type:          TYPE.selectEditableContent,
                startSelector: '#node1',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.selectEditableContent,
                actionId:      TYPE.selectEditableContent,
                startSelector: makeSelector('#node1'),
                endSelector:   null,

                options: {
                    speed: null,
                },
            });
        });

        it('Should create PressKeyCommand from object', () => {
            const commandObj = {
                type: TYPE.pressKey,
                keys: 'a+b c',

                options: {
                    speed: 0.5,
                },
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.pressKey,
                actionId: TYPE.pressKey,
                keys:     'a+b c',

                options: {
                    speed: 0.5,
                },
            });
        });

        it('Should create WaitCommand from object', () => {
            const commandObj = {
                type:    TYPE.wait,
                timeout: 1000,
            };
            const command    = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.wait,
                actionId: TYPE.wait,
                timeout:  1000,
            });
        });

        it('Should create NavigateToCommand from object', () => {
            const commandObj = {
                type:          TYPE.navigateTo,
                url:           'localhost',
                stateSnapshot: 'stateSnapshot',
                forceReload:   true,
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.navigateTo,
                actionId:      TYPE.navigateTo,
                url:           'localhost',
                stateSnapshot: 'stateSnapshot',
                forceReload:   true,
            });
        });

        it('Should create SetFilesToUploadCommand from object', function () {
            let commandObj = {
                type:     TYPE.setFilesToUpload,
                selector: '#yo',
                filePath: '/test/path',
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.setFilesToUpload,
                actionId: TYPE.setFilesToUpload,
                selector: makeSelector('#yo', true),
                filePath: '/test/path',
            });

            commandObj = {
                type:     TYPE.setFilesToUpload,
                selector: '#yo',
                filePath: ['/test/path/1', '/test/path/2'],
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.setFilesToUpload,
                actionId: TYPE.setFilesToUpload,
                selector: makeSelector('#yo', true),
                filePath: ['/test/path/1', '/test/path/2'],
            });
        });

        it('Should create ClearUploadCommand from object', function () {
            const commandObj = {
                type:     TYPE.clearUpload,
                selector: '#yo',
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.clearUpload,
                actionId: TYPE.clearUpload,
                selector: makeSelector('#yo', true),
            });
        });

        it('Should create TakeScreenshotCommand from object', function () {
            let commandObj = {
                type:     TYPE.takeScreenshot,
                path:     'custom',
                fullPage: true,
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.takeScreenshot,
                actionId: TYPE.takeScreenshot,
                markData: '',
                markSeed: null,
                path:     'custom',
                fullPage: true,
            });

            commandObj = {
                type:     TYPE.takeScreenshot,
                fullPage: void 0,
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.takeScreenshot,
                actionId: TYPE.takeScreenshot,
                markData: '',
                markSeed: null,
                path:     '',
            });
        });

        it('Should create TakeElementScreenshotCommand from object', function () {
            const commandObj = {
                type:     TYPE.takeElementScreenshot,
                selector: '#yo',
                path:     'custom',

                options: {
                    crop: {
                        left: 50,
                        top:  13,
                    },
                },
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.takeElementScreenshot,
                actionId: TYPE.takeElementScreenshot,
                markData: '',
                markSeed: null,
                selector: makeSelector('#yo'),
                path:     'custom',

                options: {
                    scrollTargetX: null,
                    scrollTargetY: null,
                    speed:         null,

                    crop: {
                        left:   50,
                        right:  null,
                        top:    13,
                        bottom: null,
                    },

                    includeMargins:  false,
                    includeBorders:  true,
                    includePaddings: true,
                },
            });
        });

        it('Should create ResizeWindowCommand from object', function () {
            const commandObj = {
                type:   TYPE.resizeWindow,
                width:  100,
                height: 100,
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.resizeWindow,
                actionId: TYPE.resizeWindow,
                width:    100,
                height:   100,
            });
        });

        it('Should create ResizeWindowToFitDeviceCommand from object', function () {
            let commandObj = {
                type:   TYPE.resizeWindowToFitDevice,
                device: 'iPhone',

                options: {
                    portraitOrientation: true,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.resizeWindowToFitDevice,
                actionId: TYPE.resizeWindowToFitDevice,
                device:   'iPhone',
                options:  { portraitOrientation: true },
            });

            commandObj = {
                type:   TYPE.resizeWindowToFitDevice,
                device: 'iPhone',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.resizeWindowToFitDevice,
                actionId: TYPE.resizeWindowToFitDevice,
                device:   'iPhone',
                options:  { portraitOrientation: false },
            });
        });

        it('Should create SwitchToIframeCommand from object', function () {
            const commandObj = {
                type:     TYPE.switchToIframe,
                selector: '#iframe',
            };
            const command    = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.switchToIframe,
                actionId: TYPE.switchToIframe,
                selector: makeSelector('#iframe'),
            });
        });

        it('Should create SwitchToMainWindowCommand from object', function () {
            const commandObj = {
                type: TYPE.switchToMainWindow,
            };
            const command    = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.switchToMainWindow,
                actionId: TYPE.switchToMainWindow,
            });
        });

        it('Should create SetTestSpeedCommand from object', function () {
            const commandObj = {
                type:  TYPE.setTestSpeed,
                speed: 0.5,
            };
            const command    = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.setTestSpeed,
                actionId: TYPE.setTestSpeed,
                speed:    0.5,
            });
        });

        it('Should create SetPageLoadTimeoutCommand from object', function () {
            const commandObj = {
                type:     TYPE.setPageLoadTimeout,
                duration: 3,
            };
            const command    = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.setPageLoadTimeout,
                actionId: TYPE.setPageLoadTimeout,
                duration: 3,
            });
        });

        it('Should create AssertionCommand from object', function () {
            let commandObj = {
                type:          TYPE.assertion,
                assertionType: 'eql',
                actual:        1,
                expected:      0.2,
                expected2:     3.5,
                message:       'ok',

                options: {
                    timeout: 100,
                },
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.assertion,
                actionId:      TYPE.assertion,
                assertionType: 'eql',
                actual:        1,
                expected:      0.2,
                expected2:     3.5,
                message:       'ok',

                options: {
                    timeout:               100,
                    allowUnawaitedPromise: false,
                },
            });

            commandObj = {
                type:          TYPE.assertion,
                assertionType: 'ok',
                actual:        1,
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.assertion,
                actionId:      TYPE.assertion,
                assertionType: 'ok',
                actual:        1,
                message:       null,

                options: {
                    allowUnawaitedPromise: false,
                },
            });
        });

        it('Should create ExecuteExpressionCommand from object', function () {
            let commandObj = {
                type: TYPE.executeExpression,

                expression:         'js-expression',
                resultVariableName: 'variable',
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.executeExpression,
                actionId: TYPE.executeExpression,

                expression:         'js-expression',
                resultVariableName: 'variable',
            });

            commandObj = {
                type:       TYPE.executeExpression,
                expression: 'js-expression',
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.executeExpression,
                actionId: TYPE.executeExpression,

                expression:         'js-expression',
                resultVariableName: null,
            });
        });

        it('Should process js expression as a Selector', function () {
            const commandObj = {
                type:     TYPE.click,
                selector: {
                    type:  'js-expr',
                    value: 'Selector(\'#yo\')',
                },
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.click,
                actionId: TYPE.click,
                selector: makeSelector('#yo'),

                options: {
                    offsetX:  null,
                    offsetY:  null,
                    caretPos: null,
                    speed:    null,

                    modifiers: {
                        ctrl:  false,
                        alt:   false,
                        shift: false,
                        meta:  false,
                    },
                },
            });
        });

        it('Should process js expression as an assertion parameter', function () {
            const commandObj = {
                type:          TYPE.assertion,
                assertionType: 'eql',

                actual: {
                    type:  'js-expr',
                    value: '1 + 2',
                },

                expected: 1,
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:          TYPE.assertion,
                actionId:      TYPE.assertion,
                assertionType: 'eql',
                actual:        3,
                expected:      1,
                message:       null,

                options: {
                    allowUnawaitedPromise: false,
                },
            });
        });

        it('Should create RecorderCommand from object', function () {
            let commandObj = {
                type:    TYPE.recorder,
                subtype: 'test',
            };

            let command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.recorder,
                actionId: TYPE.recorder,
                subtype:  'test',

                forceExecutionInTopWindowOnly: false,
            });

            commandObj = {
                type:    TYPE.recorder,
                subtype: 'test',

                forceExecutionInTopWindowOnly: true,
            };

            command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.recorder,
                actionId: TYPE.recorder,
                subtype:  'test',

                forceExecutionInTopWindowOnly: true,
            });
        });

        it('Should create GetCookiesCommand from object', () => {
            const commandObj = {
                type: TYPE.getCookies,
                urls: ['http://localhost/'],

                cookies: [{
                    'name': 'apiCookie1',
                }],
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.getCookies,
                actionId: TYPE.getCookies,
                urls:     ['http://localhost/'],

                cookies: [{
                    'name': 'apiCookie1',
                }],
            });
        });

        it('Should create SetCookiesCommand from object', () => {
            const commandObj = {
                type: TYPE.setCookies,
                url:  [],

                cookies: [{
                    name:   'apiCookie13',
                    value:  'value13',
                    domain: 'some-another-domain.com',
                    path:   '/',
                }],
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.setCookies,
                actionId: TYPE.setCookies,
                url:      [],

                cookies: [{
                    name:   'apiCookie13',
                    value:  'value13',
                    domain: 'some-another-domain.com',
                    path:   '/',
                }],
            });
        });

        it('Should create DeleteCookiesCommand from object', () => {
            const commandObj = {
                type: TYPE.deleteCookies,
                urls: ['http://localhost/'],

                cookies: [{
                    name: 'apiCookie13',
                }],
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.deleteCookies,
                actionId: TYPE.deleteCookies,
                urls:     ['http://localhost/'],

                cookies: [{
                    name: 'apiCookie13',
                }],
            });
        });

        it('Should create RequestCommand from object', () => {
            const commandObj = {
                type: TYPE.request,
                url:  'http://localhost/',

                options: {
                    method: 'GET',
                },
            };

            const command = createCommand(commandObj);

            expect(JSON.parse(JSON.stringify(command))).eql({
                type:     TYPE.request,
                actionId: TYPE.request,
                url:      'http://localhost/',

                options: {
                    method: 'GET',
                },
            });
        });
    });

    describe('Validation', function () {
        it('Should validate СlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.click,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  {
                            offsetX: 'ClickOptions.offsetX',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'ClickOptions.offsetX',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: 'element',
                        options:  {
                            offsetX: 10.5,
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'ClickOptions.offsetX',
                    actualValue:     10.5,
                    callsite:        null,
                }
            );
        });

        it('Should validate RightСlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.rightClick,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is boolean, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  'options',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  {
                            offsetX: false,
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'ClickOptions.offsetX',
                    actualValue:     'boolean',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.rightClick,
                        selector: 'element',
                        options:  {
                            modifiers: {
                                shift: 'true',
                            },
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    optionName:      'ModifiersOptions.shift',
                    actualValue:     'string',
                    callsite:        null,
                }
            );
        });

        it('Should validate DoubleСlickСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.doubleClick,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.doubleClick,
                        selector: true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is boolean, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.doubleClick,
                        selector: 'element',
                        options:  1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.doubleClick,
                        selector: 'element',
                        options:  {
                            caretPos: '5',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E10',
                    optionName:      'ClickOptions.caretPos',
                    actualValue:     'string',
                    callsite:        null,
                }
            );
        });

        it('Should validate HoverСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.hover,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'boolean',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  {
                            offsetX: 'offsetX',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'MouseOptions.offsetX',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.hover,
                        selector: 'element',
                        options:  {
                            offsetY: 1.01,
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'MouseOptions.offsetY',
                    actualValue:     1.01,
                    callsite:        null,
                }
            );
        });

        it('Should validate DragСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.drag,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.drag,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.drag,
                        selector: 'element',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E20',
                    argumentName:    'dragOffsetX',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 10,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E20',
                    argumentName:    'dragOffsetY',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 10,
                        dragOffsetY: 10.5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E20',
                    argumentName:    'dragOffsetY',
                    actualValue:     10.5,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:        TYPE.drag,
                        selector:    'element',
                        dragOffsetX: 1,
                        dragOffsetY: -1,
                        options:     1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate DragToElementСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.dragToElement,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.dragToElement,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.dragToElement,
                        selector: 'element',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'destinationSelector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:                TYPE.dragToElement,
                        selector:            'element',
                        destinationSelector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'destinationSelector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:                TYPE.dragToElement,
                        selector:            'element',
                        destinationSelector: 'destination',
                        options:             1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate TypeTextСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.typeText,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'text',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     2,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'text',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'text',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'boolean',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  {
                            offsetX: 'offsetX',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E9',
                    optionName:      'TypeOptions.offsetX',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.typeText,
                        selector: 'element',
                        text:     'testText',
                        options:  {
                            replace: 10,
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    optionName:      'TypeOptions.replace',
                    actualValue:     'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate SelectTextСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.selectText,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: {},
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is object, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: 'element',
                        startPos: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'startPos',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: 'element',
                        startPos: 5.5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'startPos',
                    actualValue:     5.5,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: 'element',
                        endPos:   NaN,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'endPos',
                    actualValue:     NaN,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: 'element',
                        endPos:   -1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'endPos',
                    actualValue:     -1,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectText,
                        selector: 'element',
                        options:  1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate SelectTextAreaContentСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.selectTextAreaContent,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectTextAreaContent,
                        selector: {},
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is object, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:      TYPE.selectTextAreaContent,
                        selector:  'element',
                        startLine: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'startLine',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:      TYPE.selectTextAreaContent,
                        selector:  'element',
                        startLine: 5.5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'startLine',
                    actualValue:     5.5,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectTextAreaContent,
                        selector: 'element',
                        endLine:  NaN,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'endLine',
                    actualValue:     NaN,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectTextAreaContent,
                        selector: 'element',
                        endLine:  -1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'endLine',
                    actualValue:     -1,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.selectTextAreaContent,
                        selector: 'element',
                        options:  1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate SelectEditableContentСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.selectEditableContent,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'startSelector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.selectEditableContent,
                        startSelector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'startSelector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.selectEditableContent,
                        startSelector: 'node1',
                        endSelector:   true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'endSelector',
                    errMsg:          'Cannot initialize a Selector because Selector is boolean, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.selectEditableContent,
                        startSelector: 'node1',
                        endSelector:   'node2',
                        options:       1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate PressKeyСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.pressKey,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'keys',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.pressKey,
                        keys: true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'keys',
                    actualValue:     'boolean',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.pressKey,
                        keys: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'keys',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.pressKey,
                        keys:    'a',
                        options: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate WaitСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.wait,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'timeout',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.wait,
                        timeout: -5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'timeout',
                    actualValue:     -5,
                    callsite:        null,
                }
            );
        });

        it('Should validate NavigateToCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.navigateTo,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'url',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.navigateTo,
                        url:  true,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'url',
                    actualValue:     'boolean',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.navigateTo,
                        url:  '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'url',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertErrorMessage(
                function () {
                    return createCommand({
                        type: TYPE.navigateTo,
                        url:  'mail://testcafe@devexpress.com',
                    });
                },
                'Cannot prepare tests due to the following error:\n\nInvalid test page URL: "mail://testcafe@devexpress.com". TestCafe cannot execute the test because the test page URL includes the mail protocol. TestCafe supports the following protocols: http://, https:// and file://.'
            );
        });

        it('Should validate SetFilesToUploadCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.setFilesToUpload,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E18',
                    argumentName:    'filePath',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: 2,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E18',
                    argumentName:    'filePath',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E18',
                    argumentName:    'filePath',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: {},
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E18',
                    argumentName:    'filePath',
                    actualValue:     'object',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: [],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E18',
                    argumentName:    'filePath',
                    actualValue:     '[]',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: ['123', 42],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E19',
                    argumentName:    'filePath',
                    actualValue:     'number',
                    elementIndex:    1,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setFilesToUpload,
                        selector: 'element',
                        filePath: ['123', ''],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E19',
                    argumentName:    'filePath',
                    actualValue:     '""',
                    elementIndex:    1,
                    callsite:        null,
                }
            );
        });

        it('Should validate ClearUploadCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.clearUpload,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.clearUpload,
                        selector: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is number, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );
        });

        it('Should validate TakeScreenshot', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.takeScreenshot,
                        path: 1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    actualValue:     'number',
                    argumentName:    'path',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.takeScreenshot,
                        path: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    actualValue:     '""',
                    argumentName:    'path',
                    callsite:        null,
                }
            );
        });

        it('Should validate ResizeWindowСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.resizeWindow,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'width',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:   TYPE.resizeWindow,
                        width:  5,
                        height: -5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'height',
                    actualValue:     -5,
                    callsite:        null,
                }
            );
        });

        it('Should validate ResizeWindowToFitDeviceСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.resizeWindowToFitDevice,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'device',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:   TYPE.resizeWindowToFitDevice,
                        device: 5,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'device',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:   TYPE.resizeWindowToFitDevice,
                        device: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'device',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:   TYPE.resizeWindowToFitDevice,
                        device: 'iPhone 555',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E38',
                    argumentName:    'device',
                    actualValue:     'iPhone 555',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.resizeWindowToFitDevice,
                        device:  'iPhone',
                        options: { portraitOrientation: {} },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E11',
                    optionName:      'ResizeToFitDeviceOptions.portraitOrientation',
                    actualValue:     'object',
                    callsite:        null,
                }
            );
        });

        it('Should validate SetTestSpeedCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.setTestSpeed,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E47',
                    argumentName:    'speed',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:  TYPE.setTestSpeed,
                        speed: 2,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E47',
                    argumentName:    'speed',
                    actualValue:     2,
                    callsite:        null,
                }
            );
        });

        it('Should validate SetPageLoadTimeoutCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.setPageLoadTimeout,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'duration',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.setPageLoadTimeout,
                        duration: -1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E22',
                    argumentName:    'duration',
                    actualValue:     -1,
                    callsite:        null,
                }
            );
        });

        it('Should validate AssertionСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.assertion,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'assertionType',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.assertion,
                        assertionType: 123,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'assertionType',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.assertion,
                        assertionType: 'ok',
                        options:       1,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E14',
                    actualType:      'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.assertion,
                        assertionType: 'ok',
                        options:       {
                            timeout: 'timeout',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E10',
                    optionName:      'AssertionOptions.timeout',
                    actualValue:     'string',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.assertion,
                        assertionType: 'ok',
                        options:       {
                            timeout: 10.5,
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E10',
                    optionName:      'AssertionOptions.timeout',
                    actualValue:     10.5,
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:          TYPE.assertion,
                        assertionType: 'ok',

                        actual: {
                            type:  'js-expr',
                            value: 'invalid js code',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    argumentName:    'actual',
                    actualValue:     'invalid js code',
                    errMsg:          'Unexpected identifier',
                    code:            'E59',
                    callsite:        null,
                    originError:     null,
                }
            );
        });

        it('Should validate ExecuteExpressionСommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.executeExpression,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'expression',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:       TYPE.executeExpression,
                        expression: 123,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'expression',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:               TYPE.executeExpression,
                        expression:         'js-expression',
                        resultVariableName: 123,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'resultVariableName',
                    actualValue:     'number',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:               TYPE.executeExpression,
                        expression:         'js-expression',
                        resultVariableName: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'resultVariableName',
                    actualValue:     '""',
                    callsite:        null,
                }
            );
        });

        it('Should validate ExecuteAsyncExpressionCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.executeAsyncExpression,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'expression',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:       TYPE.executeAsyncExpression,
                        expression: 123,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'expression',
                    actualValue:     'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate js expression as Selector', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: {
                            type:  'js-expr',
                            value: 'Selector()',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'Cannot initialize a Selector because Selector is undefined, and not one of the following: ' +
                                     'a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',

                    callsite:    null,
                    originError: null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:     TYPE.click,
                        selector: {
                            type:  'js-expr',
                            value: 'yo',
                        },
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E23',
                    selectorName:    'selector',
                    errMsg:          'yo is not defined',

                    callsite:    null,
                    originError: null,
                }
            );
        });

        it('Should validate RecorderCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.recorder,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'subtype',
                    actualValue:     'undefined',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.recorder,
                        subtype: '',
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'subtype',
                    actualValue:     '""',
                    callsite:        null,
                }
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.recorder,
                        subtype: 2,
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E16',
                    argumentName:    'subtype',
                    actualValue:     'number',
                    callsite:        null,
                }
            );
        });

        it('Should validate GetCookiesCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.getCookies,
                        cookies: [
                            void 0,
                        ],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E86',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.getCookies,
                        cookies: [
                            {
                                name: 'name',
                            },
                            void 0,
                        ],
                    });
                },
                {
                    actualValue:     void 0,
                    index:           1,
                    isTestCafeError: true,
                    code:            'E87',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.getCookies,
                        urls: ['url.url'],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E88',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.getCookies,
                        urls: [
                            'http://localhost/',
                            'url.url',
                        ],
                    });
                },
                {
                    actualValue:     'url.url',
                    index:           1,
                    isTestCafeError: true,
                    code:            'E89',
                    callsite:        null,
                },
            );
        });

        it('Should validate SetCookiesCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.setCookies,
                        cookies: [],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E85',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.setCookies,
                        cookies: [
                            void 0,
                        ],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E86',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.setCookies,
                        cookies: [
                            {
                                name: 'name',
                            },
                            void 0,
                        ],
                    });
                },
                {
                    actualValue:     void 0,
                    index:           1,
                    isTestCafeError: true,
                    code:            'E87',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.setCookies,
                        url:  ['url.url'],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E88',
                    callsite:        null,
                },
            );
        });

        it('Should validate DeleteCookiesCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.deleteCookies,
                        cookies: [
                            void 0,
                        ],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E86',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.deleteCookies,
                        cookies: [
                            {
                                name: 'name',
                            },
                            void 0,
                        ],
                    });
                },
                {
                    index:           1,
                    actualValue:     void 0,
                    isTestCafeError: true,
                    code:            'E87',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.deleteCookies,
                        urls: ['url.url'],
                    });
                },
                {
                    isTestCafeError: true,
                    code:            'E88',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.deleteCookies,
                        urls: [
                            'http://localhost/',
                            'url.url',
                        ],
                    });
                },
                {
                    index:           1,
                    actualValue:     'url.url',
                    isTestCafeError: true,
                    code:            'E89',
                    callsite:        null,
                },
            );
        });

        it('Should validate RequestCommand', function () {
            assertThrow(
                function () {
                    return createCommand({
                        type: TYPE.request,
                        url:  true,
                    });
                },
                {
                    actualValue:     'boolean',
                    argumentName:    'url',
                    isTestCafeError: true,
                    code:            'E96',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            method: true,
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.method',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E90',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            headers: true,
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.headers',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E95',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            params: true,
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.params',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E94',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            timeout: 'true',
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.timeout',
                    actualValue:     'string',
                    isTestCafeError: true,
                    code:            'E92',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            withCredentials: 'true',
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.withCredentials',
                    actualValue:     'string',
                    isTestCafeError: true,
                    code:            'E11',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            auth: true,
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.auth',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E95',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            auth: {
                                username: true,
                                password: 'password',
                            },
                        },
                    });
                },
                {
                    optionName:      'RequestAuthOptions.username',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E90',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            auth: {
                                username: 'username',
                                password: true,
                            },
                        },
                    });
                },
                {
                    optionName:      'RequestAuthOptions.password',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E90',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            proxy: true,
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.proxy',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E95',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            proxy: {
                                protocol: true,
                            },
                        },
                    });
                },
                {
                    optionName:      'RequestProxyOptions.protocol',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E90',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            proxy: {
                                host: true,
                                port: 3000,
                            },
                        },
                    });
                },
                {
                    optionName:      'RequestProxyOptions.host',
                    actualValue:     'boolean',
                    isTestCafeError: true,
                    code:            'E90',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            proxy: {
                                host: 'localhost',
                                port: {},
                            },
                        },
                    });
                },
                {
                    optionName:      'RequestProxyOptions.port',
                    actualValue:     'object',
                    isTestCafeError: true,
                    code:            'E92',
                    callsite:        null,
                },
            );

            assertThrow(
                function () {
                    return createCommand({
                        type:    TYPE.request,
                        options: {
                            rawResponse: 'true',
                        },
                    });
                },
                {
                    optionName:      'RequestOptions.rawResponse',
                    actualValue:     'string',
                    isTestCafeError: true,
                    code:            'E11',
                    callsite:        null,
                },
            );
        });
    });
});
