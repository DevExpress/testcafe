var expect = require('chai').expect;


exports.errorInEachBrowserContains = function errorInEachBrowserContains (testErrors, message, errorIndex) {
    // NOTE: if errors are the same in different browsers
    if (Array.isArray(testErrors))
        expect(testErrors[errorIndex]).contains(message);

    //NOTE: if the are different
    else {
        Object.keys(testErrors).forEach(function (key) {
            expect(testErrors[key][errorIndex]).contains(message);
        });
    }
};
