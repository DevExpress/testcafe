export default {
    screenshotsPathNotSpecified:             'Was unable to take screenshots because the screenshot directory is not specified. To specify it, use the "-s" or "--screenshots" command line option or the "screenshots" method of the test runner in case you are using API.',
    screenshotError:                         'Was unable to take a screenshot due to an error.\n\n{errMessage}',
    browserManipulationsNotSupportedOnLinux: 'The screenshot and window resize functionalities are not yet supported on Linux. Subscribe to the following issue to keep track: https://github.com/DevExpress/testcafe-browser-tools/issues/12',
    browserManipulationsOnRemoteBrowser:     'The screenshot and window resize functionalities are not supported in a remote browser. They can function only if the browser is running on the same machine and in the same environment as the TestCafe server.',
    screenshotNotSupportedByBrowserProvider: 'The screenshot functionality is not supported by the "{providerName}" browser provider.',
    resizeNotSupportedByBrowserProvider:     'The window resize functionality is not supported by the "{providerName}" browser provider.',
    maximizeNotSupportedByBrowserProvider:   'The maximize functionality is not supported by the "{providerName}" browser provider.',
    resizeError:                             'Was unable to resize the window due to an error.\n\n{errMessage}'
};
