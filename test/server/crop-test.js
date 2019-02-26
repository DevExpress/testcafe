const expect = require('chai').expect;

const { updateClipInfoByCropDimensions, updateClipInfoByMarkSeed, calculateClipInfo } = require('../../lib/screenshots/crop');

function getPngMock () {
    const markSeedIndex = 6944952;
    const width         = 1820;
    const height        = 954;

    let data = '-'.repeat(markSeedIndex);

    data = Buffer.from(data + '*' + data);

    return { width, height, data };
}

describe('Crop images', () => {
    it('Update clipInfo by crop dimensions', () => {
        const clip = {
            clipRight:  400,
            clipLeft:   10,
            clipBottom: 500,
            clipTop:    10
        };

        // left top
        expect(updateClipInfoByCropDimensions(clip, { left: 0, right: 380, top: 0, bottom: 480 })).eql({
            clipLeft:   10,
            clipRight:  390,
            clipTop:    10,
            clipBottom: 490
        });

        // right top
        expect(updateClipInfoByCropDimensions(clip, { left: 20, right: 420, top: 0, bottom: 480 })).eql({
            clipLeft:   30,
            clipRight:  400,
            clipTop:    10,
            clipBottom: 490
        });

        // right bottom
        expect(updateClipInfoByCropDimensions(clip, { left: 20, right: 420, top: 20, bottom: 520 })).eql({
            clipLeft:   30,
            clipRight:  400,
            clipTop:    30,
            clipBottom: 500
        });

        // left bottom
        expect(updateClipInfoByCropDimensions(clip, { left: 0, right: 380, top: 20, bottom: 520 })).eql({
            clipLeft:   10,
            clipRight:  390,
            clipTop:    30,
            clipBottom: 500
        });

        // middle
        expect(updateClipInfoByCropDimensions(clip, { left: 20, right: 360, top: 20, bottom: 460 })).eql({
            clipLeft:   30,
            clipRight:  370,
            clipTop:    30,
            clipBottom: 470
        });
    });

    it('Update clipInfo by markSeed', () => {
        const markSeedIndex = 6944952;

        let data = '-'.repeat(markSeedIndex);

        data = data + '*' + data;

        expect(updateClipInfoByMarkSeed({ width: 1820, data: Buffer.from(data) }, 'path', '*', { width: 1820, height: 954 })).eql({
            clipLeft:   0,
            clipRight:  1820,
            clipTop:    0,
            clipBottom: 954
        });

        expect(updateClipInfoByMarkSeed({ width: 1820, data: Buffer.from(data) }, 'path', '*', { width: 1620, height: 854 })).eql({
            clipLeft:   200,
            clipRight:  1820,
            clipTop:    100,
            clipBottom: 954
        });

        let err = null;

        try {
            updateClipInfoByMarkSeed({ width: 1820, data: Buffer.from('+') }, 'path', '*', { width: 1620, height: 854 });
        }
        catch (e) {
            err = e;
        }
        finally {
            expect(err.message).is.not.null;
            expect(err.message).contains(
                'Unable to locate the page area in the browser window screenshot at path, ' +
                'because the page area mark with ID 2147483648 ' +
                'is not found in the screenshot.');
        }
    });

    it('Calculate clipInfo', () => {
        const clientAreaDimensions = {
            width:  1820,
            height: 954
        };

        const cropDimensions = {
            left:   20,
            right:  1800,
            top:    20,
            bottom: 850
        };

        expect(calculateClipInfo(getPngMock(), 'path', '*', clientAreaDimensions)).eql({
            clipLeft:   0,
            clipTop:    0,
            clipRight:  1820,
            clipBottom: 953
        });

        expect(calculateClipInfo(getPngMock(), 'path', '*', clientAreaDimensions, cropDimensions)).eql({
            clipLeft:   20,
            clipTop:    20,
            clipRight:  1800,
            clipBottom: 850
        });
    });
});
