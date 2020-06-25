export const isString = (obj) => {
    return typeof obj === 'string';
};

const type = (value) => {
    if (value === undefined) {
        return 'undefined';
    } else if (value === null) {
        return 'null';
    } else if (Buffer.isBuffer(value)) {
        return 'buffer';
    }
    return Object.prototype.toString
        .call(value)
        .replace(/^\[.+\s(.+?)]$/, '$1')
        .toLowerCase();
};

const emptyRepresentation = (value, typeHint) => {
    switch (typeHint) {
        case 'function':
            return '[Function]';
        case 'object':
            return '{}';
        case 'array':
            return '[]';
        default:
            return value.toString();
    }
};

const canonicalize = (value, stack, typeHint) => {
    var canonicalizedObj;
    /* eslint-disable no-unused-vars */
    var prop;
    /* eslint-enable no-unused-vars */
    typeHint = typeHint || type(value);
    function withStack(value, fn) {
        stack.push(value);
        fn();
        stack.pop();
    }
    
    stack = stack || [];
    
    if (stack.indexOf(value) !== -1) {
        return '[Circular]';
    }
    
    switch (typeHint) {
        case 'undefined':
        case 'buffer':
        case 'null':
            canonicalizedObj = value;
            break;
        case 'array':
            withStack(value, function() {
                canonicalizedObj = value.map(function(item) {
                return canonicalize(item, stack);
                });
            });
            break;
        case 'function':
            /* eslint-disable guard-for-in */
            for (prop in value) {
                canonicalizedObj = {};
                break;
            }
            /* eslint-enable guard-for-in */
            if (!canonicalizedObj) {
                canonicalizedObj = emptyRepresentation(value, typeHint);
                break;
            }
            /* falls through */
        case 'object':
            canonicalizedObj = canonicalizedObj || {};
            withStack(value, function() {
                Object.keys(value)
                .sort()
                .forEach(function(key) {
                    canonicalizedObj[key] = canonicalize(value[key], stack);
                });
            });
            break;
        case 'date':
        case 'number':
        case 'regexp':
        case 'boolean':
        case 'symbol':
            canonicalizedObj = value;
            break;
        default:
            canonicalizedObj = value + '';
    }
    
    return canonicalizedObj;
};

export const stringify = (value) => {
    const indent = '   ';
    var typeHint = type(value);
    
    if (!~['object', 'array', 'function'].indexOf(typeHint)) {
        if (typeHint === 'buffer') {
            var json = Buffer.prototype.toJSON.call(value);
            // Based on the toJSON result
            return JSON.stringify(
                json.data && json.type ? json.data : json,
                2,
                indent
            ).replace(/,(\n|$)/g, '$1');
        }
    
        // IE7/IE8 has a bizarre String constructor; needs to be coerced
        // into an array and back to obj.
        if (typeHint === 'string' && typeof value === 'object') {
            value = value.split('').reduce(function(acc, char, idx) {
                acc[idx] = char;
                return acc;
            }, {});

            typeHint = 'object';
        } else {
            return JSON.stringify(value, null, indent);
        }
    }
    
    for (var prop in value) {
        if (Object.prototype.hasOwnProperty.call(value, prop)) {
            return JSON.stringify(
                canonicalize(value, null, typeHint),
                2,
                indent
            ).replace(/,(\n|$)/g, '$1');
        }
    }
    
    return emptyRepresentation(value, typeHint);
};