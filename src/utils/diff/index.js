import { color, colorLines } from './diff-colors';
import { stringify, isString } from './diff-util';

const diff = require('diff');                                               //CHANGE LATER


export const stringifyDiffObjs = (err) => {                              // CHANGE LATER!!!!
    if (!isString(err.actual) || !isString(err.expected)) {
        err.actual = stringify(err.actual);
        err.expected = stringify(err.expected);
    }
};

const unifiedDiff = (actual, expected) => {
    var indent = '      ';
    function cleanUp(line) {
        if (line[0] === '+') {
            return indent + colorLines('diff added', line);
        }
        if (line[0] === '-') {
            return indent + colorLines('diff removed', line);
        }
        if (line.match(/@@/)) {
            return '--';
        }
        if (line.match(/\\ No newline/)) {
            return null;
        }
            return indent + colorLines('diff gutter', line);
    }
    function notBlank(line) {
        return typeof line !== 'undefined' && line !== null;
    }
    var msg = diff.createPatch('string', actual, expected);
    var lines = msg.split('\n').splice(5);
    return (
        '\n      ' +
        colorLines('diff added', '+ expected') +
        ' ' +
        colorLines('diff removed', '- actual') +
        '\n\n' +
        lines
            .map(cleanUp)
            .filter(notBlank)
            .join('\n')
    );
};

export const generateDiff = (actual, expected) => {
    try {
        return unifiedDiff(actual, expected);
    } catch (err) {
        var msg =
            '\n      ' +
            color('diff added', '+ expected') +
            ' ' +
            color('diff removed', '- actual:  failed to generate TestCafe diff') +
            '\n';
        return msg;
    }
};