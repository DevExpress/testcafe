'use strict';

exports.__esModule = true;
exports.default = {
    screenshotsPathNotSpecified: 'Was unable to take screenshots because the screenshot directory is not specified. To specify it, use the "-s" or "--screenshots" command line option or the "screenshots" method of the test runner in case you are using API.',
    screenshotError: 'Was unable to take a screenshot due to an error.\n\n{errMessage}',
    screenshotMarkNotFound: 'Unable to locate the page area in the browser window screenshot at {screenshotPath}, because the page area mark with ID {markId} is not found in the screenshot.',
    screenshotRewritingError: 'The file at "{screenshotPath}" already exists. It has just been rewritten with a recent screenshot. This situation can possibly cause issues. To avoid them, make sure that each screenshot has a unique path. If a test runs in multiple browsers, consider including the user agent in the screenshot path or generate a unique identifier in another way.',
    browserManipulationsOnRemoteBrowser: 'The screenshot and window resize functionalities are not supported in a remote browser. They can function only if the browser is running on the same machine and in the same environment as the TestCafe server.',
    screenshotNotSupportedByBrowserProvider: 'The screenshot functionality is not supported by the "{providerName}" browser provider.',
    resizeNotSupportedByBrowserProvider: 'The window resize functionality is not supported by the "{providerName}" browser provider.',
    maximizeNotSupportedByBrowserProvider: 'The window maximization functionality is not supported by the "{providerName}" browser provider.',
    resizeError: 'Was unable to resize the window due to an error.\n\n{errMessage}',
    maximizeError: 'Was unable to maximize the window due to an error.\n\n{errMessage}'
};
module.exports = exports['default'];