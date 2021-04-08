const { ElementScreenshotOptions } = require('../../../../lib/test-run/commands/options');

const basicOptions = { speed: 1 };

const offsetOptions = Object.assign({
    offsetX:   1,
    offsetY:   2
}, basicOptions);

const mouseOptions = Object.assign({
    modifiers: {
        alt:   true,
        ctrl:  true,
        shift: true,
    }
}, offsetOptions);

const clickOptions = Object.assign({ caretPos: 1 }, mouseOptions);

const dragToElementOptions = Object.assign({
    destinationOffsetX: 3
}, mouseOptions);

const typeTextOptions = Object.assign({
    replace: true,
    paste:   true
}, clickOptions);

const scrollOptions = Object.assign({
    x: 1,
    y: 2
}, offsetOptions);

module.exports = [
    {
        testRunId: 'test-run-id',
        name:    'dispatchEvent',
        command: {
            eventName : 'mousedown',
            selector: { expression: 'Selector(\'#target\')' },
            options: {},
            relatedTarget: void 0,
            type:     'dispatch-event'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'click',
        command: {
            options:  clickOptions,
            selector: { expression: 'Selector(\'#target\')' },
            type:     'click'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'rightClick',
        command: {
            options:  clickOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'right-click'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'doubleClick',
        command: {
            options:  clickOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'double-click'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'hover',
        command: {
            options:  mouseOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'hover'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'drag',
        command: {
            options:     mouseOptions,
            selector: { expression: 'Selector(\'#target\')' },
            dragOffsetX: 100,
            dragOffsetY: 200,
            type:        'drag'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'dragToElement',
        command: {
            options:             dragToElementOptions,
            selector: { expression: 'Selector(\'#target\')' },
            destinationSelector: { expression: 'Selector(\'#target\')' },
            type:                'drag-to-element'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'scroll',
        command: {
            x:        100,
            y:        200,
            position: null,
            options:  offsetOptions,
            selector: { expression: 'Selector(\'#target\')' },
            type:     'scroll'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'scrollBy',
        command: {
            byX:      100,
            byY:      200,
            options:  offsetOptions,
            selector: { expression: 'Selector(\'#target\')' },
            type:     'scroll-by'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'scrollIntoView',
        command: {
            options:  offsetOptions,
            selector: { expression: 'Selector(\'#target\')' },
            type:     'scroll-into-view'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'typeText',
        command: {
            options:  typeTextOptions,
            selector: { expression:'Selector(\'#input\')' },
            text:     'test',
            type:     'type-text'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'selectText',
        command: {
            options:  basicOptions,
            selector: { expression:'Selector(\'#input\')' },
            startPos: 1,
            endPos:   3,
            type:     'select-text'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId:   'test-run-id',
        name: 'selectTextAreaContent',

        command: {
            options:   basicOptions,
            selector: { expression: 'Selector(\'#textarea\')' },
            startLine: 1,
            startPos:  2,
            endLine:   3,
            endPos:    4,
            type:      'select-text-area-content'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'selectEditableContent',
        command: {
            options:       basicOptions,
            startSelector: { expression:'Selector(\'#contenteditable\')' },
            endSelector:   { expression:  'Selector(\'#contenteditable\')' },
            type:          'select-editable-content'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'pressKey',
        command: {
            options: basicOptions,
            keys:    'enter',
            type:    'press-key'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId:   'test-run-id',
        name: 'wait',

        command: {
            type:    'wait',
            timeout: 1
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'navigateTo',
        command: {
            type: 'navigate-to',
            url:  './index.html'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'setFilesToUpload',
        command: {
            selector: { expression:'Selector(\'#file\')' },
            type:     'set-files-to-upload',
            filePath: '../test.js'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'clearUpload',
        command: {
            selector: { expression:'Selector(\'#file\')' },
            type:     'clear-upload',
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'takeScreenshot',
        command: {
            path:     'screenshotPath',
            fullPage: true,
            type:     'take-screenshot',
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'takeElementScreenshot',
        command: {
            selector: { expression:'Selector(\'#target\')' },
            path:     'screenshotPath',
            type:     'take-element-screenshot',
            options:  {
                includeMargins: true,
                crop: {
                    top: -100
                }
            }
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'resizeWindow',
        command: {
            width:  200,
            height: 200,
            type:   'resize-window'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'resizeWindowToFitDevice',
        command: {
            device:  'Sony Xperia Z',
            options: {
                portraitOrientation: true
            },
            type:    'resize-window-to-fit-device'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'maximizeWindow',
        command: {
            type: 'maximize-window'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'switchToIframe',
        command: {
            selector: { expression:'Selector(\'#iframe\')' },
            type:     'switch-to-iframe'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'switchToMainWindow',
        command: {
            type: 'switch-to-main-window'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'openWindow',
        command: {
            type: 'open-window',
            url:  'http://example.com'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'switchToWindow',
        command: {
            type:     'switch-to-window',
            windowId: 'window-id'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'closeWindow',
        command: {
            type:     'close-window',
            windowId: 'window-id'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'getCurrentWindow',
        command: {
            type: 'get-current-window'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'switchToParentWindow',
        command: {
            type: 'switch-to-parent-window'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:      'switchToPreviousWindow',
        command:   {
            type: 'switch-to-previous-window'
        },
        test:      {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture:   {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser:   { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'setNativeDialogHandler',
        command: {
            dialogHandler: {
                args: [],
                code: '(function(){ var func = function func() {return true;}; return func;})();'
            },
            type: 'set-native-dialog-handler'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'getNativeDialogHistory',
        command: {
            type: 'get-native-dialog-history'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'getBrowserConsoleMessages',
        command: {
            type: 'get-browser-console-messages',
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'debug',
        command: {
            type: 'debug'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'setTestSpeed',
        command: {
            speed: 1,
            type:  'set-test-speed'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'setPageLoadTimeout',
        command: {
            duration: 1,
            type:     'set-page-load-timeout'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        testRunId: 'test-run-id',
        name:    'useRole',
        command: {
            role: {
                loginUrl: 'http://example.com',
                options:  { preserveUrl: true },
                phase:    'uninitialized'
            },
            type: 'useRole'
        },
        test:    {
            id:    'test-id',
            name:  'test-name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture-id',
            name: 'fixture-name',
        },
        browser: { alias: 'test-browser', headless: false }
    }
];
