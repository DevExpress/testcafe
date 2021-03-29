import { inspect } from 'util';
import {
    isFunction,
    isBuffer,
    isString
} from 'lodash';

export function cleanUpFilter (line: string): boolean {
    return !line.match(/\\ No newline/);
}

export function stringify (value: any): string {
    if (isString(value) && value !== '')
        return value;

    if (isFunction(value))
        return value.toString();

    let valueToStringify = value;

    if (isBuffer(value))
        valueToStringify = Buffer.prototype.toJSON.call(value).data;

    return inspect(valueToStringify, { compact: false, sorted: true, depth: null })
        .split('\n')
        .map(line => line.replace(/,\s*$/, ''))
        .join('\n') || valueToStringify.toString;
}
