var hammerhead = window.getTestCafeModule('hammerhead');
var Promise    = hammerhead.Promise;

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var tryUntilTimeout    = testCafeAutomation.get('./utils/try-until-timeout');

asyncTest("should resolve if the fn doesn't throw", function () {
    var callsCount = 0;

    function resolveFn () {
        callsCount++;

        return new Promise(function (resolve) {
            resolve();
        });
    }

    tryUntilTimeout(resolveFn, 50, 10)
        .then(function () {
            equal(callsCount, 1);
            start();
        });
});

asyncTest("should wait when the fn doesn't throw", function () {
    var callsCount = 0;

    function throwThanResolveFn () {
        callsCount++;

        return new Promise(function (resolve, reject) {
            if (callsCount < 3)
                reject('error');

            resolve();
        });
    }

    tryUntilTimeout(throwThanResolveFn, 50, 10)
        .then(function () {
            equal(callsCount, 3);
            start();
        });
});

asyncTest('should throw if the fn throws', function () {
    var expectedErr = 'error-1';

    function throwFn () {
        return new Promise(function (resolve, reject) {
            reject(expectedErr);
        });
    }

    tryUntilTimeout(throwFn, 30, 10)
        .catch(function (err) {
            equal(err, expectedErr);
            start();
        });
});
