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

export function delegateAPI (src, dest, apiList, proxyMethod, useDynamicMethodCtx) {
    apiList.forEach(({ srcProp, apiProp, accessor }) => {
        var fn = function (...args) {
            if (proxyMethod)
                proxyMethod();

            var ctx = useDynamicMethodCtx ? this : src;

            return ctx[srcProp](...args);
        };

        if (accessor === 'getter')
            Object.defineProperty(dest, apiProp, { get: fn, configurable: true });

        else if (accessor === 'setter')
            Object.defineProperty(dest, apiProp, { set: fn, configurable: true });

        else
            dest[apiProp] = fn;
    });
}
