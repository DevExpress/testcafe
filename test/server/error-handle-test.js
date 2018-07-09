var Promise        = require('pinkie');
var expect         = require('chai').expect;
var createTestCafe = require('../../lib/');
var types          = require('../../lib/errors/test-run/type');
var handleErrors   = require('../../lib/utils/handle-errors');


class TestRunMock {
    constructor (id) {
        this.id     = id;
        this.errors = [];
    }

    addError (err) {
        this.errors.push(err);
    }
}

describe('Global error handlers', () => {
    it('Should add error to testRun on UnhandledPromiseRejection', () => {
        var testCafe                 = null;
        var unhandledRejectionRaised = false;
        var testRunMock              = new TestRunMock(1);

        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testCafe = tc;
            })
            .then(() => {
                process.on('unhandledRejection', function () {
                    unhandledRejectionRaised = true;
                });

                handleErrors.addRunningTest(testRunMock);
                handleErrors.startHandlingTests();

                new Promise((resolve, reject) => {
                    reject(new Error());
                });

                return testCafe.close();
            })
            .then(() => {
                expect(unhandledRejectionRaised).eql(true);
                expect(testRunMock.errors[0].type).eql(types.unhandledPromiseRejection);
            });
    });
});
