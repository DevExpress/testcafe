const proxyquire = require('proxyquire');
const expect     = require('chai').expect;
const fill       = require('lodash/fill');
const Compiler   = require('../../lib/compiler');

const SessionControllerStub = { getSession: () => {
    return { id: 'sessionId' };
} };

const TestRun = proxyquire('../../lib/test-run/index', { './session-controller': SessionControllerStub });

class TestRunMock extends TestRun {
    _addInjectables () {}

    _initRequestHooks () {}

    get id () {
        return 'id';
    }

    constructor () {
        super({
            test:               {},
            browserConnection:  {},
            screenshotCapturer: {},
            globalWarningLog:   {},
            opts:               {}
        });
    }
}

describe('Test run tracker', function () {
    this.timeout(20000);

    function runTest (testName) {
        const src         = 'test/server/data/test-run-tracking/' + testName;
        const compiler    = new Compiler([src]);
        const testRunMock = new TestRunMock();
        const expected    = fill(Array(3), testRunMock.id);

        return compiler.getTests()
            .then(function (tests) {
                const test = tests[0];

                return Promise.all([
                    test.fixture.beforeEachFn ? test.fixture.beforeEachFn(testRunMock) : testRunMock.id,
                    test.fn(testRunMock),
                    test.fixture.afterEachFn ? test.fixture.afterEachFn(testRunMock) : testRunMock.id
                ]);
            })
            .then(function (res) {
                expect(res).eql(expected);
            });
    }

    it('Should find test run ID in test function call', function () {
        return runTest('in-test-function.js');
    });

    it('Should find test run ID in test function after `await`', function () {
        return runTest('in-test-function-after-await.js');
    });

    it('Should find test run ID in test function after `await` with error', function () {
        return runTest('in-function-after-await-with-error.js');
    });

    it('Should find test run ID in helper', function () {
        return runTest('in-helper.js');
    });

    it('Should find test run ID in helper after `await`', function () {
        return runTest('in-helper-after-await.js');
    });

    it('Should find test run ID in `setInterval`', function () {
        return runTest('in-set-interval.js');
    });

    it('Should find test run ID in `setTimeout`', function () {
        return runTest('in-set-timeout.js');
    });

    it('Should find test run ID in `setImmediate`', function () {
        return runTest('in-set-immediate.js');
    });

    it('Should find test run ID in `nextTick`', function () {
        return runTest('in-next-tick.js');
    });

    it('Should find test run ID in `Promise.then()`', function () {
        return runTest('in-promise-then.js');
    });

    it('Should find test run ID in `Promise.catch()`', function () {
        return runTest('in-promise-catch.js');
    });

    it('Should find test run ID in `Promise.then()` second handler', function () {
        return runTest('in-promise-then-second-handler.js');
    });

    it('Should find test run ID in `Promise.resolve()`', function () {
        return runTest('in-promise-resolve.js');
    });

    it('Should find test run ID in Promise ctor', function () {
        return runTest('in-promise-ctor.js');
    });
});
