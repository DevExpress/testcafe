import util from 'util';
import _ from 'lodash';
import { colorLines } from './colors';
import { INDENT } from './const';


export function cleanUp (line: string): string {
    if (line[0] === '+')
        return INDENT + colorLines('diff added', line);


    if (line[0] === '-')
        return INDENT + colorLines('diff removed', line);


    if (line.match(/@@/))
        return '--';


    if (line.match(/\\ No newline/))
        return '';


    return INDENT + colorLines('diff filler', line);
}

export function stringify (value: any): string {
    let valueToStringify = value;

    if (_.isFunction(value))
        return valueToStringify.toString();


    if (_.isBuffer(value))
        valueToStringify = Buffer.prototype.toJSON.call(value).data;


    return util.inspect(valueToStringify, { compact: false, sorted: true, depth: 5, maxArrayLength: 100 }) || valueToStringify.toString;
}
