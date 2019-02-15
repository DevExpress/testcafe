const Promise = require('pinkie');
const TestRun = require('../../lib/test-run/index');
const delay   = require('../../lib/utils/delay');

describe('Request handling', () => {
    it('Should abort request if it\'s longer than 3s', () => {
        const testRun = new TestRun({ fixture: { path: '' }, requestHooks: {} }, {}, null, null, {});

        const handleRequestPromise = testRun.ready({ status: { id: 1, consoleMessages: [] } });

        const timeoutPromise = delay(3500).then(() => {
            throw new Error('timeout is exceeded');
        });

        return Promise.race([handleRequestPromise, timeoutPromise]);
    });
});
