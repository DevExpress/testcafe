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
        testRunId: 'test_run_id',
        name:    'click',
        command: {
            options:  clickOptions,
            selector: { expression: 'Selector(\'#target\')' },
            type:     'click'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'rightClick',
        command: {
            options:  clickOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'right-click'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'doubleClick',
        command: {
            options:  clickOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'double-click'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'hover',
        command: {
            options:  mouseOptions,
            selector: { expression:'Selector(\'#target\')' },
            type:     'hover'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'drag',
        command: {
            options:     mouseOptions,
            selector: { expression: 'Selector(\'#target\')' },
            dragOffsetX: 100,
            dragOffsetY: 200,
            type:        'drag'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'dragToElement',
        command: {
            options:             dragToElementOptions,
            selector: { expression: 'Selector(\'#target\')' },
            destinationSelector: { expression: 'Selector(\'#target\')' },
            type:                'drag-to-element'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'typeText',
        command: {
            options:  typeTextOptions,
            selector: { expression:'Selector(\'#input\')' },
            text:     'test',
            type:     'type-text'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'selectText',
        command: {
            options:  basicOptions,
            selector: { expression:'Selector(\'#input\')' },
            startPos: 1,
            endPos:   3,
            type:     'select-text'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId:   'test_run_id',
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
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'selectEditableContent',
        command: {
            options:       basicOptions,
            startSelector: { expression:'Selector(\'#contenteditable\')' },
            endSelector:   { expression:  'Selector(\'#contenteditable\')' },
            type:          'select-editable-content'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'pressKey',
        command: {
            options: basicOptions,
            keys:    'enter',
            type:    'press-key'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId:   'test_run_id',
        name: 'wait',

        command: {
            type:    'wait',
            timeout: 1
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'navigateTo',
        command: {
            type: 'navigate-to',
            url:  './index.html'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'setFilesToUpload',
        command: {
            selector: { expression:'Selector(\'#file\')' },
            type:     'set-files-to-upload',
            filePath: '../test.js'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'clearUpload',
        command: {
            selector: { expression:'Selector(\'#file\')' },
            type:     'clear-upload',
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'takeScreenshot',
        command: {
            path:     'screenshotPath',
            fullPage: true,
            type:     'take-screenshot',
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'takeElementScreenshot',
        command: {
            selector: { expression:'Selector(\'#target\')' },
            path:     'screenshotPath',
            type:     'take-element-screenshot',
            options:  new ElementScreenshotOptions()
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'resizeWindow',
        command: {
            width:  200,
            height: 200,
            type:   'resize-window'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'resizeWindowToFitDevice',
        command: {
            device:  'Sony Xperia Z',
            options: {
                portraitOrientation: true
            },
            type:    'resize-window-to-fit-device'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'maximizeWindow',
        command: {
            type: 'maximize-window'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'switchToIframe',
        command: {
            selector: { expression:'Selector(\'#iframe\')' },
            type:     'switch-to-iframe'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'switchToMainWindow',
        command: {
            type: 'switch-to-main-window'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'setNativeDialogHandler',
        command: {
            dialogHandler: {
                args: [],
                code: '(function(){ return (function () {return true;});})();'
            },
            type: 'set-native-dialog-handler'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'getNativeDialogHistory',
        command: {
            type: 'get-native-dialog-history'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'getBrowserConsoleMessages',
        command: {
            type: 'get-browser-console-messages',
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'debug',
        command: {
            type: 'debug'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'setTestSpeed',
        command: {
            speed: 1,
            type:  'set-test-speed'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'setPageLoadTimeout',
        command: {
            duration: 1,
            type:     'set-page-load-timeout'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    },
    {
        testRunId: 'test_run_id',
        name:    'useRole',
        command: {
            role: {
                loginPage: 'http://example.com',
                options:   { preserveUrl: true },
                phase:     'uninitialized'
            },
            type: 'useRole'
        },
        test:    {
            id:    'test_id',
            name:  'test_name',
            phase: 'initial'
        },
        fixture: {
            id:   'fixture_id',
            name: 'fixture_name',
        },
        browser: { alias: 'test_browser', headless: false }
    }
];
