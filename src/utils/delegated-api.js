const API_IMPLEMENTATION_METHOD_RE = /^_(\S+)\$(getter|setter)?$/;

export function getDelegatedAPIList (src) {
    return Object
        .keys(src)
        .map(prop => {
            var match = prop.match(API_IMPLEMENTATION_METHOD_RE);

            if (match) {
                return {
                    srcProp:  prop,
                    apiProp:  match[1],
                    accessor: match[2]
                };
            }

            return null;
        })
        .filter(item => !!item);
}

export function delegateAPI (dest, apiList, opts) {
    apiList.forEach(({ srcProp, apiProp, accessor }) => {
        var fn = function (...args) {
            if (opts.proxyMethod)
                opts.proxyMethod();

            var handler = null;

            if (opts.useCurrentCtxAsHandler)
                handler = this;

            else if (opts.getHandler)
                handler = opts.getHandler(apiProp, accessor);

            else
                handler = opts.handler;

            return handler[srcProp](...args);
        };

        if (accessor === 'getter')
            Object.defineProperty(dest, apiProp, { get: fn, configurable: true });

        else if (accessor === 'setter')
            Object.defineProperty(dest, apiProp, { set: fn, configurable: true });

        else
            dest[apiProp] = fn;
    });
}
