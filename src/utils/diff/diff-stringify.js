import { type, emptyRepresentation } from './diff-util';
import { INDENT } from './diff-const';


function format (value, stack, typeHint) {
    typeHint = typeHint || type(value);

    stack = stack || [];

    if (stack.indexOf(value) !== -1)
        return '[Circular]';


    if (['buffer', 'null', 'undefined', 'date', 'number', 'regexp', 'boolean', 'symbol'].indexOf(typeHint) !== -1)
        return value;

    if (typeHint === 'array') {
        let formattedObj;

        withStack(stack, value, () => {
            formattedObj = value.map(item => {
                return format(item, stack);
            });
        });

        return formattedObj;
    }

    if (typeHint === 'object') {
        const formattedObj = {};

        withStack(stack, value, () => {
            Object.keys(value)
                .sort()
                .forEach(key => {
                    formattedObj[key] = format(value[key], stack);
                });
        });

        return formattedObj;
    }

    return value + '';
}

function withStack (stack, value, fn) {
    stack.push(value);
    fn();
    stack.pop();

    return stack;
}

export function stringify (value) {
    const typeHint = type(value);

    if (['object', 'array'].indexOf(typeHint) !== -1) {
        for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
                return JSON.stringify(
                    format(value, null, typeHint),
                    2,
                    INDENT
                ).replace(/,(\n|$)/g, '$1');
            }
        }
    }

    if (typeHint === 'buffer') {
        const json = Buffer.prototype.toJSON.call(value);

        return JSON.stringify(
            json.data && json.type ? json.data : json,
            2,
            INDENT
        ).replace(/,(\n|$)/g, '$1');
    }

    if (value)
        return JSON.stringify(value, null, INDENT) || value.toString();


    return emptyRepresentation(value, typeHint);
}
