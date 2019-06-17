export default {
    screenshotsPathNotSpecified:             'Was unable to take screenshots because the screenshot directory is not specified. To specify it, use the "-s" or "--screenshots" command line option or the "screenshots" method of the test runner in case you are using API.',
    screenshotError:                         'Was unable to take a screenshot due to an error.\n\n{errMessage}',
    screenshotMarkNotFound:                  'Unable to locate the page area in the browser window screenshot at {screenshotPath}, because the page area mark with ID {markId} is not found in the screenshot.',
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
    cannotParseConfigFile:                   "Failed to parse the '.testcaferc.json' file.\n\nThis file is not a well-formed JSON file.",
    configOptionsWereOverriden:              'The {optionsString} option{suffix} from the configuration file will be ignored.',
    cannotOverrideTypeScriptConfigOptions:   'You cannot override the "{optionName}" compiler option in the TypeScript configuration file.',

    cannotFindSSLCertFile: 'Unable to find the "{path}" file, specified by the "{option}" ssl option. Error details:\n' +
                           '\n' +
                           '{err}',

    cannotFindConfigurationFile: 'Unable to find the "{path}" configuration file. Error details:\n' +
                                 '\n' +
                                 '{err}',

    problematicPathPatternPlaceholderForVideoRecording: 'The {placeholderList} path pattern placeholder{suffix} cannot be applied to the recorded video.\n' +
                                                        '\n' +
                                                        'The placeholder{suffix} {verb} replaced with an empty string.',

    cannotLoadMarketingData:         'An error has occurred while reading the marketing data. Error details:\n\n{err}',
    cannotSaveMarketingData:         'An error has occurred while saving the marketing data. Error details:\n\n{err}',
    cannotCalculateMarketingMessage: 'Cannot determine which promotional message to display. Attempted to display a message no. {index}'
};

