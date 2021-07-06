// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { RUNTIME_ERRORS } from '../types';
import BrowserConnectionErrorHint from '../../browser/connection/error-hints';

const DOCUMENTATION_LINKS = {
    TEST_SOURCE_PARAMETER: 'https://testcafe.io/documentation/402639/reference/command-line-interface#file-pathglob-pattern',
    FILTER_SETTINGS:       'https://testcafe.io/documentation/402638/reference/configuration-file#filter',
    HEADLESS_MODE:         'https://testcafe.io/documentation/402828/guides/concepts/browsers#test-in-headless-mode'
};

export default {
    [RUNTIME_ERRORS.cannotCreateMultipleLiveModeRunners]:  'Cannot launch multiple live mode instances of the TestCafe test runner.',
    [RUNTIME_ERRORS.cannotRunLiveModeRunnerMultipleTimes]: 'Cannot launch the same live mode instance of the TestCafe test runner multiple times.',
    [RUNTIME_ERRORS.browserDisconnected]:                  'The {userAgent} browser disconnected. If you did not close the browser yourself, browser performance or network issues may be at fault.',
    [RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers]: 'The following browsers disconnected: {userAgents}. Cannot run further tests.',
    [RUNTIME_ERRORS.testRunRequestInDisconnectedBrowser]:  '"{browser}" disconnected during test execution.',
    [RUNTIME_ERRORS.cannotEstablishBrowserConnection]:     'Cannot establish one or more browser connections.',
    [RUNTIME_ERRORS.cannotFindBrowser]:                    'Cannot find the browser. "{browser}" is neither a known browser alias, nor a path to an executable file.',
    [RUNTIME_ERRORS.browserProviderNotFound]:              'Cannot find the "{providerName}" browser provider.',
    [RUNTIME_ERRORS.browserNotSet]:                        'You have not specified a browser.',
    [RUNTIME_ERRORS.testFilesNotFound]:                    'Could not find test files at the following location: "{cwd}".\n' +
                                                           'Check patterns for errors:\n\n' +
                                                           '{sourceList}\n\n' +
                                                           'or launch TestCafe from a different directory.\n' +
                                                           `For more information on how to specify test locations, see ${DOCUMENTATION_LINKS.TEST_SOURCE_PARAMETER}.`,

    [RUNTIME_ERRORS.noTestsToRun]: "Source files do not contain valid 'fixture' and 'test' declarations.",

    [RUNTIME_ERRORS.noTestsToRunDueFiltering]: 'No tests match your filter.\n' +
                                               `See ${DOCUMENTATION_LINKS.FILTER_SETTINGS}.`,

    [RUNTIME_ERRORS.cannotFindReporterForAlias]:                         'The "{name}" reporter does not exist. Check the reporter parameter for errors.',
    [RUNTIME_ERRORS.multipleSameStreamReporters]:                        'Reporters cannot share output streams. The following reporters interfere with one another: "{reporters}".',
    [RUNTIME_ERRORS.optionValueIsNotValidRegExp]:                        'The "{optionName}" option does not contain a valid regular expression.',
    [RUNTIME_ERRORS.optionValueIsNotValidKeyValue]:                      'The "{optionName}" option does not contain a valid key-value pair.',
    [RUNTIME_ERRORS.invalidQuarantineOption]:                            'The "{optionName}" option does not exist. Specify "attemptLimit" and "successThreshold" to configure quarantine mode.',
    [RUNTIME_ERRORS.invalidQuarantineParametersRatio]:                   'The value of "attemptLimit" ({attemptLimit}) should be greater then the value of "successThreshold" ({successThreshold}).',
    [RUNTIME_ERRORS.invalidAttemptLimitValue]:                           'The "{attemptLimit}" parameter only accepts values of {MIN_ATTEMPT_LIMIT} and up.',
    [RUNTIME_ERRORS.invalidSuccessThresholdValue]:                       'The "{successThreshold}" parameter only accepts values of {MIN_SUCCESS_THRESHOLD} and up.',
    [RUNTIME_ERRORS.invalidSpeedValue]:                                  'Speed should be a number between 0.01 and 1.',
    [RUNTIME_ERRORS.invalidConcurrencyFactor]:                           'The concurrency factor should be an integer greater than or equal to 1.',
    [RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency]:              'The number of remote browsers should be divisible by the concurrency factor.',
    [RUNTIME_ERRORS.cannotSetConcurrencyWithCDPPort]:                    'The value of the "concurrency" option includes the CDP port.',
    [RUNTIME_ERRORS.portsOptionRequiresTwoNumbers]:                      'The "--ports" argument accepts two values at a time.',
    [RUNTIME_ERRORS.portIsNotFree]:                                      'Port {portNum} is occupied by another process.',
    [RUNTIME_ERRORS.invalidHostname]:                                    'Cannot resolve hostname "{hostname}".',
    [RUNTIME_ERRORS.cannotFindSpecifiedTestSource]:                      'Cannot find a test file at "{path}".',
    [RUNTIME_ERRORS.clientFunctionCodeIsNotAFunction]:                   'Cannot initialize a ClientFunction because {#instantiationCallsiteName} is {type}, and not a function.',
    [RUNTIME_ERRORS.selectorInitializedWithWrongType]:                   'Cannot initialize a Selector because {#instantiationCallsiteName} is {type}, and not one of the following: a CSS selector string, a Selector object, a node snapshot, a function, or a Promise returned by a Selector.',
    [RUNTIME_ERRORS.clientFunctionCannotResolveTestRun]:                 "{#instantiationCallsiteName} cannot implicitly resolve the test run in context of which it should be executed. If you need to call {#instantiationCallsiteName} from the Node.js API callback, pass the test controller manually via {#instantiationCallsiteName}'s `.with({ boundTestRun: t })` method first. Note that you cannot execute {#instantiationCallsiteName} outside the test code.",
    [RUNTIME_ERRORS.regeneratorInClientFunctionCode]:                    `{#instantiationCallsiteName} code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).`,
    [RUNTIME_ERRORS.invalidClientFunctionTestRunBinding]:                'Cannot resolve the "boundTestRun" option because its value is not a test controller.',
    [RUNTIME_ERRORS.invalidValueType]:                                   '{smthg} ({actual}) is not of expected type ({type}).',
    [RUNTIME_ERRORS.unsupportedUrlProtocol]:                             'The "{url}" test page URL includes an unsupported {protocol}:// protocol. TestCafe only supports http://, https:// and file:// protocols.',
    [RUNTIME_ERRORS.testControllerProxyCannotResolveTestRun]:            `Cannot implicitly resolve the test run in the context of which the test controller action should be executed. Use test function's 't' argument instead.`,
    [RUNTIME_ERRORS.timeLimitedPromiseTimeoutExpired]:                   'A Promise timed out.',
    [RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified]: 'You cannot manage advanced video parameters when the video recording capability is off. Specify the root storage folder for video content to enable video recording.',
    [RUNTIME_ERRORS.multipleAPIMethodCallForbidden]:                     'You cannot call the "{methodName}" method more than once. Specify an array of parameters instead.',
    [RUNTIME_ERRORS.invalidReporterOutput]:                              "Specify a file name or a writable stream as the reporter's output target.",
    [RUNTIME_ERRORS.cannotReadSSLCertFile]:                              'Unable to read the file referenced by the "{option}" ssl option ("{path}"). Error details:\n' +
                                                                         '\n' +
                                                                         '{err}',

    [RUNTIME_ERRORS.cannotPrepareTestsDueToError]: 'Cannot prepare tests due to the following error:\n' +
                                                   '\n' +
                                                   '{errMessage}',

    [RUNTIME_ERRORS.cannotParseRawFile]: 'Cannot parse a raw test file at "{path}" due to the following error:\n' +
                                         '\n' +
                                         '{errMessage}',

    [RUNTIME_ERRORS.testedAppFailedWithError]: 'The web application failed with the following error:\n' +
                                               '\n' +
                                               '{errMessage}',

    [RUNTIME_ERRORS.unableToOpenBrowser]: 'Unable to open the "{alias}" browser due to the following error:\n' +
                                          '\n' +
                                          '{errMessage}',

    [RUNTIME_ERRORS.requestHookConfigureAPIError]: 'Attempt to configure a request hook resulted in the following error:\n' +
                                                   '\n' +
                                                   '{requestHookName}: {errMsg}',

    [RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath]: 'There are forbidden characters in the "{screenshotPath}" {screenshotPathType}:\n' +
                                                         ' {forbiddenCharsDescription}',

    [RUNTIME_ERRORS.cannotFindFFMPEG]: 'TestCafe cannot record videos because it cannot locate the FFmpeg executable. Try one of the following solutions:\n' +
                                       '\n' +
                                       '* add the path of the FFmpeg installation directory to the PATH environment variable,\n' +
                                       '* specify the path of the FFmpeg executable in the FFMPEG_PATH environment variable or the ffmpegPath option,\n' +
                                       '* install the @ffmpeg-installer/ffmpeg npm package.',

    [RUNTIME_ERRORS.cannotFindTypescriptConfigurationFile]:            '"{filePath}" is not a valid TypeScript configuration file.',
    [RUNTIME_ERRORS.clientScriptInitializerIsNotSpecified]:            'Initialize your client script with one of the following: a JavaScript script, a JavaScript file path, or the name of a JavaScript module.',
    [RUNTIME_ERRORS.clientScriptBasePathIsNotSpecified]:               'Specify the base path for the client script file.',
    [RUNTIME_ERRORS.clientScriptInitializerMultipleContentSources]:    'Client scripts can only have one initializer: JavaScript code, a JavaScript file path, or the name of a JavaScript module.',
    [RUNTIME_ERRORS.cannotLoadClientScriptFromPath]:                   'Cannot load a client script from {path}.',
    [RUNTIME_ERRORS.clientScriptModuleEntryPointPathCalculationError]: 'A client script tried to load a JavaScript module that TestCafe cannot locate:\n\n{errorMessage}.',
    [RUNTIME_ERRORS.methodIsNotAvailableForAnIPCHost]:                 'This method cannot be called on a service host.',
    [RUNTIME_ERRORS.tooLargeIPCPayload]:                               'The specified payload is too large to form an IPC packet.',
    [RUNTIME_ERRORS.malformedIPCMessage]:                              'Cannot process a malformed IPC message.',
    [RUNTIME_ERRORS.unexpectedIPCHeadPacket]:                          'Cannot create an IPC message due to an unexpected IPC head packet.',
    [RUNTIME_ERRORS.unexpectedIPCBodyPacket]:                          'Cannot create an IPC message due to an unexpected IPC body packet.',
    [RUNTIME_ERRORS.unexpectedIPCTailPacket]:                          'Cannot create an IPC message due to an unexpected IPC tail packet.',
    [RUNTIME_ERRORS.cannotRunLocalNonHeadlessBrowserWithoutDisplay]:
        'Your Linux version does not have a graphic subsystem to run {browserAlias} with a GUI. ' +
        'You can launch the browser in headless mode. ' +
        'If you use a portable browser executable, ' +
        "specify the browser alias before the path instead of the 'path' prefix. " +
        `For more information, see ${DOCUMENTATION_LINKS.HEADLESS_MODE}`,

    [RUNTIME_ERRORS.uncaughtErrorInReporter]:           'The "{methodName}" method of the "{reporterName}" reporter produced an uncaught error. Error details:\n{originalError}',
    [RUNTIME_ERRORS.roleInitializedWithRelativeUrl]:    'You cannot specify relative login page URLs in the Role constructor. Use an absolute URL.',
    [RUNTIME_ERRORS.typeScriptCompilerLoadingError]:    'Cannot load the TypeScript compiler.\n{originErrorMessage}.',
    [RUNTIME_ERRORS.cannotCustomizeSpecifiedCompilers]: 'You cannot specify options for the {noncustomizableCompilerList} compiler{suffix}.',

    [RUNTIME_ERRORS.cannotEnableRetryTestPagesOption]:
        'Cannot enable the \'retryTestPages\' option. Apply one of the following two solutions:\n' +
        '-- set \'localhost\' as the value of the \'hostname\' option\n' +
        '-- run TestCafe over HTTPS\n',

    [RUNTIME_ERRORS.browserConnectionError]:               '{originErrorMessage}\n{numOfNotOpenedConnection} of {numOfAllConnections} browser connections have not been established:\n{listOfNotOpenedConnections}\n\nHints:\n{listOfHints}',
    [BrowserConnectionErrorHint.TooHighConcurrencyFactor]: 'The host machine may not be powerful enough to handle the specified concurrency factor ({concurrencyFactor}). ' +
                                                           'Try to decrease the concurrency factor or allocate more computing resources to the host machine.',
    [BrowserConnectionErrorHint.UseBrowserInitOption]: 'Increase the value of the "browserInitTimeout" option if it is too low (currently: {browserInitTimeoutMsg}). This option determines how long TestCafe waits for browsers to be ready.',
    [BrowserConnectionErrorHint.RestErrorCauses]:      'The error can also be caused by network issues or remote device failure. Make sure that your network connection is stable and you can reach the remote device.'
};
