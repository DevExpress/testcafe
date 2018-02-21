import generateId from 'nanoid/generate';
import { PNG } from 'pngjs';
import { map, flatten } from 'lodash';
import { MARK_LENGTH } from './constants';


const ALPHABET    = '01';

export default function () {
    // NOTE: 32-bit id
    var id = generateId(ALPHABET, MARK_LENGTH);

    // NOTE: array of RGB values
    var markSeed = flatten(map(id, bit => bit === '0' ? [0, 0, 0, 255] : [255, 255, 255, 255]));

    var markSeedBuffer = new Buffer(markSeed);
    var pngImage       = new PNG({ width: MARK_LENGTH, height: 1 });

    markSeedBuffer.copy(pngImage.data);

    var markData = 'data:image/png;base64,' + PNG.sync.write(pngImage).toString('base64');

    return { markSeed, markData };
}
