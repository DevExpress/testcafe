import { colorLines } from './diff-colors';
import { isString, cleanUp, notBlank } from './diff-util';
import { stringify } from './diff-stringify';

const diff = require('diff'); //CHANGE LATER


function unifiedDiff (actual, expected) {
    const msg = diff.createPatch('string', actual, expected);
    const lines = msg.split('\n').splice(5);

    return (
        colorLines('diff added', '+ expected') +
        ' ' +
        colorLines('diff removed', '- actual') +
        '\n\n' +
        lines
            .map(cleanUp)
            .filter(notBlank)
            .join('\n')
    );
}

export function stringifyDiffObjects (actual, expected) {
    if (!isString(actual) || !isString(expected))
        return [ stringify(actual), stringify(expected) ];


    return [ actual, expected ];
}

export function generateDiff (actual, expected) {
    try {
        return unifiedDiff(actual, expected);
    }
    catch (err) {
        const msg =
            colorLines('diff removed', 'Failed to generate diff') +
            '\n';

        return msg;
    }
}
