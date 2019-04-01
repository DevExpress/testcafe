import path from 'path';
import OS from 'os-family';
import { APIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';

const PROTOCOL_RE           = /^([\w-]+?)(?=:\/\/)/;
const SUPPORTED_PROTOCOL_RE = /^(https?|file):/;
const IMPLICIT_PROTOCOL_RE  = /^\/\//;
const ABSOLUTE_PATH_RE      = /^\/[^/]/;
const WIN_ABSOLUTE_PATH_RE  = /^\w:[/\\]/;
const RELATIVE_PATH_RE      = /^\.\.?[/\\]/;


function isAbsolutePath (url) {
    return OS.win ? WIN_ABSOLUTE_PATH_RE.test(url) : ABSOLUTE_PATH_RE.test(url);
}

function resolveFileUrl (url, testFileName) {
    const testFileDir = path.dirname(testFileName);

    if (RELATIVE_PATH_RE.test(url))
        url = path.join(testFileDir, url);

    return 'file://' + url;
}

export function assertUrl (url, callsiteName) {
    const protocol               = url.match(PROTOCOL_RE);
    const hasUnsupportedProtocol = protocol && !SUPPORTED_PROTOCOL_RE.test(url);
    const isWinAbsolutePath      = OS.win && WIN_ABSOLUTE_PATH_RE.test(url);

    if (hasUnsupportedProtocol && !isWinAbsolutePath && url !== SPECIAL_BLANK_PAGE)
        throw new APIError(callsiteName, RUNTIME_ERRORS.unsupportedUrlProtocol, url, protocol[0]);
}

export function resolvePageUrl (url, testFileName) {
    if (SUPPORTED_PROTOCOL_RE.test(url) || url === SPECIAL_BLANK_PAGE)
        return url;

    if (isAbsolutePath(url) || RELATIVE_PATH_RE.test(url))
        return resolveFileUrl(url, testFileName);

    const protocol = IMPLICIT_PROTOCOL_RE.test(url) ? 'http:' : 'http://';

    return protocol + url;
}
