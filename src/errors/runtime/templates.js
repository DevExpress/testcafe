// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { RUNTIME_ERRORS } from '../types';

export default {
    [RUNTIME_ERRORS.cannotCreateMultipleLiveModeRunners.name]:                            'Cannot create multiple live mode runners.',
    [RUNTIME_ERRORS.cannotRunLiveModeRunnerMultipleTimes.name]:                           'Cannot run a live mode runner multiple times.',
    [RUNTIME_ERRORS.browserDisconnected.name]:                                            'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    [RUNTIME_ERRORS.cantRunAgainstDisconnectedBrowsers.name]:                             'The following browsers disconnected: {userAgents}. Tests will not be run.',
    [RUNTIME_ERRORS.cantEstablishBrowserConnection.name]:                                 'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    [RUNTIME_ERRORS.cantFindBrowser.name]:                                                'Unable to find the browser. "{browser}" is not a browser alias or path to an executable file.',
    [RUNTIME_ERRORS.browserProviderNotFound.name]:                                        'The specified "{providerName}" browser provider was not found.',
    [RUNTIME_ERRORS.browserNotSet.name]:                                                  'No browser selected to test against.',
    [RUNTIME_ERRORS.testSourcesNotSet.name]:                                              'No test file specified.',
    [RUNTIME_ERRORS.noTestsToRun.name]:                                                   'No tests to run. Either the test files contain no tests or the filter function is too restrictive.',
    [RUNTIME_ERRORS.cantFindReporterForAlias.name]:                                       'The provided "{name}" reporter does not exist. Check that you have specified the report format correctly.',
    [RUNTIME_ERRORS.multipleStdoutReporters.name]:                                        'Multiple reporters attempting to write to stdout: "{reporters}". Only one reporter can write to stdout.',
    [RUNTIME_ERRORS.optionValueIsNotValidRegExp.name]:                                    'The "{optionName}" option value is not a valid regular expression.',
    [RUNTIME_ERRORS.optionValueIsNotValidKeyValue.name]:                                  'The "{optionName}" option value is not a valid key-value pair.',
    [RUNTIME_ERRORS.invalidSpeedValue.name]:                                              'Speed should be a number between 0.01 and 1.',
    [RUNTIME_ERRORS.invalidConcurrencyFactor.name]:                                       'The concurrency factor should be an integer greater or equal to 1.',
    [RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency.name]:                          'The number of remote browsers should be divisible by the factor of concurrency.',
    [RUNTIME_ERRORS.portsOptionRequiresTwoNumbers.name]:                                  'The "--ports" option requires two numbers to be specified.',
    [RUNTIME_ERRORS.portIsNotFree.name]:                                                  'The specified {portNum} port is already in use by another program.',
    [RUNTIME_ERRORS.invalidHostname.name]:                                                'The specified "{hostname}" hostname cannot be resolved to the current machine.',
    [RUNTIME_ERRORS.cantFindSpecifiedTestSource.name]:                                    'Cannot find a test source file at "{path}".',
    [RUNTIME_ERRORS.clientFunctionCodeIsNotAFunction.name]:                               '{#instantiationCallsiteName} code is expected to be specified as a function, but {type} was passed.',
    [RUNTIME_ERRORS.selectorInitializedWithWrongType.name]:                               '{#instantiationCallsiteName} is expected to be initialized with a function, CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but {type} was passed.',
    [RUNTIME_ERRORS.clientFunctionCantResolveTestRun.name]:                               "{#instantiationCallsiteName} cannot implicitly resolve the test run in context of which it should be executed. If you need to call {#instantiationCallsiteName} from the Node.js API callback, pass the test controller manually via {#instantiationCallsiteName}'s `.with({ boundTestRun: t })` method first. Note that you cannot execute {#instantiationCallsiteName} outside the test code.",
    [RUNTIME_ERRORS.regeneratorInClientFunctionCode.name]:                                `{#instantiationCallsiteName} code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).`,
    [RUNTIME_ERRORS.invalidClientFunctionTestRunBinding.name]:                            'The "boundTestRun" option value is expected to be a test controller.',
    [RUNTIME_ERRORS.invalidValueType.name]:                                               '{smthg} is expected to be a {type}, but it was {actual}.',
    [RUNTIME_ERRORS.unsupportedUrlProtocol.name]:                                         'The specified "{url}" test page URL uses an unsupported {protocol}:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.',
    [RUNTIME_ERRORS.testControllerProxyCantResolveTestRun.name]:                          `Cannot implicitly resolve the test run in the context of which the test controller action should be executed. Use test function's 't' argument instead.`,
    [RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired.name]:                               'Timeout expired for a time limited promise',
    [RUNTIME_ERRORS.cantUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified.name]: 'Unable to set the screenshot path pattern when screenshots are disabled. Specify the base path where screenshots are stored to enable them.',
    [RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified.name]:             'Unable to set video or encoding options when video recording is disabled. Specify the base path where video files are stored to enable recording.',
    [RUNTIME_ERRORS.multipleAPIMethodCallForbidden.name]:                                 'You cannot call the "{methodName}" method more than once. Pass an array of parameters to this method instead.',
    [RUNTIME_ERRORS.invalidReporterOutput.name]:                                          "Specify a file name or a writable stream as the reporter's output target.",
    [RUNTIME_ERRORS.cannotReadSSLCertFile.name]:                                          'Unable to read the "{path}" file, specified by the "{option}" ssl option. Error details:\n' +
                                                                                          '\n' +
                                                                                          '{err}',

    [RUNTIME_ERRORS.cannotPrepareTestsDueToError.name]: 'Cannot prepare tests due to an error.\n' +
                                                        '\n' +
                                                        '{errMessage}',

    [RUNTIME_ERRORS.cannotParseRawFile.name]: 'Cannot parse a test source file in the raw format at "{path}" due to an error.\n' +
                                              '\n' +
                                              '{errMessage}',

    [RUNTIME_ERRORS.testedAppFailedWithError.name]: 'Tested app failed with an error:\n' +
                                                    '\n' +
                                                    '{errMessage}',

    [RUNTIME_ERRORS.unableToOpenBrowser.name]: 'Was unable to open the browser "{alias}" due to error.\n' +
                                               '\n' +
                                               '{errMessage}',

    [RUNTIME_ERRORS.requestHookConfigureAPIError.name]: 'There was an error while configuring the request hook:\n' +
                                                        '\n' +
                                                        '{requestHookName}: {errMsg}',

    [RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath.name]: 'There are forbidden characters in the "{screenshotPath}" {screenshotPathType}:\n' +
                                                              ' {forbiddenCharsDescription}',

    [RUNTIME_ERRORS.cannotFindFFMPEG.name]: 'Unable to locate the FFmpeg executable required to record videos. Do one of the following:\n' +
                                            '\n' +
                                            '* add the FFmpeg installation directory to the PATH environment variable,\n' +
                                            '* specify the path to the FFmpeg executable in the FFMPEG_PATH environment variable or the ffmpegPath video option,\n' +
                                            '* install the @ffmpeg-installer/ffmpeg package from npm.',
};
