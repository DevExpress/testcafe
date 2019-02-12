// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { RuntimeErrors } from '../types';

export default {
    [RuntimeErrors.cannotCreateMultipleLiveModeRunners.name]:                            'Cannot create multiple live mode runners.',
    [RuntimeErrors.cannotRunLiveModeRunnerMultipleTimes.name]:                           'Cannot run a live mode runner multiple times.',
    [RuntimeErrors.browserDisconnected.name]:                                            'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    [RuntimeErrors.cantRunAgainstDisconnectedBrowsers.name]:                             'The following browsers disconnected: {userAgents}. Tests will not be run.',
    [RuntimeErrors.cantEstablishBrowserConnection.name]:                                 'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    [RuntimeErrors.cantFindBrowser.name]:                                                'Unable to find the browser. "{browser}" is not a browser alias or path to an executable file.',
    [RuntimeErrors.browserProviderNotFound.name]:                                        'The specified "{providerName}" browser provider was not found.',
    [RuntimeErrors.browserNotSet.name]:                                                  'No browser selected to test against.',
    [RuntimeErrors.testSourcesNotSet.name]:                                              'No test file specified.',
    [RuntimeErrors.noTestsToRun.name]:                                                   'No tests to run. Either the test files contain no tests or the filter function is too restrictive.',
    [RuntimeErrors.cantFindReporterForAlias.name]:                                       'The provided "{name}" reporter does not exist. Check that you have specified the report format correctly.',
    [RuntimeErrors.multipleStdoutReporters.name]:                                        'Multiple reporters attempting to write to stdout: "{reporters}". Only one reporter can write to stdout.',
    [RuntimeErrors.optionValueIsNotValidRegExp.name]:                                    'The "{optionName}" option value is not a valid regular expression.',
    [RuntimeErrors.optionValueIsNotValidKeyValue.name]:                                  'The "{optionName}" option value is not a valid key-value pair.',
    [RuntimeErrors.invalidSpeedValue.name]:                                              'Speed should be a number between 0.01 and 1.',
    [RuntimeErrors.invalidConcurrencyFactor.name]:                                       'The concurrency factor should be an integer greater or equal to 1.',
    [RuntimeErrors.cannotDivideRemotesCountByConcurrency.name]:                          'The number of remote browsers should be divisible by the factor of concurrency.',
    [RuntimeErrors.portsOptionRequiresTwoNumbers.name]:                                  'The "--ports" option requires two numbers to be specified.',
    [RuntimeErrors.portIsNotFree.name]:                                                  'The specified {portNum} port is already in use by another program.',
    [RuntimeErrors.invalidHostname.name]:                                                'The specified "{hostname}" hostname cannot be resolved to the current machine.',
    [RuntimeErrors.cantFindSpecifiedTestSource.name]:                                    'Cannot find a test source file at "{path}".',
    [RuntimeErrors.clientFunctionCodeIsNotAFunction.name]:                               '{#instantiationCallsiteName} code is expected to be specified as a function, but {type} was passed.',
    [RuntimeErrors.selectorInitializedWithWrongType.name]:                               '{#instantiationCallsiteName} is expected to be initialized with a function, CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but {type} was passed.',
    [RuntimeErrors.clientFunctionCantResolveTestRun.name]:                               "{#instantiationCallsiteName} cannot implicitly resolve the test run in context of which it should be executed. If you need to call {#instantiationCallsiteName} from the Node.js API callback, pass the test controller manually via {#instantiationCallsiteName}'s `.with({ boundTestRun: t })` method first. Note that you cannot execute {#instantiationCallsiteName} outside the test code.",
    [RuntimeErrors.regeneratorInClientFunctionCode.name]:                                `{#instantiationCallsiteName} code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).`,
    [RuntimeErrors.invalidClientFunctionTestRunBinding.name]:                            'The "boundTestRun" option value is expected to be a test controller.',
    [RuntimeErrors.invalidValueType.name]:                                               '{smthg} is expected to be a {type}, but it was {actual}.',
    [RuntimeErrors.unsupportedUrlProtocol.name]:                                         'The specified "{url}" test page URL uses an unsupported {protocol}:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.',
    [RuntimeErrors.testControllerProxyCantResolveTestRun.name]:                          `Cannot implicitly resolve the test run in the context of which the test controller action should be executed. Use test function's 't' argument instead.`,
    [RuntimeErrors.timeLimitedPromiseTimeoutExpired.name]:                               'Timeout expired for a time limited promise',
    [RuntimeErrors.cantUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified.name]: 'Unable to set the screenshot path pattern when screenshots are disabled. Specify the base path where screenshots are stored to enable them.',
    [RuntimeErrors.cannotSetVideoOptionsWithoutBaseVideoPathSpecified.name]:             'Unable to set video or encoding options when video recording is disabled. Specify the base path where video files are stored to enable recording.',
    [RuntimeErrors.multipleAPIMethodCallForbidden.name]:                                 'You cannot call the "{methodName}" method more than once. Pass an array of parameters to this method instead.',
    [RuntimeErrors.invalidReporterOutput.name]:                                          "Specify a file name or a writable stream as the reporter's output target.",
    [RuntimeErrors.cannotReadSSLCertFile.name]:                                          'Unable to read the "{path}" file, specified by the "{option}" ssl option. Error details:\n' +
                                                                                         '\n' +
                                                                                         '{err}',

    [RuntimeErrors.cannotPrepareTestsDueToError.name]: 'Cannot prepare tests due to an error.\n' +
                                  '\n' +
                                  '{errMessage}',

    [RuntimeErrors.cannotParseRawFile.name]: 'Cannot parse a test source file in the raw format at "{path}" due to an error.\n' +
                        '\n' +
                        '{errMessage}',

    [RuntimeErrors.testedAppFailedWithError.name]: 'Tested app failed with an error:\n' +
                              '\n' +
                              '{errMessage}',

    [RuntimeErrors.unableToOpenBrowser.name]: 'Was unable to open the browser "{alias}" due to error.\n' +
                         '\n' +
                         '{errMessage}',

    [RuntimeErrors.requestHookConfigureAPIError.name]: 'There was an error while configuring the request hook:\n' +
                                  '\n' +
                                  '{requestHookName}: {errMsg}',

    [RuntimeErrors.forbiddenCharatersInScreenshotPath.name]: 'There are forbidden characters in the "{screenshotPath}" {screenshotPathType}:\n' +
                                        ' {forbiddenCharsDescription}',

    [RuntimeErrors.cannotFindFFMPEG.name]: 'Unable to locate the FFmpeg executable required to record videos. Do one of the following:\n' +
                      '\n' +
                      '* add the FFmpeg installation directory to the PATH environment variable,\n' +
                      '* specify the path to the FFmpeg executable in the FFMPEG_PATH environment variable or the ffmpegPath video option,\n' +
                      '* install the @ffmpeg-installer/ffmpeg package from npm.',
};
