const basicOptions = { speed: 1 };

const offsetOptions = Object.assign({
    offsetX: 1,
    offsetY: 2,
}, basicOptions);

const mouseOptions = Object.assign({
    modifiers: {
        alt:   true,
        ctrl:  true,
        shift: true,
    },
}, offsetOptions);

const clickOptions = Object.assign({ caretPos: 1 }, mouseOptions);

const dragToElementOptions = Object.assign({
    destinationOffsetX: 3,
}, mouseOptions);

const typeTextOptions = Object.assign({
    replace: true,
    paste:   true,
}, clickOptions);

module.exports = {
    basicOptions,
    offsetOptions,
    mouseOptions,
    clickOptions,
    dragToElementOptions,
    typeTextOptions,
    expectedLog: [
        {
            testRunId: 'test-run-id',
            name:      'dispatchEvent',
            command:   {
                eventName:     'mousedown',
                selector:      { expression: 'Selector(\'#target\')' },
                options:       {},
                relatedTarget: void 0,
                type:          'dispatch-event',
                actionId:      'DispatchEventCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'click',
            command:   {
                options:  clickOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'click',
                actionId: 'ClickCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'rightClick',
            command:   {
                options:  clickOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'right-click',
                actionId: 'RightClickCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'doubleClick',
            command:   {
                options:  clickOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'double-click',
                actionId: 'DoubleClickCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'hover',
            command:   {
                options:  mouseOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'hover',
                actionId: 'HoverCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'drag',
            command:   {
                options:     mouseOptions,
                selector:    { expression: 'Selector(\'#target\')' },
                dragOffsetX: 100,
                dragOffsetY: 200,
                type:        'drag',
                actionId:    'DragCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'dragToElement',
            command:   {
                options:             dragToElementOptions,
                selector:            { expression: 'Selector(\'#target\')' },
                destinationSelector: { expression: 'Selector(\'#target\')' },
                type:                'drag-to-element',
                actionId:            'DragToElementCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'scroll',
            command:   {
                x:        100,
                y:        200,
                position: null,
                options:  offsetOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'scroll',
                actionId: 'ScrollCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'scrollBy',
            command:   {
                byX:      100,
                byY:      200,
                options:  offsetOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'scroll-by',
                actionId: 'ScrollByCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'scrollIntoView',
            command:   {
                options:  offsetOptions,
                selector: { expression: 'Selector(\'#target\')' },
                type:     'scroll-into-view',
                actionId: 'ScrollIntoViewCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'typeText',
            command:   {
                options:  typeTextOptions,
                selector: { expression: 'Selector(\'#input\')' },
                text:     'test',
                type:     'type-text',
                actionId: 'TypeTextCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'selectText',
            command:   {
                options:  basicOptions,
                selector: { expression: 'Selector(\'#input\')' },
                startPos: 1,
                endPos:   3,
                type:     'select-text',
                actionId: 'SelectTextCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'selectTextAreaContent',

            command: {
                options:   basicOptions,
                selector:  { expression: 'Selector(\'#textarea\')' },
                startLine: 1,
                startPos:  2,
                endLine:   3,
                endPos:    4,
                type:      'select-text-area-content',
                actionId:  'SelectTextAreaContentCommand',
            },
            test:    {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture: {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser: { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'selectEditableContent',
            command:   {
                options:       basicOptions,
                startSelector: { expression: 'Selector(\'#contenteditable\')' },
                endSelector:   { expression: 'Selector(\'#contenteditable\')' },
                type:          'select-editable-content',
                actionId:      'SelectEditableContentCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'pressKey',
            command:   {
                options:  basicOptions,
                actionId: 'PressKeyCommand',
                keys:     'enter',
                type:     'press-key',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'wait',

            command: {
                type:     'wait',
                timeout:  1,
                actionId: 'WaitCommand',
            },
            test:    {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture: {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser: { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'navigateTo',
            command:   {
                type:     'navigate-to',
                url:      './index.html',
                actionId: 'NavigateToCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'setFilesToUpload',
            command:   {
                selector: { expression: 'Selector(\'#file\')' },
                type:     'set-files-to-upload',
                filePath: '../test.js',
                actionId: 'SetFilesToUploadCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'clearUpload',
            command:   {
                actionId: 'ClearUploadCommand',
                selector: { expression: 'Selector(\'#file\')' },
                type:     'clear-upload',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'takeScreenshot',
            command:   {
                path:        'screenshotPath',
                pathPattern: '',
                fullPage:    true,
                thumbnails:  undefined,
                type:        'take-screenshot',
                actionId:    'TakeScreenshotCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'takeElementScreenshot',
            command:   {
                selector: { expression: 'Selector(\'#target\')' },
                path:     'screenshotPath',
                type:     'take-element-screenshot',
                actionId: 'TakeElementScreenshotCommand',
                options:  {
                    includeMargins: true,
                    crop:           {
                        top: -100,
                    },
                },
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'resizeWindow',
            command:   {
                width:    200,
                height:   200,
                type:     'resize-window',
                actionId: 'ResizeWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'resizeWindowToFitDevice',
            command:   {
                device:   'Sony Xperia Z',
                options:  {
                    portraitOrientation: true,
                },
                type:     'resize-window-to-fit-device',
                actionId: 'ResizeWindowToFitDeviceCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'maximizeWindow',
            command:   {
                type:     'maximize-window',
                actionId: 'MaximizeWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'switchToIframe',
            command:   {
                actionId: 'SwitchToIframeCommand',
                selector: { expression: 'Selector(\'#iframe\')' },
                type:     'switch-to-iframe',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'switchToMainWindow',
            command:   {
                type:     'switch-to-main-window',
                actionId: 'SwitchToMainWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'openWindow',
            command:   {
                type:     'open-window',
                url:      'http://example.com',
                actionId: 'OpenWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'switchToWindow',
            command:   {
                type:     'switch-to-window',
                windowId: 'window-id',
                actionId: 'SwitchToWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'closeWindow',
            command:   {
                type:     'close-window',
                windowId: 'window-id',
                actionId: 'CloseWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'getCurrentWindow',
            command:   {
                type:     'get-current-window',
                actionId: 'GetCurrentWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'getCurrentCDPSession',
            command:   {
                type:     'get-current-c-d-p-session',
                actionId: 'GetCurrentCDPSessionCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'switchToParentWindow',
            command:   {
                type:     'switch-to-parent-window',
                actionId: 'SwitchToParentWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'switchToPreviousWindow',
            command:   {
                type:     'switch-to-previous-window',
                actionId: 'SwitchToPreviousWindowCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'setNativeDialogHandler',
            command:   {
                dialogHandler: {
                    args: [],
                    code: '(function(){ var func = function func() {return true;}; return func;})();',
                },
                type:          'set-native-dialog-handler',
                actionId:      'SetNativeDialogHandlerCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'getNativeDialogHistory',
            command:   {
                type:     'get-native-dialog-history',
                actionId: 'GetNativeDialogHistoryCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'getBrowserConsoleMessages',
            command:   {
                type:     'get-browser-console-messages',
                actionId: 'GetBrowserConsoleMessagesCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'debug',
            command:   {
                type:     'debug',
                selector: undefined,
                actionId: 'DebugCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'setTestSpeed',
            command:   {
                speed:    1,
                type:     'set-test-speed',
                actionId: 'SetTestSpeedCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'setPageLoadTimeout',
            command:   {
                duration: 1,
                type:     'set-page-load-timeout',
                actionId: 'SetPageLoadTimeoutCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'useRole',
            command:   {
                role:     {
                    loginUrl: 'http://example.com',
                    options:  { preserveUrl: true },
                    phase:    'uninitialized',
                },
                type:     'useRole',
                actionId: 'UseRoleCommand',
            },
            test:      {
                id:    'test-id',
                name:  'test-name',
                phase: 'initial',
            },
            fixture:   {
                id:   'fixture-id',
                name: 'fixture-name',
            },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'getCookies',
            command:   {
                type:     'get-cookies',
                actionId: 'GetCookiesCommand',
                urls:     ['https://domain.com'],
                cookies:  [
                    {
                        name: 'cookieName',
                    },
                ],
            },
            test:      { id: 'test-id', name: 'test-name', phase: 'initial' },
            fixture:   { name: 'fixture-name', id: 'fixture-id' },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'setCookies',
            command:   {
                type:     'set-cookies',
                actionId: 'SetCookiesCommand',
                url:      'https://domain.com',
                cookies:  [
                    {
                        name:  'cookieName',
                        value: 'cookieValue',
                    },
                ],
            },
            test:      { id: 'test-id', name: 'test-name', phase: 'initial' },
            fixture:   { name: 'fixture-name', id: 'fixture-id' },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'deleteCookies',
            command:   {
                type:     'delete-cookies',
                actionId: 'DeleteCookiesCommand',
                urls:     ['https://domain.com'],
                cookies:  [
                    {
                        name: 'cookieName1',
                    },
                    {
                        name: 'cookieName2',
                    },
                ],
            },
            test:      { id: 'test-id', name: 'test-name', phase: 'initial' },
            fixture:   { name: 'fixture-name', id: 'fixture-id' },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'skipJsErrors',
            command:   {
                actionId: 'SkipJsErrorsCommand',
                options:  true,
                type:     'skip-js-errors',
            },
            test:      { id: 'test-id', name: 'test-name', phase: 'initial' },
            fixture:   { id: 'fixture-id', name: 'fixture-name' },
            browser:   { alias: 'test-browser', headless: false },
        },
        {
            testRunId: 'test-run-id',
            name:      'report',
            command:   {
                actionId: 'ReportCommand',
                args:     [],
                type:     'report',
            },
            test:      { id: 'test-id', name: 'test-name', phase: 'initial' },
            fixture:   { id: 'fixture-id', name: 'fixture-name' },
            browser:   { alias: 'test-browser', headless: false },
        },
    ],
}
