import path from 'path';
import { win as isWin } from 'os-family';
import sanitizeFilename from 'sanitize-filename';


const SAFE_CHAR          = '_';
const ALLOWED_CHARS_LIST = [path.win32.sep, path.posix.sep, '.', '..'];


function correctForbiddenCharsList (forbiddenCharsList, filePath) {
    const isWinAbsolutePath       = isWin && path.isAbsolute(filePath);
    const hasDriveSeparatorInList = forbiddenCharsList.length && forbiddenCharsList[0].chars === ':' && forbiddenCharsList[0].index === 1;

    if (isWinAbsolutePath && hasDriveSeparatorInList)
        forbiddenCharsList.shift();
}

function addForbiddenCharsToList (forbiddenCharsList, forbiddenCharsInfo) {
    const { chars } = forbiddenCharsInfo;

    if (!ALLOWED_CHARS_LIST.includes(chars))
        forbiddenCharsList.push(forbiddenCharsInfo);

    return SAFE_CHAR.repeat(chars.length);
}

export default function (filePath) {
    const forbiddenCharsList = [];

    sanitizeFilename(filePath, {
        replacement: (chars, index) => addForbiddenCharsToList(forbiddenCharsList, { chars, index })
    });

    correctForbiddenCharsList(forbiddenCharsList, filePath);

    return forbiddenCharsList;
}
