import { PNG } from 'pngjs';
import { map, flatten, times, constant } from 'lodash';
import generateId from 'nanoid/generate';
import { MARK_LENGTH, MARK_HEIGHT, MARK_BYTES_PER_PIXEL } from './constants';

const ALPHABET = '01';

export function generateScreenshotMark () {
    // NOTE: 32-bit id
    const id = generateId(ALPHABET, MARK_LENGTH);

    // NOTE: array of RGB values
    const markSeed = flatten(map(id, bit => bit === '0' ? [0, 0, 0, 255] : [255, 255, 255, 255]));

    // NOTE: macOS browsers can't display an element, if it's CSS height is lesser than 1.
    // It happens on Retina displays, because they have more than 1 physical pixel in a CSS pixel.
    // So increase mark size by prepending transparent pixels before the actual mark.
    const imageData       = times(MARK_BYTES_PER_PIXEL * MARK_LENGTH * (MARK_HEIGHT - 1), constant(0)).concat(markSeed);
    const imageDataBuffer = Buffer.from(imageData);
    const pngImage        = new PNG({ width: MARK_LENGTH, height: MARK_HEIGHT });

    imageDataBuffer.copy(pngImage.data);

    const markData = 'data:image/png;base64,' + PNG.sync.write(pngImage).toString('base64');

    return { markSeed, markData };
}

export function copyImagePart (pngImage, { clipLeft, clipTop, clipRight, clipBottom }) {
    const width  = clipRight - clipLeft;
    const height = clipBottom - clipTop;

    const dstImage = new PNG({ width, height });

    const stride = dstImage.width * MARK_BYTES_PER_PIXEL;

    for (let i = 0; i < height; i++) {
        const srcStartIndex = (pngImage.width * (i + clipTop) + clipLeft) * MARK_BYTES_PER_PIXEL;

        pngImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    return dstImage;
}
