const expect              = require('chai').expect;
const TestRun             = require('../../lib/test-run');
const TestController      = require('../../lib/api/test-controller');
const { TEST_RUN_ERRORS } = require('../../lib/errors/types');

class TestRunMock extends TestRun {
    constructor ({ activeWindowId = 'id', disableMultipleWindows = false, isLegacy = false } = {}) {
        super({
            test:               { id: 'test-id', name: 'test-name', isLegacy: isLegacy, fixture: { path: 'dummy', id: 'fixture-id', name: 'fixture-name' } },
            browserConnection:  { activeWindowId: activeWindowId },
            screenshotCapturer: {},
            globalWarningLog:   {},
            opts:               { disableMultipleWindows: disableMultipleWindows }
        });
    }

    _addInjectables () {
    }

    _initRequestHooks () {
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

    it('`allowMultipleWindows` is passed to session', async () => {
        expect(new TestRunMock().session.options.allowMultipleWindows).eql(true);
        expect(new TestRunMock({ disableMultipleWindows: true }).session.options.allowMultipleWindows).eql(false);
        expect(new TestRunMock({ activeWindowId: null }).session.options.allowMultipleWindows).eql(false);
    });
});
