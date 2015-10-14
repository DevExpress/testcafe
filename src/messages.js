export const MESSAGE = {
    browserDisconnected:                'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    cantRunAgainstDisconnectedBrowsers: 'The following browsers disconnected: {userAgents}. Tests will not be run.',
    cantEstablishBrowserConnection:     'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    cantFindBrowserForAlias:            'Cannot find a corresponding browser for the following alias: {alias}.',
    browserNotSet:                      'No browser selected to test against. Use the Runner.browsers() method to specify the target browser.',
    testSourcesNotSet:                  'No test file specified. Use the Runner.src() function to specify one or several test files to run.',
    noTestsToRun:                       'No tests to run. Either the test files contain no tests or the filter function is too restrictive.',
    cantFindReporterForAlias:           'The provided "{name}" reporter does not exist. Check that you have specified the report format correctly.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}

