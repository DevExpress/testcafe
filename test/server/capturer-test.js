const nanoid               = require('nanoid');
const expect               = require('chai').expect;
const { resolve, dirname } = require('path');
const { statSync }         = require('fs');
const Capturer             = require('../../lib/screenshots/capturer');


const filePath = resolve(process.cwd(), `temp${nanoid(7)}`, 'temp.png');

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
});
