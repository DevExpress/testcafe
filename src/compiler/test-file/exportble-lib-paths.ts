import { join } from 'path';
import { pathToFileURL } from 'url';

const EXPORTABLE_LIB_PATH     = join(__dirname, '../../api/exportable-lib/index.js');
const EXPORTABLE_LIB_ESM_PATH = pathToFileURL(join(__dirname, '../../api/exportable-lib/index.mjs')).href;

export {
    EXPORTABLE_LIB_PATH,
    EXPORTABLE_LIB_ESM_PATH,
};
