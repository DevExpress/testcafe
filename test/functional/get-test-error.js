function areErrorsSame (errors) {
    for (let i = 0; i < errors.length; i++) {
        for (let j = i + 1; j < errors.length; j++) {
            if (errors[i] !== errors[j])
                return false;
        }
    }

    return true;
}

function normalizeError (err, userAgents) {
    return err
        .split('\n')
        .map(function (str) {
            str = str.trim();

            return str.replace(/^Browser:.+$/, '[[user-agent]]');
        })
        .filter(function (str, idx) {
            // NOTE: remove user agent from legacy API errors
            return !(idx === 0 && userAgents.indexOf(str) >= 0);
        })
        .join(' ');
}

// NOTE: This method should return either a dictionary or array object with errors depending on the number of browsers
// and errors. The possible variants:
// If tests run in one browser, the method returns an array with errors regardless of the number of errors.
// If tests run in several browsers and the same error occurs in all of them, the method returns an array as well.
// If different errors occur in several browsers, a dictionary object is returned. In this case, browser aliases are
// keys, and values are arrays of errors.
module.exports = function getTestError (taskReport, browsers) {
    let errs = [];

    taskReport.fixtures.forEach(function (fixture) {
        fixture.tests.forEach(function (test) {
            errs = errs.concat(test.errs);
        });
    });

    if (!errs.length)
        return null;

    const userAgents = browsers.map(function (browserInfo) {
        return browserInfo.connection.userAgent;
    });

    const normalizedErrors = errs.map(function (err) {
        return normalizeError(err, userAgents);
    });

    if (areErrorsSame(normalizedErrors) && normalizedErrors.length === browsers.length)
        return [normalizedErrors[0]];

    if (browsers.length > 1) {
        const testError = {};

        browsers.forEach(function (browserInfo) {
            const errorsArray = errs
                .filter(function (error) {
                    return error.indexOf(browserInfo.connection.userAgent) > -1;
                })
                .map(function (err) {
                    return normalizeError(err, userAgents);
                });

            if (errorsArray.length)
                testError[browserInfo.settings.alias] = errorsArray;
            else
                testError[browserInfo.settings.alias] = null;
        });

        return testError;
    }

    return normalizedErrors;
};
