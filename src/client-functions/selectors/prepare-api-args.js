export default function prepareApiFnArgs (fnName, ...args) {
    args = args.map(arg => {
        if (typeof arg === 'string')
            return `'${arg}'`;
        if (typeof arg === 'function')
            return '[function]';
        return arg;
    });
    args = args.join(', ');

    return `.${fnName}(${args})`;
}
