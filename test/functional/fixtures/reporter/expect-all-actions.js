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
        action:  'done',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'right-click'
        }
    },
    {
        action:  'done',
        command: {
            options:  clickOptions,
            selector: 'Selector(\'#target\')',
            type:     'double-click'
        }
    },
    {
        action:  'done',
        command: {
            options:  mouseOptions,
            selector: 'Selector(\'#target\')',
            type:     'hover'
        }
    },
    {
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
        action:  'done',
        command: {
            options:             dragToElementOptions,
            selector:            'Selector(\'#target\')',
            destinationSelector: 'Selector(\'#target\')',
            type:                'drag-to-element'
        }
    },
    {
        action:  'done',
        command: {
            options:  typeTextOptions,
            selector: 'Selector(\'#input\')',
            text:     'test',
            type:     'type-text'
        }
    },
    {
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
        action:  'done',
        command: {
            options:       basicOptions,
            startSelector: 'Selector(\'#contenteditable\')',
            endSelector:   'Selector(\'#contenteditable\')',
            type:          'select-editable-content'
        }
    },
    {
        action:  'done',
        command: {
            options: basicOptions,
            keys:    'enter',
            type:    'press-key'
        }
    },
    {
        action:  'done',
        command: {
            type:    'wait',
            timeout: 1
        }
    },
    {
        action:  'done',
        command: {
            type: 'navigate-to',
            url:  './index.html'
        }
    },
    {
        action:  'done',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'set-files-to-upload',
            filePath: '../test.js'
        }
    },
    {
        action:  'done',
        command: {
            selector: 'Selector(\'#file\')',
            type:     'clear-upload',
        }
    },
    {
        action:  'done',
        command: {
            path:     'screenshotPath',
            fullPage: true,
            type:     'take-screenshot',
        }
    },
    {
        action:  'done',
        command: {
            selector: 'Selector(\'#target\')',
            path:     'screenshotPath',
            type:     'take-element-screenshot',
            options:  new ElementScreenshotOptions()
        }
    },
    {
        action:  'done',
        command: {
            width:  200,
            height: 200,
            type:   'resize-window'
        }
    },
    {
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
        action:  'done',
        command: {
            type: 'maximize-window'
        }
    },
    {
        action:  'done',
        command: {
            selector: 'Selector(\'#iframe\')',
            type:     'switch-to-iframe'
        }
    },
    {
        action:  'done',
        command: {
            type: 'switch-to-main-window'
        }
    },
    {
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
        action:  'done',
        command: {
            speed: 1,
            type:  'set-test-speed'
        }
    },
    {
        action:  'done',
        command: {
            duration: 1,
            type:     'set-page-load-timeout'
        }
    },
    {
        action:  'done',
        command: {
            type: 'get-native-dialog-history'
        }
    },
    {
        action:  'done',
        command: {
            type: 'get-browser-console-messages',
        }
    }
];

