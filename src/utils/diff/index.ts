import * as jsdiff from 'diff';
import { colorLines } from './colors';
import { cleanUp } from './util';

export { stringify } from './util';


function unifiedDiff (actual: string, expected: string): string {
    const msg   = jsdiff.createPatch('string', actual, expected);
    const lines = msg.split('\n').splice(5);

    return lines
        .map(cleanUp)
        .filter((line: any) => typeof line !== 'undefined' && line !== null)
        .join('\n')
    ;
}

export function generateDiff (actual: string, expected: string): string {
    try {
        return unifiedDiff(actual, expected);
    }
    catch (err) {
        const msg =
            colorLines('diff-removed', 'Failed to generate diff') +
            '\n';

        return msg;
    }
}
