const { expect }          = require('chai');
const TestController      = require('../../lib/api/test-controller');
const { TEST_RUN_ERRORS } = require('../../lib/errors/types');
const BaseTestRunMock     = require('./helpers/base-test-run-mock');

class TestRunMock extends BaseTestRunMock {
    constructor ({ activeWindowId = 'id', disableMultipleWindows = false, isLegacy = false } = {}) {
        super({
            test:              { id: 'test-id', name: 'test-name', isLegacy: isLegacy, fixture: { path: 'dummy', id: 'fixture-id', name: 'fixture-name' } },
            browserConnection: { activeWindowId: activeWindowId },
            opts:              { disableMultipleWindows: disableMultipleWindows },
        });
    }
}

describe('Multiple windows', () => {
    it('Disabled', async () => {
        const testRun        = new TestRunMock();
        const testController = new TestController(testRun);

        testRun.disableMultipleWindows = true;

        try {
            await testController.openWindow('http://example.com');
        }
        catch (err) {
            expect(err.code).eql(TEST_RUN_ERRORS.multipleWindowsModeIsDisabledError);
        }
    });

    it('Not allowed in Remote', async () => {
        const testRun        = new TestRunMock();
        const testController = new TestController(testRun);

        testRun.browserConnection.activeWindowId = null;

        try {
            await testController.openWindow('http://example.com');
        }
        catch (err) {
            expect(err.code).eql(TEST_RUN_ERRORS.multipleWindowsModeIsNotSupportedInRemoteBrowserError);
        }
    });
});
