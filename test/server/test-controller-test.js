const expect            = require('chai').expect;
const TestController    = require('../../lib/api/test-controller');
const AssertionExecutor = require('../../lib/assertions/executor');

class TestRunMock {
    constructor (id, reason) {
        this.id     = id;
        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }

    executeCommand () {
        return Promise.resolve();
    }

    executeApiMethod () {
        return Promise.resolve();
    }
}

describe('TestController', () => {
    it('should reset executionChain if some command is rejected', () => {
        const mockTestRun  = new TestRunMock('', '');
        const errorMessage = 'some error in click command';

        mockTestRun.executeCommand = (command, callsite) => {
            if (command.type === 'click')
                return Promise.reject(new Error(errorMessage));

            return new AssertionExecutor(command, 0, callsite).run();
        };

        const testController = new TestController(mockTestRun);

        return testController.click('input', {})
            .catch(err => {
                expect(err.message).eql(errorMessage);

                return testController.expect(10).eql(10);
            });
    });
});
