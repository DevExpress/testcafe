var expect = require('chai').expect;


exports.errorInEachBrowserContains = function errorInEachBrowserContains (testError, message, errorIndex) {
    Object.keys(testError).forEach(function (key) {
        expect(testError[key][errorIndex]).contains(message);
    });
};
