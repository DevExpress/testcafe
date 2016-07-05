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
    navigateTo:                 'navigate-to',
    setFilesToUpload:           'set-files-to-upload',
    clearUpload:                'clear-upload',
    executeClientFunction:      'execute-client-function',
    executeSelector:            'execute-selector',
    takeScreenshot:             'take-screenshot',
    takeScreenshotOnFail:       'take-screenshot-on-fail',
    prepareBrowserManipulation: 'prepare-browser-manipulation',
    resizeWindow:               'resize-window',
    resizeWindowToFitDevice:    'resize-window-to-fit-device',
    switchToIframe:             'switch-to-iframe',
    switchToMainWindow:         'switch-to-main-window',
    setNativeDialogHandler:     'set-native-dialog-handler',
    getNativeDialogHistory:     'get-native-dialog-history',
    testDone:                   'test-done'
};
