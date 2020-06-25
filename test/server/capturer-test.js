const nanoid                     = require('nanoid');
const { expect }                 = require('chai');
const { resolve, dirname, join } = require('path');
const { statSync }               = require('fs');
const Capturer                   = require('../../lib/screenshots/capturer');
const TestRunController          = require('../../lib/runner/test-run-controller');
const Screenshots                = require('../../lib/screenshots');


const filePath = resolve(process.cwd(), `temp${nanoid(7)}`, 'temp.png');

class CapturerMock extends Capturer {
    constructor (provider) {
        super(null, void 0, {
            id: 'browserId', provider
        });
    }
}

class ScreenshotsMock extends Screenshots {
    constructor (options) {
        super(options);
    }

    createCapturerFor (test, testIndex, quarantine, connection, warningLog) {
        this.capturer = super.createCapturerFor(test, testIndex, quarantine, connection, warningLog);

        this.capturer.pathPattern = {
            data: {
                parsedUserAgent: {
                    prettyUserAgent: 'user-agent'
                },
                quarantineAttempt: 1
            }
        };

        return this.capturer;
    }
}

const emptyProvider = {
    takeScreenshot: () => {
    }
};

describe('Capturer', () => {
    it('Taking screenshots does not create a directory if provider does not', async () => {
        let errCode = null;

        const capturer = new CapturerMock(emptyProvider);

        await capturer._takeScreenshot({ filePath });

        try {
            statSync(dirname(filePath));
        }
        catch (err) {
            errCode = err.code;
        }

        expect(errCode).eql('ENOENT');
    });

    it('Screenshot properties for reporter', async () => {
        const screenshots = new ScreenshotsMock({ enabled: true, path: process.cwd(), pathPattern: '', fullPage: false });

        const testRunControllerMock = {
            _screenshots: screenshots,
            test:         { fixture: {} },
            emit:         () => { },
            _testRunCtor: function (test, connection) {
                this.id                = 'test-run-id';
                this.browserConnection = connection;
            }
        };

        await TestRunController.prototype._createTestRun.call(testRunControllerMock, {
            id:          'browser-connection-id',
            provider:    emptyProvider,
            browserInfo: {
                parsedUserAgent: {
                    os: {
                        name: 'os-name'
                    }
                }
            }
        });

        await screenshots.capturer._capture(false, { customPath: 'screenshot.png' });

        expect(screenshots.capturer.testEntry.screenshots[0]).eql({
            testRunId:         'test-run-id',
            screenshotPath:    join(process.cwd(), 'screenshot.png'),
            thumbnailPath:     join(process.cwd(), 'thumbnails', 'screenshot.png'),
            userAgent:         'user-agent',
            quarantineAttempt: 1,
            takenOnFail:       false
        });
    });
});
