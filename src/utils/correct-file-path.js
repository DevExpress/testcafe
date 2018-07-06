import sanitizeFilename from 'sanitize-filename';
import { escapeRegExp as escapeRe } from 'lodash';

export default function (path, expectedExtention) {
    const correctedPath = path
        .replace(/\\/g, '/')
        .split('/')
        .map(str => sanitizeFilename(str))
        .join('/');

    if (!expectedExtention)
        return correctedPath;

    const extentionRe = new RegExp(escapeRe(expectedExtention));

    return extentionRe.test(correctedPath) ? correctedPath : `${correctedPath}.${expectedExtention}`;
}
