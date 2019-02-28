import path from 'path';
import sanitizeFilename from 'sanitize-filename';
import { escapeRegExp as escapeRe } from 'lodash';

export default function (filePath, expectedExtention) {
    filePath = filePath.replace(new RegExp(escapeRe(path.win32.sep), 'g'), path.posix.sep);

    const correctedPath = filePath
        .split(path.posix.sep)
        .filter((fragment, index) => index === 0 || !!fragment)
        .map(str => sanitizeFilename(str))
        .join(path.sep);

    if (!expectedExtention)
        return correctedPath;

    const extentionRe = new RegExp(escapeRe(expectedExtention));

    return extentionRe.test(correctedPath) ? correctedPath : `${correctedPath}.${expectedExtention}`;
}
