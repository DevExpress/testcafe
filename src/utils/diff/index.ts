import * as jsdiff from 'diff';
import debug from 'debug';
import { isUndefined, isNull } from 'lodash';
import { cleanUp, stringify } from './util';
import { FAILED_TO_GENERATE_DETAILED_DIFF } from '../../notifications/information-message';

const debugLogger = debug('testcafe:util:diff');

function unifiedDiff (actual: string, expected: string): string {
    const msg   = jsdiff.createPatch('string', actual, expected);
    const lines = msg.split('\n').splice(5);

    return lines
        .map(cleanUp)
        .filter((line: any) => !isUndefined(line) && !isNull(line))
        .join('\n')
    ;
}

export function generate (actual: string, expected: string): string {
    try {
        return unifiedDiff(stringify(actual), stringify(expected));
    }
    catch (err) {
        debugLogger(FAILED_TO_GENERATE_DETAILED_DIFF(err.message));

        return '';
    }
}
