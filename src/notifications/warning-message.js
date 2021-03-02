export default {
    screenshotsDisabled:                     'Screenshots are disabled. To take screenshots, remove the "--disable-screenshots" command line flag or set the "disableScreenshots" option to "false" in the API or configuration file.',
    screenshotError:                         'Was unable to take a screenshot due to an error.\n\n{errMessage}',
    screenshotMarkNotFound:                  'Unable to locate the page area in the browser window screenshot at {screenshotPath}, because the page area mark with ID {markId} is not found in the screenshot.',
    screenshotsFullPageNotSupported:         'TestCafe does not support full-page screenshots in {browserAlias}.',
    screenshotRewritingError:                'The file at "{screenshotPath}" already exists. It has just been rewritten with a recent screenshot. This situation can possibly cause issues. To avoid them, make sure that each screenshot has a unique path. If a test runs in multiple browsers, consider including the user agent in the screenshot path or generate a unique identifier in another way.',
    browserManipulationsOnRemoteBrowser:     'The screenshot and window resize functionalities are not supported in a remote browser. They can function only if the browser is running on the same machine and in the same environment as the TestCafe server.',
    screenshotNotSupportedByBrowserProvider: 'The screenshot functionality is not supported by the "{providerName}" browser provider.',
    videoNotSupportedByBrowser:              'Video recording is not supported by the "{browserAlias}" browser.',
    videoBrowserResizing:                    'The browser window was resized during the "{testName}" test while TestCafe recorded a video. TestCafe cannot adjust the video resolution during recording. As a result, the video content may appear broken. Do not resize the browser window when TestCafe records a video.',
    resizeNotSupportedByBrowserProvider:     'The window resize functionality is not supported by the "{providerName}" browser provider.',
    maximizeNotSupportedByBrowserProvider:   'The window maximization functionality is not supported by the "{providerName}" browser provider.',
    resizeError:                             'Was unable to resize the window due to an error.\n\n{errMessage}',
    maximizeError:                           'Was unable to maximize the window due to an error.\n\n{errMessage}',
    requestMockCORSValidationFailed:         '{RequestHook}: CORS validation failed for a request specified as {requestFilterRule}',
    debugInHeadlessError:                    'You cannot debug in headless mode.',
    cannotReadConfigFile:                    'An error has occurred while reading the configuration file.',
    cannotParseConfigFile:                   "Failed to parse the '{path}' file.\n\nThis file is not a well-formed JSON file.",
    configOptionsWereOverridden:             'The {optionsString} option{suffix} from the configuration file will be ignored.',
    cannotOverrideTypeScriptConfigOptions:   'You cannot override the "{optionName}" compiler option in the TypeScript configuration file.\n',

    cannotFindWindowDescriptorError: 'Could not find the "{browserAlias}" window. ' +
                                     'TestCafe is unable to resize the window or take screenshots.\n\n' +
                                     'The following error occurred while TestCafe was searching ' +
                                     'for the window descriptor:\n\n{errMessage}',

    cannotFindSSLCertFile: 'Unable to find the "{path}" file, specified by the "{option}" ssl option. Error details:\n' +
                           '\n' +
                           '{err}',

    cannotFindConfigurationFile: 'Unable to find the "{path}" configuration file. Error details:\n' +
                                 '\n' +
                                 '{err}',

    problematicPathPatternPlaceholderForVideoRecording: 'The {placeholderList} path pattern placeholder{suffix} cannot be applied to the recorded video.\n' +
                                                        '\n' +
                                                        'The placeholder{suffix} {verb} replaced with an empty string.',

    clientScriptsWithEmptyContent:      'The client script you tried to inject is empty.',
    clientScriptsWithDuplicatedContent: 'You injected the following client script{suffix} several times:\n{duplicatedScripts}',
    assertedSelectorInstance:           'You passed a Selector object to \'t.expect()\'.\nIf you want to check that a matched element exists, pass the \'selector.exists\' value instead.',
    assertedClientFunctionInstance:     'You passed a ClientFunction object to \'t.expect()\'.\nIf you want to check the function\'s return value, use parentheses to call the function: fnName().',
    multipleWindowsFoundByPredicate:    'The predicate function passed to the \'switchToWindow\' method matched multiple windows. The first matching window was activated.',
    excessiveAwaitInAssertion:          'You passed a DOM snapshot property to the assertion\'s \'t.expect()\' method. The property value is assigned when the snapshot is resolved and this value is no longer updated. To ensure that the assertion verifies an up-to-date value, pass the selector property without \'await\'.',
    missingAwaitOnSnapshotProperty:     'You used a DOM snapshot property without \'await\'. The property value is assigned when the snapshot is resolved. If you need to use the property value, use \'await\' to resolve the Promise.',
    retryTestPagesIsNotSupported:       'Cannot enable the \'retryTestPages\' option in "{browserAlias}". Please ensure that your version of "{browserAlias}" supports the Service Worker API (https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).\n',
    browserProviderDropOfPerformance:   'We detected \'{browserName}\' runs slowly. Try to free up or allocate more system resources on its host machine.',
    testsCompilationTakesTooLong:       'Tests took too long to compile ({compileTime}). Ensure the test code has no excessive imports.',
    deprecatedAPI:                      '{API} is deprecated and will be removed in the next major release. Use {replacement} instead.'
};

