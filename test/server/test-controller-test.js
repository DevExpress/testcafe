const expect            = require('chai').expect;
const TestRun           = require('../../lib/test-run');
const TestController    = require('../../lib/api/test-controller');
const AssertionExecutor = require('../../lib/assertions/executor');
const CommandBase       = require('../../lib/test-run/commands/base');

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

class DummyCmdCtor extends CommandBase {
    constructor (obj, testRun) {
        super({}, testRun, 'dummy');
    }

    _getAssignableProperties () {
        return [];
    }
}

class TestRunWithEventsMock extends TestRun {
    constructor (test, browserConnection, screenshotCapturer, globalWarningLog) {
        super({ fixture: { path: 'dummy' } }, browserConnection, screenshotCapturer, globalWarningLog, {});
    }

    _addInjectables () {
    }

    _initRequestHooks () {
    }

    executeCommand () {
        return Promise.resolve();
    }
}

class TestControllerMock extends TestController {
    constructor (testRun) {
        super(testRun);
    }

    _enqueueCommand (apiMethodName, CmdCtor, cmdArgs) {
        return super._enqueueCommand(apiMethodName, DummyCmdCtor, cmdArgs);
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

    it('API methods should emit start/done events', () => {
        const mockTestRun    = new TestRunWithEventsMock('', '');
        const testController = new TestControllerMock(mockTestRun);
        const startLog       = [];
        const doneLog        = [];

        mockTestRun.on('command-start', ({ apiMethodName }) => {
            startLog.push(apiMethodName);
        });

        mockTestRun.on('command-done', ({ apiMethodName }) => {
            doneLog.push(apiMethodName);
        });

        // eval and expect has their functional tests
        // addRequestHooks/removeRequestHooks are not logged
        const exceptions = ['eval', 'expect', 'addRequestHooks', 'removeRequestHooks'];

        const props = TestController.API_LIST
            .filter(prop => !prop.accessor)
            .map(prop => prop.apiProp)
            .filter(prop => exceptions.indexOf(prop) === -1)
            .filter(prop => typeof testController[prop] === 'function');

        return Promise.all(props.map(prop => testController[prop]()))
            .then(() => {
                expect(startLog.sort()).eql(props.sort());
                expect(doneLog.sort()).eql(props.sort());
            });
    });
});
