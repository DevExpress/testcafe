const { expect } = require('chai');
const { noop }   = require('lodash');
const BrowserJob = require('../../lib/runner/browser-job');

describe('Browser Job', function () {
    it('TestRunController events', function () {
        const tests = [1];

        const job = new BrowserJob({
            tests,
            browserConnections:    [],
            proxy:                 null,
            screenshots:           null,
            warningLog:            null,
            fixtureHookController: null,
            opts:                  { TestRunCtor: noop },
        });

        const testRunController = job._testRunControllerQueue[0];

        expect(testRunController.listenerCount()).eql(6);
        expect(testRunController.listenerCount('test-run-create')).eql(1);
        expect(testRunController.listenerCount('test-run-ready')).eql(1);
        expect(testRunController.listenerCount('test-run-restart')).eql(1);
        expect(testRunController.listenerCount('test-run-before-done')).eql(1);
        expect(testRunController.listenerCount('test-run-done')).eql(1);
        expect(testRunController.listenerCount('test-action-done')).eql(1);
    });
});
