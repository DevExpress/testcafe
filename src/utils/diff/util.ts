import { inspect } from 'util';
import { isFunction, isBuffer } from 'lodash';
import { setColors } from './colors';

export function cleanUp (line: string): string {
    if (line.match(/\\ No newline/))
        return '';

    return setColors(line);
}

export function stringify (value: any): string {
    let valueToStringify = value;

    if (isFunction(value))
        return valueToStringify.toString();


    if (isBuffer(value))
        valueToStringify = Buffer.prototype.toJSON.call(value).data;


    return inspect(valueToStringify, { compact: false, sorted: true, depth: null })
        .split('\n')
        .map(line => line.replace(/,\s*$/, ''))
        .join('\n') || valueToStringify.toString;
}
