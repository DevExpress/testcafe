const Promise             = require('pinkie');
const expect              = require('chai').expect;
const createTestCafe      = require('../../lib/');
const { TEST_RUN_ERRORS } = require('../../lib/errors/types');
const handleErrors        = require('../../lib/utils/handle-errors');
const TestController      = require('../../lib/api/test-controller');
const AssertionExecutor   = require('../../lib/assertions/executor');

class TestRunMock {
    constructor (id, reason) {
        this.id     = id;
        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }

    executeCommand (command, callsite) {
        return new AssertionExecutor(command, 0, callsite).run();
    }

}

describe('Global error handlers', () => {
    it('unhandled promise rejection on chain assertions', () => {
        let unhandledRejection = false;

        const throwErrorOnUnhandledRejection = () => {
            unhandledRejection = true;
        };

        process.once('unhandledRejection', throwErrorOnUnhandledRejection);

        return Promise.resolve()
            .then(() => {
                return new TestController(new TestRunMock('', '')).expect(10).eql(5).expect(10).eql(10);
            })
            .catch(() => {
                process.removeListener('unhandledRejection', throwErrorOnUnhandledRejection);

                expect(unhandledRejection).eql(false);
            });
    });

    it('format UnhandledPromiseRejection reason', () => {
        handleErrors.registerErrorHandlers();
        handleErrors.startHandlingTestErrors();

        const obj = { a: 1, b: { c: 'd', e: { f: { g: 'too deep' } } } };

        obj.circular = obj;

        const reasons = [
            new Error('test'),
            null,
            void 0,
            1,
            'string message',
            true,
            obj,
            _ => _,
            [1, 2],
            /regex/
        ];

        const testRunMocks = reasons.map((reason, index) => new TestRunMock(index, reason));

        const expectedErrors = [
            'Error: test',
            'null',
            'undefined',
            '1',
            'string message',
            'true',
            '{ a: 1, b: { c: \'d\', e: { f: [Object] } }, circular: [Circular] }',
            '[Function]',
            '[ 1, 2 ]',
            '/regex/'
        ];

        testRunMocks.forEach(testRun => {
            handleErrors.addRunningTest(testRun);

            process.emit('unhandledRejection', testRun.reason);
        });

        const actualErrors = testRunMocks.map(testRun => testRun.errors[0].errMsg);

        actualErrors[0] = actualErrors[0].substr(0, expectedErrors[0].length);

        expect(actualErrors).eql(expectedErrors);
    });

    it('Should add error to testRun on UnhandledPromiseRejection', () => {
        const testRunMock = new TestRunMock(1);

        let testCafe                 = null;
        let unhandledRejectionRaised = false;

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
                expect(testRunMock.errors[0].code).eql(TEST_RUN_ERRORS.unhandledPromiseRejection);
            });
    });
});
