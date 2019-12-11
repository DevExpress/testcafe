const { ElementScreenshotOptions } = require('../../../../lib/test-run/commands/options');

const basicOptions = { speed: 1 };

const mouseOptions = Object.assign({
    modifiers: {
        alt:   true,
        ctrl:  true,
        meta:  true,
        shift: true,
    },
    offsetX: 1,
    offsetY: 2
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
        name:    'rightClick',
        action:  'done',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'right-click'
        }
    },
    {
        name:    'doubleClick',
        action:  'done',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'double-click'
        }
    },
    {
        name:    'hover',
        action:  'done',
        command: {
            options:  mouseOptions,
            selector: 'Selector(\'#target\')',
            type:     'hover'
        }
    },
    {
        name:    'drag',
        action:  'done',
        command: {
            options:     mouseOptions,
            selector:    'Selector(\'#target\')',
            dragOffsetX: 100,
            dragOffsetY: 200,
            type:        'drag'
        }
    },
    {
        name:    'dragToElement',
        action:  'done',
        command: {
            options:             dragToElementOptions,
            selector:            'Selector(\'#target\')',
            destinationSelector: 'Selector(\'#target\')',
            type:                'drag-to-element'
        }
    },
    {
        name:    'typeText',
        action:  'done',
        command: {
            options:  typeTextOptions,
            selector: 'Selector(\'#input\')',
            text:     'test',
            type:     'type-text'
        }
    },
    {
        name:    'selectText',
        action:  'done',
        command: {
            options:  basicOptions,
            selector: 'Selector(\'#input\')',
            startPos: 1,
            endPos:   3,
            type:     'select-text'
        }
    },
    {
        name:    'selectTextAreaContent',
        action:  'done',
        command: {
            options:   basicOptions,
            selector:  'Selector(\'#textarea\')',
            startLine: 1,
            startPos:  2,
            endLine:   3,
            endPos:    4,
            type:      'select-text-area-content'
        }
    },
    {
        name:    'selectEditableContent',
        action:  'done',
        command: {
            options:       basicOptions,
            startSelector: 'Selector(\'#contenteditable\')',
            endSelector:   'Selector(\'#contenteditable\')',
            type:          'select-editable-content'
        }
    },
    {
        name:    'pressKey',
        action:  'done',
        command: {
            options: basicOptions,
            keys:    'enter',
            type:    'press-key'
        }
    },
    {
        name:    'wait',
        action:  'done',
        command: {
            type:    'wait',
            timeout: 1
        }
    },
    {
        name:    'navigateTo',
        action:  'done',
        command: {
            type: 'navigate-to',
            url:  './index.html'
        }
    },
    {
        name:    'setFilesToUpload',
        action:  'done',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'set-files-to-upload',
            filePath: '../test.js'
        }
    },
    {
        name:    'clearUpload',
        action:  'done',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'clear-upload',
        }
    },
    {
        name:    'takeScreenshot',
        action:  'done',
        command: {
            path:     'screenshotPath',
            fullPage: true,
            type:     'take-screenshot',
        }
    },
    {
        name:    'takeElementScreenshot',
        action:  'done',
        command: {
            selector: 'Selector(\'#target\')',
            path:     'screenshotPath',
            type:     'take-element-screenshot',
            options:  new ElementScreenshotOptions()
        }
    },
    {
        name:    'resizeWindow',
        action:  'done',
        command: {
            width:  200,
            height: 200,
            type:   'resize-window'
        }
    },
    {
        name:    'resizeWindowToFitDevice',
        action:  'done',
        command: {
            device:  'Sony Xperia Z',
            options: {
                portraitOrientation: true
            },
            type: 'resize-window-to-fit-device'
        }
    },
    {
        name:    'maximizeWindow',
        action:  'done',
        command: {
            type: 'maximize-window'
        }
    },
    {
        name:    'switchToIframe',
        action:  'done',
        command: {
            selector: 'Selector(\'#iframe\')',
            type:     'switch-to-iframe'
        }
    },
    {
        name:    'switchToMainWindow',
        action:  'done',
        command: {
            type: 'switch-to-main-window'
        }
    },
    {
        name:      'setNativeDialogHandler',
        action:    'done',
        'command': {
            dialogHandler: {
                args: [],
                code: '(function(){ return (function () {return true;});})();'
            },
            type: 'set-native-dialog-handler'
        }
    },
    {
        name:    'setTestSpeed',
        action:  'done',
        command: {
            speed: 1,
            type:  'set-test-speed'
        }
    },
    {
        name:    'setPageLoadTimeout',
        action:  'done',
        command: {
            duration: 1,
            type:     'set-page-load-timeout'
        }
    },
    {
        name:    'getNativeDialogHistory',
        action:  'done',
        command: {
            type: 'get-native-dialog-history'
        }
    },
    {
        name:    'getBrowserConsoleMessages',
        action:  'done',
        command: {
            type: 'get-browser-console-messages',
        }
    }
];

