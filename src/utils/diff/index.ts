import * as jsdiff from 'diff';
import { colorLines } from './colors';
import { type, emptyRepresentation, cleanUp } from './util';
import { INDENT } from './const';


function unifiedDiff (actual: string, expected: string): string {
    const msg = jsdiff.createPatch('string', actual, expected);
    const lines = msg.split('\n').splice(5);

    return (
        colorLines('diff added', '+ expected') +
        ' ' +
        colorLines('diff removed', '- actual') +
        '\n\n' +
        lines
            .map(cleanUp)
            .filter((line: any) => typeof line !== 'undefined' && line !== null)
            .join('\n')
    );
}

export function generateDiff (actual: string, expected: string): string {
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

export function stringify (value: any): string {
    const typeHint = type(value);

    if (['object', 'array'].indexOf(typeHint) !== -1) {
        for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
                return JSON.stringify(
                    jsdiff.canonicalize(value, [], []),
                    value,
                    INDENT
                ).replace(/,(\n|$)/g, '$1');
            }
        }
    }

    if (typeHint === 'buffer') {
        const json = Buffer.prototype.toJSON.call(value);

        return JSON.stringify(
            json.data && json.type ? json.data : json,
            value,
            INDENT
        ).replace(/,(\n|$)/g, '$1');
    }

    if (value)
        return JSON.stringify(value, null, INDENT) || value.toString();


    return emptyRepresentation(value, typeHint);
}
