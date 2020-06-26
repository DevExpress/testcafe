import { colorLines } from './diff-colors';
import { INDENT } from './diff-const';


export function type (value) {
    if (typeof value === 'undefined')
        return 'undefined';


    if (value === null)
        return 'null';


    if (Buffer.isBuffer(value))
        return 'buffer';


    return Object.prototype.toString
        .call(value)
        .replace(/^\[.+\s(.+?)]$/, '$1')
        .toLowerCase();
}

export function emptyRepresentation (value, typeHint) {
    switch (typeHint) {
        case 'function':
            return '[Function]';
        case 'object':
            return '{}';
        case 'array':
            return '[]';
        case 'undefined':
            return 'undefined';
        case 'null':
            return 'null';
        case 'string':
            return `''`;
        default:
            return value.toString();
    }
}

export function isString (obj) {
    return typeof obj === 'string';
}

export function notBlank (line) {
    return typeof line !== 'undefined' && line !== null;
}

export function cleanUp (line) {
    if (line[0] === '+')
        return INDENT + colorLines('diff added', line);


    if (line[0] === '-')
        return INDENT + colorLines('diff removed', line);


    if (line.match(/@@/))
        return '--';


    if (line.match(/\\ No newline/))
        return null;


    return INDENT + colorLines('diff filler', line);
}
