function areErrorsSame (errors) {
    for (var i = 0; i < errors.length; i++) {
        for (var j = i + 1; j < errors.length; j++) {
            if (errors[i] !== errors[j])
                return false;
        }
    }

    return true;
}

function sanitizeError (err) {
    return err
        .split('\n')
        .slice(1)
        .map(function (str) {
            return str.trim();
        })
        .join(' ');
}

// NOTE: This method should return either a dictionary or array object with errors depending on the number of browsers
// and errors. The possible variants:
// If tests run in one browser, the method returns an array with errors regardless of the number of errors.
// If tests run in several browsers and the same error occurs in all of them, the method returns an array as well.
// If different errors occur in several browsers, a dictionary object is returned. In this case, browser aliases are
// keys, and values are arrays of errors.
module.exports = function getTestError (testReport, browsers) {
    if (!testReport.errs.length)
        return null;

    var croppedErrors = testReport.errs.map(sanitizeError);

    if (areErrorsSame(croppedErrors) && croppedErrors.length === browsers.length)
        return [croppedErrors[0]];

    if (browsers.length > 1) {
        var testError = {};

        browsers.forEach(function (browserInfo) {
            var errorsArray = testReport.errs
                .filter(function (error) {
                    return error.indexOf(browserInfo.connection.userAgent) > -1;
                })
                .map(sanitizeError);

            if (errorsArray.length)
                testError[browserInfo.settings.alias] = errorsArray;
        });

        return testError;
    }

    return croppedErrors;
};
