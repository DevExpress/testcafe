export default {
    screenshotsPathNotSpecified:             'Was unable to take screenshots because the screenshot directory is not specified. To specify it, use the "-s" or "--screenshots" command line option or the "screenshots" method of the test runner in case you are using API.',
    screenshotError:                         'Was unable to take a screenshot due to an error.\n\n{errMessage}',
    screenshotMarkNotFound:                  'Unable to locate the page area in the browser window screenshot at {screenshotPath}, because the page area mark with ID {markId} is not found in the screenshot.',
    browserManipulationsOnRemoteBrowser:     'The screenshot and window resize functionalities are not supported in a remote browser. They can function only if the browser is running on the same machine and in the same environment as the TestCafe server.',
    screenshotNotSupportedByBrowserProvider: 'The screenshot functionality is not supported by the "{providerName}" browser provider.',
    resizeNotSupportedByBrowserProvider:     'The window resize functionality is not supported by the "{providerName}" browser provider.',
    maximizeNotSupportedByBrowserProvider:   'The window maximization functionality is not supported by the "{providerName}" browser provider.',
    resizeError:                             'Was unable to resize the window due to an error.\n\n{errMessage}',
    maximizeError:                           'Was unable to maximize the window due to an error.\n\n{errMessage}'
};
