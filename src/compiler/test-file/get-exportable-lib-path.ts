import { join } from 'path';
import { pathToFileURL } from 'url';
import PREVENT_MODULE_CACHING_SUFFIX from '../prevent-module-caching-suffix';

const EXPORTABLE_LIB_PATH     = join(__dirname, '../../api/exportable-lib/index.js');
const EXPORTABLE_LIB_ESM_PATH = pathToFileURL(join(__dirname, '../../api/exportable-lib/index.mjs')).href;

export default function (esm?: boolean): string {
    //NOTE: Prevent module caching to import 'fixture' and 'test' in ESM mode.
    return esm ? `${EXPORTABLE_LIB_ESM_PATH}?${PREVENT_MODULE_CACHING_SUFFIX}=${Date.now()}` : EXPORTABLE_LIB_PATH;
}
