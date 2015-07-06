export const MESSAGES = {
    browserDisconnected:            'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    unableToRunBrowser:             'Unable to run the browser. The file at {path} does not exist or is not executable.',
    cantEstablishBrowserConnection: 'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    cantFindBrowserForAlias:        'Cannot find a corresponding browser for the following alias: {alias}.',
    reporterNotSet:                 'No reporter has been set for the test runner. Use the runner.reporter() function to specify reporting parameters.',
    browserNotSet:                  'No browser selected to test against. Use the runner.browsers() method to specify the target browser.',
    unknownReporter:                'The provided {name} reporter does not exist. Check that you have specified the report format correctly.'
};

export function getText (template, ...args) {
    return args.reduce((msg, arg) => msg.replace(/{.+?}/, arg), template);
}

