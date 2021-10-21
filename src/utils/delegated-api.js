const API_IMPLEMENTATION_METHOD_RE = /^_(\S+)\$(getter|setter)?$/;

function isTestController (obj) {
    return obj?.constructor?.name === 'TestController';
}

function getTestController (obj) {
    if (isTestController(obj))
        return obj;

    else if (isTestController(obj._testController))
        return obj._testController;

    return null;
}

export function getDelegatedAPIList (src) {
    return Object
        .getOwnPropertyNames(src)
        .map(prop => {
            const match = prop.match(API_IMPLEMENTATION_METHOD_RE);

            if (match) {
                return {
                    srcProp:  prop,
                    apiProp:  match[1],
                    accessor: match[2],
                };
            }

            return null;
        })
        .filter(item => !!item);
}

export function delegateAPI (dest, apiList, opts) {
    apiList.forEach(({ srcProp, apiProp, accessor }) => {
        let fn = function (...args) {
            if (opts.proxyMethod)
                opts.proxyMethod();

            let handler = null;

            if (opts.useCurrentCtxAsHandler)
                handler = this;

            else if (opts.getHandler)
                handler = opts.getHandler(apiProp, accessor);

            else
                handler = opts.handler;

            return handler[srcProp](...args);
        };

        // NOTE: need to create named function to process possible err.stack correctly
        const createNamedFunction = new Function('srcProp', 'apiProp', 'accessor', 'opts', `
            return ${fn.toString().replace('function', 'function ' + apiProp)}
        `);

        fn = createNamedFunction(srcProp, apiProp, accessor, opts);

        if (accessor === 'getter')
            Object.defineProperty(dest, apiProp, { get: fn, configurable: true });

        else if (accessor === 'setter')
            Object.defineProperty(dest, apiProp, { set: fn, configurable: true });

        else {
            // NOTE: need to create `property` but not a `function` to stop on `debugger`
            // before the action is called
            Object.defineProperty(dest, apiProp, {
                get () {
                    const testController = getTestController(this);

                    if (testController && testController.shouldStop(apiProp)) {
                        // eslint-disable-next-line no-debugger
                        debugger;
                    }

                    return fn;
                },
                configurable: true,
            });
        }
    });
}
