import util from 'util';
import _ from 'lodash';
import { setColors } from './colors';

export function cleanUp (line: string): string {
    if (line.match(/\\ No newline/))
        return '';

    return setColors(line);
}

export function stringify (value: any): string {
    let valueToStringify = value;

    if (_.isFunction(value))
        return valueToStringify.toString();


    if (_.isBuffer(value))
        valueToStringify = Buffer.prototype.toJSON.call(value).data;


    return util.inspect(valueToStringify, { compact: false, sorted: true, depth: null }) || valueToStringify.toString;
}
