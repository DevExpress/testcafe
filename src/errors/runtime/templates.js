// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { RUNTIME_ERRORS } from '../types';

const DOCUMENTATION_LINKS = {
    TEST_SOURCE_PARAMETER: 'https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#file-pathglob-pattern',
    FILTER_SETTINGS:       'https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html#filter'
};

export default {
    [RUNTIME_ERRORS.cannotCreateMultipleLiveModeRunners]:  'Cannot create multiple live mode runners.',
    [RUNTIME_ERRORS.cannotRunLiveModeRunnerMultipleTimes]: 'Cannot run a live mode runner multiple times.',
    [RUNTIME_ERRORS.browserDisconnected]:                  'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    [RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers]: 'The following browsers disconnected: {userAgents}. Tests will not be run.',
    [RUNTIME_ERRORS.cannotEstablishBrowserConnection]:     'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    [RUNTIME_ERRORS.cannotFindBrowser]:                    'Unable to find the browser. "{browser}" is not a browser alias or path to an executable file.',
    [RUNTIME_ERRORS.browserProviderNotFound]:              'The specified "{providerName}" browser provider was not found.',
    [RUNTIME_ERRORS.browserNotSet]:                        'No browser selected to test against.',

    [RUNTIME_ERRORS.testFilesNotFound]: 'TestCafe could not find the test files that match the following patterns:\n' +
                                        '{sourceList}\n\n' +
                                        'The "{cwd}" current working directory was used as the base path.\n' +
                                        'Ensure the file patterns are correct or change the current working directory.\n' +
                                        `For more information on how to specify test files, see ${DOCUMENTATION_LINKS.TEST_SOURCE_PARAMETER}.`,

    [RUNTIME_ERRORS.noTestsToRun]: 'No tests found in the specified source files.\n' +
                                   "Ensure the sources contain the 'fixture' and 'test' directives.",

    [RUNTIME_ERRORS.noTestsToRunDueFiltering]: 'The specified filter settings exclude all tests.\n' +
                                               'Modify these settings to leave at least one available test.\n' +
                                               `For more information on how to specify filter settings, see ${DOCUMENTATION_LINKS.FILTER_SETTINGS}.`,

    [RUNTIME_ERRORS.cannotFindReporterForAlias]:                         'The provided "{name}" reporter does not exist. Check that you have specified the report format correctly.',
    [RUNTIME_ERRORS.multipleSameStreamReporters]:                        'The following reporters attempted to write to the same output stream: "{reporters}". Only one reporter can write to a stream.',
    [RUNTIME_ERRORS.optionValueIsNotValidRegExp]:                        'The "{optionName}" option value is not a valid regular expression.',
    [RUNTIME_ERRORS.optionValueIsNotValidKeyValue]:                      'The "{optionName}" option value is not a valid key-value pair.',
    [RUNTIME_ERRORS.invalidSpeedValue]:                                  'Speed should be a number between 0.01 and 1.',
    [RUNTIME_ERRORS.invalidConcurrencyFactor]:                           'The concurrency factor should be an integer greater or equal to 1.',
    [RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency]:              'The number of remote browsers should be divisible by the factor of concurrency.',
    [RUNTIME_ERRORS.portsOptionRequiresTwoNumbers]:                      'The "--ports" option requires two numbers to be specified.',
    [RUNTIME_ERRORS.portIsNotFree]:                                      'The specified {portNum} port is already in use by another program.',
    [RUNTIME_ERRORS.invalidHostname]:                                    'The specified "{hostname}" hostname cannot be resolved to the current machine.',
    [RUNTIME_ERRORS.cannotFindSpecifiedTestSource]:                      'Cannot find a test source file at "{path}".',
    [RUNTIME_ERRORS.clientFunctionCodeIsNotAFunction]:                   '{#instantiationCallsiteName} code is expected to be specified as a function, but {type} was passed.',
    [RUNTIME_ERRORS.selectorInitializedWithWrongType]:                   '{#instantiationCallsiteName} is expected to be initialized with a function, CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but {type} was passed.',
    [RUNTIME_ERRORS.clientFunctionCannotResolveTestRun]:                 "{#instantiationCallsiteName} cannot implicitly resolve the test run in context of which it should be executed. If you need to call {#instantiationCallsiteName} from the Node.js API callback, pass the test controller manually via {#instantiationCallsiteName}'s `.with({ boundTestRun: t })` method first. Note that you cannot execute {#instantiationCallsiteName} outside the test code.",
    [RUNTIME_ERRORS.regeneratorInClientFunctionCode]:                    `{#instantiationCallsiteName} code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).`,
    [RUNTIME_ERRORS.invalidClientFunctionTestRunBinding]:                'The "boundTestRun" option value is expected to be a test controller.',
    [RUNTIME_ERRORS.invalidValueType]:                                   '{smthg} is expected to be a {type}, but it was {actual}.',
    [RUNTIME_ERRORS.unsupportedUrlProtocol]:                             'The specified "{url}" test page URL uses an unsupported {protocol}:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.',
    [RUNTIME_ERRORS.testControllerProxyCannotResolveTestRun]:            `Cannot implicitly resolve the test run in the context of which the test controller action should be executed. Use test function's 't' argument instead.`,
    [RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired]:                   'Timeout expired for a time limited promise',
    [RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified]: 'Unable to set video or encoding options when video recording is disabled. Specify the base path where video files are stored to enable recording.',
    [RUNTIME_ERRORS.multipleAPIMethodCallForbidden]:                     'You cannot call the "{methodName}" method more than once. Pass an array of parameters to this method instead.',
    [RUNTIME_ERRORS.invalidReporterOutput]:                              "Specify a file name or a writable stream as the reporter's output target.",
    [RUNTIME_ERRORS.cannotReadSSLCertFile]:                              'Unable to read the "{path}" file, specified by the "{option}" ssl option. Error details:\n' +
                                                                         '\n' +
                                                                         '{err}',

    [RUNTIME_ERRORS.cannotPrepareTestsDueToError]: 'Cannot prepare tests due to an error.\n' +
                                                   '\n' +
                                                   '{errMessage}',

    [RUNTIME_ERRORS.cannotParseRawFile]: 'Cannot parse a test source file in the raw format at "{path}" due to an error.\n' +
                                         '\n' +
                                         '{errMessage}',

    [RUNTIME_ERRORS.testedAppFailedWithError]: 'Tested app failed with an error:\n' +
                                               '\n' +
                                               '{errMessage}',

    [RUNTIME_ERRORS.unableToOpenBrowser]: 'Was unable to open the browser "{alias}" due to error.\n' +
                                          '\n' +
                                          '{errMessage}',

    [RUNTIME_ERRORS.requestHookConfigureAPIError]: 'There was an error while configuring the request hook:\n' +
                                                   '\n' +
                                                   '{requestHookName}: {errMsg}',

    [RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath]: 'There are forbidden characters in the "{screenshotPath}" {screenshotPathType}:\n' +
                                                         ' {forbiddenCharsDescription}',

    [RUNTIME_ERRORS.cannotFindFFMPEG]: 'Unable to locate the FFmpeg executable required to record videos. Do one of the following:\n' +
                                       '\n' +
                                       '* add the FFmpeg installation directory to the PATH environment variable,\n' +
                                       '* specify the path to the FFmpeg executable in the FFMPEG_PATH environment variable or the ffmpegPath video option,\n' +
                                       '* install the @ffmpeg-installer/ffmpeg package from npm.',

    [RUNTIME_ERRORS.cannotFindTypescriptConfigurationFile]:              'Unable to find the TypeScript configuration file in "{filePath}"',
    [RUNTIME_ERRORS.clientScriptInitializerIsNotSpecified]:              'Specify the JavaScript file path, module name or script content to inject a client script.',
    [RUNTIME_ERRORS.clientScriptBasePathIsNotSpecified]:                 'Specify the base path for the client script file.',
    [RUNTIME_ERRORS.clientScriptInitializerMultipleContentSources]:      'You cannot combine the file path, module name and script content when you specify a client script to inject.',
    [RUNTIME_ERRORS.cannotLoadClientScriptFromPath]:                     'Cannot load a client script from {path}.',
    [RUNTIME_ERRORS.clientScriptModuleEntryPointPathCalculationError]:   'An error occurred when trying to locate the injected client script module:\n\n{errorMessage}.',
    [RUNTIME_ERRORS.methodIsNotAvailableForAnIPCHost]:                   'This method cannot be called on a service host.',
    [RUNTIME_ERRORS.tooLargeIPCPayload]:                                 'The specified payload is too large to form an IPC packet.',
    [RUNTIME_ERRORS.malformedIPCMessage]:                                'Cannot process a malformed IPC message.',
    [RUNTIME_ERRORS.unexpectedIPCHeadPacket]:                            'Cannot create an IPC message due to an unexpected IPC head packet.',
    [RUNTIME_ERRORS.unexpectedIPCBodyPacket]:                            'Cannot create an IPC message due to an unexpected IPC body packet.',
    [RUNTIME_ERRORS.unexpectedIPCTailPacket]:                            'Cannot create an IPC message due to an unexpected IPC tail packet.',
    [RUNTIME_ERRORS.cannotUseAllowMultipleWindowsOptionForLegacyTests]:  'You cannot run Legacy API tests in multi-window mode.',
    [RUNTIME_ERRORS.cannotUseAllowMultipleWindowsOptionForSomeBrowsers]: 'You cannot use multi-window mode in {browsers}.'
};
