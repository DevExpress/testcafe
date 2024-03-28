const expect = require('chai').expect;

const {
    MARK_LENGTH,
    MARK_BYTES_PER_PIXEL,
    MARK_RIGHT_MARGIN,
} = require('../../lib/screenshots/constants');

const {
    getClipInfoByCropDimensions,
    calculateMarkPosition,
    getClipInfoByMarkPosition,
    calculateClipInfo,
} = require('../../lib/screenshots/crop');

const markSeed = Array(MARK_LENGTH).fill().flatMap((_, i) => i % 2 ? [255, 255, 255, 255] : [0, 0, 0, 255]);

function getPngMock (mark = markSeed) {
    const width          = 1820;
    const height         = 954;
    const length         = width * height * MARK_BYTES_PER_PIXEL;
    const markSeedOffset = (MARK_LENGTH + MARK_RIGHT_MARGIN) * MARK_BYTES_PER_PIXEL;
    const markSeedIndex  = length - markSeedOffset;

    const dataHeader  = Buffer.from('-'.repeat(markSeedIndex));
    const dataMark    = Buffer.from(mark);
    const dataTrailer = Buffer.from('-'.repeat(MARK_RIGHT_MARGIN * MARK_BYTES_PER_PIXEL));

    const data = Buffer.concat([dataHeader, dataMark, dataTrailer]);

    return { width, height, data };
}

describe('Crop images', () => {
    it('Update clipInfo by crop dimensions', () => {
        const clip = {
            clipRight:  400,
            clipLeft:   10,
            clipBottom: 500,
            clipTop:    10,
        };

        // left top
        expect(getClipInfoByCropDimensions(clip, { left: 0, right: 380, top: 0, bottom: 480 })).eql({
            clipLeft:   10,
            clipRight:  390,
            clipTop:    10,
            clipBottom: 490,
        });

        // right top
        expect(getClipInfoByCropDimensions(clip, { left: 20, right: 420, top: 0, bottom: 480 })).eql({
            clipLeft:   30,
            clipRight:  400,
            clipTop:    10,
            clipBottom: 490,
        });

        // right bottom
        expect(getClipInfoByCropDimensions(clip, { left: 20, right: 420, top: 20, bottom: 520 })).eql({
            clipLeft:   30,
            clipRight:  400,
            clipTop:    30,
            clipBottom: 500,
        });

        // left bottom
        expect(getClipInfoByCropDimensions(clip, { left: 0, right: 380, top: 20, bottom: 520 })).eql({
            clipLeft:   10,
            clipRight:  390,
            clipTop:    30,
            clipBottom: 500,
        });

        // middle
        expect(getClipInfoByCropDimensions(clip, { left: 20, right: 360, top: 20, bottom: 460 })).eql({
            clipLeft:   30,
            clipRight:  370,
            clipTop:    30,
            clipBottom: 470,
        });
    });

    it('Calculate mark position', () => {
        expect(calculateMarkPosition(getPngMock(), markSeed)).eql({
            x: 1820,
            y: 954,
        });

        expect(calculateMarkPosition(getPngMock(), '+')).eql(null);
    });

    it('Mark seed correction', () => {
        const fixableMarkSeed = markSeed.slice();
        const spoiledMarkSeed = markSeed.slice();

        fixableMarkSeed.splice(0, 1, 1);
        spoiledMarkSeed.splice(0, 1, 10);

        expect(calculateMarkPosition(getPngMock(fixableMarkSeed), markSeed)).eql({ x: 1820, y: 954 });
        expect(calculateMarkPosition(getPngMock(spoiledMarkSeed), markSeed)).eql(null);
        expect(calculateMarkPosition(getPngMock(), '+')).eql(null);
    });

    it('Get clipInfo by mark position', () => {
        const markPosition = calculateMarkPosition(getPngMock(), markSeed);

        expect(getClipInfoByMarkPosition(markPosition, { width: 1820, height: 954 })).eql({
            clipLeft:   0,
            clipRight:  1820,
            clipTop:    0,
            clipBottom: 954,
        });

        expect(getClipInfoByMarkPosition(markPosition, { width: 1620, height: 854 })).eql({
            clipLeft:   200,
            clipRight:  1820,
            clipTop:    100,
            clipBottom: 954,
        });
    });

    it('Calculate clipInfo', () => {
        const clientAreaDimensions = {
            width:  1820,
            height: 954,
        };

        const cropDimensions = {
            left:   20,
            right:  1800,
            top:    20,
            bottom: 850,
        };

        const pngImage     = getPngMock();
        const markPosition = calculateMarkPosition(pngImage, markSeed);

        expect(calculateClipInfo(pngImage, markPosition, clientAreaDimensions)).eql({
            clipLeft:   0,
            clipTop:    0,
            clipRight:  1820,
            clipBottom: 953,
        });

        expect(calculateClipInfo(pngImage, markPosition, clientAreaDimensions, cropDimensions)).eql({
            clipLeft:   20,
            clipTop:    20,
            clipRight:  1800,
            clipBottom: 850,
        });
    });
});
