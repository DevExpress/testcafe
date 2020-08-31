import { URL, pathToFileURL } from 'url';
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

export function isRelative (url: string): boolean {
    return RELATIVE_PATH_RE.test(url);
}

function isAbsolute (url: string): boolean {
    // NOTE: path.isAbsolute treats the '//example.com' path as absolute
    return OS.win ? WIN_ABSOLUTE_PATH_RE.test(url) : ABSOLUTE_PATH_RE.test(url);
}

export function resolveRelativeUrl (path: string, base: URL): string {
    const url = new URL(path, base);

    return url.toString();
}

function ensureProtocol (url: string): string {
    if (SUPPORTED_PROTOCOL_RE.test(url) || url === SPECIAL_BLANK_PAGE)
        return url;

    const protocol = IMPLICIT_PROTOCOL_RE.test(url) ? 'http:' : 'http://';

    return protocol + url;
}

export function getUrl (url: string, base?: URL): string {
    if (isRelative(url)) {
        if (!base)
            throw new Error('Relative urls require a base path');

        return resolveRelativeUrl(url, base);
    }

    else if (isAbsolute(url))
        return pathToFileURL(url).toString();

    return ensureProtocol(url);
}

export function assertPageUrl (url: string, callsiteName: string): void {
    const protocol               = url.match(PROTOCOL_RE);
    const hasUnsupportedProtocol = protocol && !SUPPORTED_PROTOCOL_RE.test(url);
    const isWinAbsolutePath      = OS.win && WIN_ABSOLUTE_PATH_RE.test(url);

    if (hasUnsupportedProtocol && !isWinAbsolutePath && url !== SPECIAL_BLANK_PAGE)
        throw new APIError(callsiteName, RUNTIME_ERRORS.unsupportedUrlProtocol, url, protocol && protocol[0]);
}

export function assertRoleUrl (url: string, callsiteName: string): void {
    if (isRelative(url))
        throw new APIError(callsiteName, RUNTIME_ERRORS.roleInitializedWithRelativeUrl);
}
