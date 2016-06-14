// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    click:                      'click',
    rightClick:                 'right-click',
    doubleClick:                'double-click',
    drag:                       'drag',
    dragToElement:              'drag-to-element',
    hover:                      'hover',
    typeText:                   'type-text',
    selectText:                 'select-text',
    selectTextAreaContent:      'select-text-area-content',
    selectEditableContent:      'select-editable-content',
    pressKey:                   'press-key',
    wait:                       'wait',
    waitForElement:             'wait-for-element',
    navigateTo:                 'navigate-to',
    uploadFile:                 'upload-file',
    clearUpload:                'clear-upload',
    executeClientFunction:      'execute-client-function',
    executeSelector:            'execute-selector',
    takeScreenshot:             'take-screenshot',
    takeScreenshotOnFail:       'take-screenshot-on-fail',
    prepareBrowserManipulation: 'prepare-browser-manipulation',
    resizeWindow:               'resize-window',
    resizeWindowToFitDevice:    'resize-window-to-fit-device',
    testDone:                   'test-done'
};
