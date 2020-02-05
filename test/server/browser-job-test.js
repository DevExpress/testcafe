const expect     = require('chai').expect;
const BrowserJob = require('../../lib/runner/browser-job');

describe('Browser Job', function () {
    it('TestRunController events', function () {
        const tests             = [1];
        const job               = new BrowserJob(tests, [], null, null, null, null, { TestRunCtor: function () { } });
        const testRunController = job.testRunControllerQueue[0];

        expect(testRunController.listenerCount()).eql(8);
        expect(testRunController.listenerCount('test-run-create')).eql(1);
        expect(testRunController.listenerCount('test-run-start')).eql(1);
        expect(testRunController.listenerCount('test-run-ready')).eql(1);
        expect(testRunController.listenerCount('test-run-restart')).eql(1);
        expect(testRunController.listenerCount('test-run-before-done')).eql(1);
        expect(testRunController.listenerCount('test-run-done')).eql(1);
        expect(testRunController.listenerCount('test-action-start')).eql(1);
        expect(testRunController.listenerCount('test-action-done')).eql(1);
    });
});
