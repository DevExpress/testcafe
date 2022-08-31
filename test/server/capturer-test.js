const { noop }                   = require('lodash');
const { nanoid }                 = require('nanoid');
const { expect }                 = require('chai');
const { resolve, dirname, join } = require('path');
const { statSync }               = require('fs');
const Capturer                   = require('../../lib/screenshots/capturer');
const TestRunController          = require('../../lib/runner/test-run-controller');
const Screenshots                = require('../../lib/screenshots');
const {
    writePng,
    deleteFile,
    readPng,
}               = require('../../lib/utils/promisified-functions');
const WarningLog                 = require('../../lib/notifications/warning-log');


const filePath = resolve(process.cwd(), `temp${nanoid(7)}`, 'temp.png');

class CapturerMock extends Capturer {
    constructor (provider) {
        super(null, void 0, {
            id: 'browserId', provider,
        });
    }
}

class ScreenshotsMock extends Screenshots {
    constructor (options) {
        super(options);
    }

    _assignEventHandlers () {}

    createCapturerFor (test, testIndex, quarantine, connection, warningLog) {
        this.capturer = super.createCapturerFor(test, testIndex, quarantine, connection, warningLog);

        this.capturer.pathPattern = {
            data: {
                parsedUserAgent: {
                    prettyUserAgent: 'user-agent',
                },
                quarantineAttempt: 1,
            },
        };

        return this.capturer;
    }
}

const emptyProvider = {
    takeScreenshot: () => {
    },
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
        const screenshots = new ScreenshotsMock({
            enabled:     true,
            path:        process.cwd(),
            pathPattern: '',
            fullPage:    false,
        });

        const testRunControllerMock = {
            _screenshots: screenshots,
            test:         { fixture: {} },
            emit:         noop,
            _testRunCtor: function ({ browserConnection }) {
                this.id                = 'test-run-id';
                this.browserConnection = browserConnection;
                this.initialize        = noop;
            },
        };

        await TestRunController.prototype._createTestRun.call(testRunControllerMock, {
            id:          'browser-connection-id',
            provider:    emptyProvider,
            browserInfo: {
                parsedUserAgent: {
                    os: {
                        name: 'os-name',
                    },
                },
            },
        });

        await screenshots.capturer._capture(false, {
            actionId:   'action-id',
            customPath: 'screenshot.png',
        });

        expect(screenshots.capturer.testEntry.screenshots[0]).eql({
            testRunId:         'test-run-id',
            actionId:          'action-id',
            screenshotPath:    join(process.cwd(), 'screenshot.png'),
            screenshotData:    void 0,
            thumbnailPath:     join(process.cwd(), 'thumbnails', 'screenshot.png'),
            userAgent:         'user-agent',
            quarantineAttempt: 1,
            takenOnFail:       false,
        });
    });

    it('Should not delete screenshot if unable to locate the page area', async () => {
        const warningLog = new WarningLog();
        const customPath = `${nanoid(7)}screenshot.png`;

        const screenshots = new ScreenshotsMock({
            enabled:     true,
            path:        process.cwd(),
            pathPattern: '',
            fullPage:    false,
        });

        const providerMock = {
            takeScreenshot: async (_, path) => {
                const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==', 'base64');
                const png   = await readPng(image);

                await writePng(path, png);
            },
        };

        const testRunControllerMock = {
            _screenshots: screenshots,
            test:         { fixture: {} },
            emit:         noop,
            _warningLog:  warningLog,
            _testRunCtor: function ({ browserConnection }) {
                this.id                = 'test-run-id';
                this.browserConnection = browserConnection;
                this.initialize        = noop;
            },
        };

        await screenshots._onMessageBusStart();

        await TestRunController.prototype._createTestRun.call(testRunControllerMock, {
            id:          'browser-connection-id',
            provider:    providerMock,
            browserInfo: {
                parsedUserAgent: {
                    os: {
                        name: 'os-name',
                    },
                },
            },
        });

        await screenshots.capturer._capture(false, {
            actionId: 'action-id',
            markSeed: Buffer.from([255, 255, 255, 255]),
            customPath,
        });

        expect(warningLog.messages[0]).contain('Unable to locate the page area in the browser window screenshot at');

        await deleteFile(customPath);
    });
});
