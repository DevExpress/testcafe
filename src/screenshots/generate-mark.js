import generateId from 'nanoid/generate';
import { PNG } from 'pngjs';
import { chunk, flatten } from 'lodash';


const ALPHABET    = '1234567890abcdef';
const MARK_LENGTH = 5;

export default function () {
    // NOTE: 3 hex numbers in a pixel, 2 letters in  a hex number
    var id = generateId(ALPHABET, MARK_LENGTH * 3 * 2);

    // NOTE: array of RGB values
    var markSeed = chunk(id, 2).map(array => parseInt(array.join(''), 16));

    // NOTE: convert to RGBA
    markSeed = flatten(chunk(markSeed, 3).map(array => array.concat(255)));

    var markSeedBuffer = new Buffer(markSeed);
    var png = new PNG({ width: MARK_LENGTH, height: 1 });

    markSeedBuffer.copy(png.data);

    var markData = 'data:image/png;base64,' + PNG.sync.write(png).toString('base64');

    return { markSeed, markData };
}
