const delay           = require('../../lib/utils/delay');
const BaseTestRunMock = require('./helpers/base-test-run-mock');

describe('Request handling', () => {
    it("Should abort request if it's longer than 3s", function () {
        this.timeout(4000);

        const testRun              = new BaseTestRunMock();
        const handleRequestPromise = testRun.ready({ status: { id: 1, consoleMessages: [] } });

        const timeoutPromise = delay(3500).then(() => {
            throw new Error('timeout is exceeded');
        });

        return Promise.race([handleRequestPromise, timeoutPromise]);
    });
});
