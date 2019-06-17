import util from 'util';

export default function prepareApiFnArgs (fnName, ...args) {
    args = args.map(arg => {
        if (typeof arg === 'string')
            return `'${arg}'`;
        if (typeof arg === 'function')
            return '[function]';
        if (typeof arg === 'object')
            return util.inspect(arg, { compact: true, breakLength: Infinity });
        return arg;
    });
    args = args.join(', ');

    return `.${fnName}(${args})`;
}
