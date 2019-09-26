const expect                            = require('chai').expect;
const { resolve, dirname }              = require('path');
const { rmdirSync, statSync }           = require('fs');
const { writePng, readPng, deleteFile } = require('../../lib/utils/promisified-functions');
const Capturer                          = require('../../lib/screenshots/capturer');

const image          = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==', 'base64');
const screenshotPath = resolve(process.cwd(), 'temp-screenshots', 'temp.png');

class CapturerMock extends Capturer {
    constructor (provider) {
        super(null, void 0, {
            id: 'browserId', provider
        });
    }
}

const emptyProvider = {
    takeScreenshot: () => {
    }
};

const writingProvider = {
    takeScreenshot: async (browserId, filePath) => {
        const png = await readPng(image);

        await writePng(filePath, png);
    }
};

describe('Capturer', () => {
    it('Taking screenshots does not create a directory if provider does not', async () => {
        let errCode = null;

        const capturer = new CapturerMock(emptyProvider);

        await capturer._takeScreenshot(screenshotPath);

        try {
            statSync(dirname(screenshotPath));
        }
        catch (err) {
            errCode = err.code;
        }

        expect(errCode).eql('ENOENT');
    });

    it('Write png util created directory', async () => {
        const capturer = new CapturerMock(writingProvider);

        await capturer._takeScreenshot({ filePath: screenshotPath });

        statSync(dirname(screenshotPath));
        statSync(dirname(screenshotPath));

        await deleteFile(screenshotPath);

        rmdirSync(dirname(screenshotPath));
    });
});
