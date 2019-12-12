const { ElementScreenshotOptions } = require('../../../../lib/test-run/commands/options');

const basicOptions = { speed: 1 };

const mouseOptions = Object.assign({
    modifiers: {
        alt:   true,
        ctrl:  true,
        meta:  true,
        shift: true,
    },
    offsetX:   1,
    offsetY:   2
}, basicOptions);

const clickOptions = Object.assign({ caretPos: 1 }, mouseOptions);

const dragToElementOptions = Object.assign({
    destinationOffsetX: 3,
    destinationOffsetY: 4
}, mouseOptions);

const typeTextOptions = Object.assign({
    replace: true,
    paste:   true
}, clickOptions);

module.exports = [
    {
        name:    'getNativeDialogHistory',
        command: {
            type: 'get-native-dialog-history'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'getBrowserConsoleMessages',
        command: {
            type: 'get-browser-console-messages',
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name:    'click',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'click'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'rightClick',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'right-click'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name:    'doubleClick',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'double-click'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'hover',
        command: {
            options:  mouseOptions,
            selector: 'Selector(\'#target\')',
            type:     'hover'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'drag',
        command: {
            options:     mouseOptions,
            selector:    'Selector(\'#target\')',
            dragOffsetX: 100,
            dragOffsetY: 200,
            type:        'drag'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'dragToElement',
        command: {
            options:             dragToElementOptions,
            selector:            'Selector(\'#target\')',
            destinationSelector: 'Selector(\'#target\')',
            type:                'drag-to-element'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'typeText',
        command: {
            options:  typeTextOptions,
            selector: 'Selector(\'#input\')',
            text:     'test',
            type:     'type-text'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'selectText',
        command: {
            options:  basicOptions,
            selector: 'Selector(\'#input\')',
            startPos: 1,
            endPos:   3,
            type:     'select-text'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'selectTextAreaContent',

        command: {
            options:   basicOptions,
            selector:  'Selector(\'#textarea\')',
            startLine: 1,
            startPos:  2,
            endLine:   3,
            endPos:    4,
            type:      'select-text-area-content'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'selectEditableContent',
        command: {
            options:       basicOptions,
            startSelector: 'Selector(\'#contenteditable\')',
            endSelector:   'Selector(\'#contenteditable\')',
            type:          'select-editable-content'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'pressKey',
        command: {
            options: basicOptions,
            keys:    'enter',
            type:    'press-key'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'wait',

        command: {
            type:    'wait',
            timeout: 1
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'navigateTo',
        command: {
            type: 'navigate-to',
            url:  './index.html'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'setFilesToUpload',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'set-files-to-upload',
            filePath: '../test.js'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'clearUpload',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'clear-upload',
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'takeScreenshot',
        command: {
            path:     'screenshotPath',
            fullPage: true,
            type:     'take-screenshot',
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'takeElementScreenshot',
        command: {
            selector: 'Selector(\'#target\')',
            path:     'screenshotPath',
            type:     'take-element-screenshot',
            options:  new ElementScreenshotOptions()
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'resizeWindow',
        command: {
            width:  200,
            height: 200,
            type:   'resize-window'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'resizeWindowToFitDevice',
        command: {
            device:  'Sony Xperia Z',
            options: {
                portraitOrientation: true
            },
            type:    'resize-window-to-fit-device'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'maximizeWindow',
        command: {
            type: 'maximize-window'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'switchToIframe',
        command: {
            selector: 'Selector(\'#iframe\')',
            type:     'switch-to-iframe'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'switchToMainWindow',
        command: {
            type: 'switch-to-main-window'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name:      'setNativeDialogHandler',
        command: {
            dialogHandler: {
                args: [],
                code: '(function(){ return (function () {return true;});})();'
            },
            type:          'set-native-dialog-handler'
        },
        test:      { name: 'test-name', phase: 'initial' },
        browser:   { alias: 'test-browser', headless: false }
    },
    {
        name:    'debug',
        command: {
            type: 'debug'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }

    },
    {
        name: 'setTestSpeed',
        command: {
            speed: 1,
            type:  'set-test-speed'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name: 'setPageLoadTimeout',
        command: {
            duration: 1,
            type:     'set-page-load-timeout'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    },
    {
        name:    'useRole',
        command: {
            role: {
                loginPage: 'http://example.com',
                options:   { preserveUrl: true },
                phase:     'uninitialized'
            },
            type: 'useRole'
        },
        test:    { name: 'test-name', phase: 'initial' },
        browser: { alias: 'test-browser', headless: false }
    }
];
