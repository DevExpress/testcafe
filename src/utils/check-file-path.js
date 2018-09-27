import path from 'path';
import { win as isWin } from 'os-family';
import sanitizeFilename from 'sanitize-filename';


function correctForbiddenCharsList (forbiddenCharsList, filePath) {
    const isWinAbsolutePath       = isWin && path.isAbsolute(filePath);
    const hasDriveSeparatorInList = forbiddenCharsList.length && forbiddenCharsList[0].char === ':' && forbiddenCharsList[0].index === 1;

    if (isWinAbsolutePath && hasDriveSeparatorInList)
        forbiddenCharsList.shift();
}

function addForbiddenCharToList (forbiddenCharsList, forbiddenCharInfo) {
    const { char } = forbiddenCharInfo;

    if (char === path.win32.sep || char === path.posix.sep)
        return '';

    forbiddenCharsList.push(forbiddenCharInfo);

    return '';
}


export default function (filePath) {
    const forbiddenCharsList = [];

    sanitizeFilename(filePath, {
        replacement: (char, index) => addForbiddenCharToList(forbiddenCharsList, { char, index })
    });

    correctForbiddenCharsList(forbiddenCharsList, filePath);

    return forbiddenCharsList;
}
