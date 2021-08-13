const { expect }        = require('chai');
const TestController    = require('../../lib/api/test-controller');
const AssertionExecutor = require('../../lib/assertions/executor');
const BaseTestRunMock   = require('./helpers/base-test-run-mock');

const errorMessage = 'some error in click command';

class TestRunMock extends BaseTestRunMock {
    constructor (reason) {
        super();

        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }

    _executeActionCommand (command) {
        return this._executeInternalCommand(command);
    }

    _executeInternalCommand (command, callsite) {
        if (command.type === 'click')
            return Promise.reject(new Error(errorMessage));

        return new AssertionExecutor(command, 0, callsite).run();
    }
}

describe('TestController', () => {
    it('should reset executionChain if some command is rejected', () => {
        const mockTestRun  = new TestRunMock('');

        const testController = new TestController(mockTestRun);

        return testController.click('input', {})
            .catch(err => {
                expect(err.message).eql(errorMessage);

                return testController.expect(10).eql(10);
            });
    });
});
