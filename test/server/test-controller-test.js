const proxyquire        = require('proxyquire');
const expect            = require('chai').expect;
const TestController    = require('../../lib/api/test-controller');
const AssertionExecutor = require('../../lib/assertions/executor');

const SessionControllerStub = { getSession: () => {
    return { id: 'session-id' };
} };

const TestRun = proxyquire('../../lib/test-run/index', { './session-controller': SessionControllerStub });

const errorMessage = 'some error in click command';

class TestRunMock extends TestRun {
    _addInjectables () {}

    _initRequestHooks () {}

    constructor (reason) {
        super({
            test:               {},
            browserConnection:  {},
            screenshotCapturer: {},
            globalWarningLog:   {},
            opts:               {}
        });

        this.errors = [];
        this.reason = reason;
    }

    addError (err) {
        this.errors.push(err);
    }

    executeAction (actionName, command) {
        return this.executeCommand(command);
    }

    executeCommand (command, callsite) {
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
