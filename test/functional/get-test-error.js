function isBrowserRelevant (test, browserAlias) {
    var matchesOnly = test.match(/\[ONLY\:([,\s\w]*)\]/);
    var matchesSkip = test.match(/\[SKIP\:([,\s\w]*)\]/);

    var only = true;
    var skip = false;

    if (matchesOnly !== null)
        only = matchesOnly[1].indexOf(browserAlias) > -1;

    if (matchesSkip !== null)
        skip = matchesSkip[1].indexOf(browserAlias) > -1;

    return only && !skip;
}

function filterErrors (errors, userAgents) {
    return errors.filter(function (error) {
        return userAgents.indexOf(error.split('\n')[0]) > -1;
    });
}

module.exports = function getTestError (testReport, browsersInfo) {
    var testError = '';

    var actualUserAgents = browsersInfo
        .filter(function (browserInfo) {
            return isBrowserRelevant(testReport.name, browserInfo.settings.alias);
        })
        .map(function (browserInfo) {
            return browserInfo.connection.userAgent;
        });

    var actualBrowsersCount = actualUserAgents.length;
    var actualErrors        = filterErrors(testReport.errs, actualUserAgents);
    var actualErrorsCount   = actualErrors.length;

    if (actualErrorsCount) {
        //NOTE: if the test failed in different browsers with the same error we join it to one error
        if (actualErrorsCount !== actualBrowsersCount)
            testError = actualErrors.join('\n');
        else {
            testError = actualErrors[0]
                .split('\n')
                .slice(1)
                .map(function (str) {
                    return str.trim();
                })
                .join(' ');
        }
    }

    return testError;
};
