import generateId from 'nanoid/generate';
import { PNG } from 'pngjs';
import { map, flatten, times, constant } from 'lodash';
import { MARK_LENGTH, MARK_HEIGHT, MARK_BYTES_PER_PIXEL } from './constants';


const ALPHABET = '01';

export default function () {
    // NOTE: 32-bit id
    var id = generateId(ALPHABET, MARK_LENGTH);

    // NOTE: array of RGB values
    var markSeed = flatten(map(id, bit => bit === '0' ? [0, 0, 0, 255] : [255, 255, 255, 255]));

    // NOTE: macOS browsers can't display an element, if it's CSS height is lesser than 1.
    // It happens on Retina displays, because they have more than 1 physical pixel in a CSS pixel.
    // So increase mark size by prepending transparent pixels before the actual mark.
    var imageData       = times(MARK_BYTES_PER_PIXEL * MARK_LENGTH * (MARK_HEIGHT - 1), constant(0)).concat(markSeed);
    var imageDataBuffer = new Buffer(imageData);
    var pngImage        = new PNG({ width: MARK_LENGTH, height: MARK_HEIGHT });

    imageDataBuffer.copy(pngImage.data);

    var markData = 'data:image/png;base64,' + PNG.sync.write(pngImage).toString('base64');

    return { markSeed, markData };
}
