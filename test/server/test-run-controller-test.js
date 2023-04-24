const { expect }        = require('chai');
const { noop }          = require('lodash');
const TestRunController = require('../../lib/runner/test-run-controller');

describe('TestRunController', () => {
    it('Should raise an error on start in nativeAutomation mode with browser without its support', async () => {
        const testMock = {
            isNativeAutomation: true,
        };

        const browserConnectionMock = {
            supportNativeAutomation: () => false,

            browserInfo: {
                providerName: 'testBrowser',
            },
        };

        const messageBusMock = {
            emit: noop,
        };

        const testRunController = new TestRunController({
            test:       testMock,
            messageBus: messageBusMock,
            opts:       {
                nativeAutomation: true,
            },
        });

        try {
            await testRunController.start(browserConnectionMock);
        }
        catch (err) {
            expect(err.message).to.equal('The "testBrowser" do not support the Native Automation mode. Remove the "native automation" option to continue.');
        }
    });
});
