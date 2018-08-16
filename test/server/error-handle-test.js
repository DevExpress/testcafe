const Promise        = require('pinkie');
const expect         = require('chai').expect;
const createTestCafe = require('../../lib/');
const types          = require('../../lib/errors/test-run/type');
const handleErrors   = require('../../lib/utils/handle-errors');


class TestRunMock {
    constructor (id, reason) {
        this.id     = id;
        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }
}

describe('Global error handlers', () => {
    it('format UnhandledPromiseRejection reason', () => {
        handleErrors.registerErrorHandlers();
        handleErrors.startHandlingTestErrors();

        const reasons        = [new Error('test'), null, void 0, 1, 'string message', true, { a: 1 }];
        const testRunMocks   = reasons.map((reason, index) => new TestRunMock(index, reason));
        const expectedErrors = ['Error: test', '[object Null]', 'undefined', '1', 'string message', 'true', '[object Object]'];

        testRunMocks.forEach(testRun => {
            handleErrors.addRunningTest(testRun);

            process.emit('unhandledRejection', testRun.reason);
        });

        const actualErrors = testRunMocks.map(testRun => testRun.errors[0].errMsg);

        actualErrors[0] = actualErrors[0].substr(0, expectedErrors[0].length);

        expect(actualErrors).eql(expectedErrors);
    });

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
                handleErrors.startHandlingTestErrors();

                /* eslint-disable no-new */
                new Promise((resolve, reject) => {
                    reject(new Error());
                });
                /* eslint-enable no-new */

                return testCafe.close();
            })
            .then(() => {
                expect(unhandledRejectionRaised).eql(true);
                expect(testRunMock.errors[0].type).eql(types.unhandledPromiseRejection);
            });
    });
});
