import fs from 'fs';
import promisify from '../../utils/promisify';

var readFile = promisify(fs.readFile);

export default async function (file) {
    var data = await readFile(file);

    //NOTE: removing byte order mark (BOM)
    return data.toString().replace(/^\uFEFF/, '');
};
