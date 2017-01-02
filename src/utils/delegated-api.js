const API_IMPLEMENTATION_METHOD_RE = /^_(\S+)\$(FLAG)?$/;

export function getDelegatedAPIList (src) {
    return Object
        .keys(src)
        .map(prop => {
            var match = prop.match(API_IMPLEMENTATION_METHOD_RE);

            if (match) {
                return {
                    srcProp: prop,
                    apiProp: match[1],
                    isFlag:  match[2]
                };
            }

            return null;
        })
        .filter(item => !!item);
}

export function delegateAPI (src, dest, apiList, proxyMethod, useDynamicMethodCtx) {
    apiList.forEach(({ srcProp, apiProp, isFlag }) => {
        var fn = function (...args) {
            if (proxyMethod)
                proxyMethod();

            var ctx = useDynamicMethodCtx ? this : src;

            return ctx[srcProp](...args);
        };

        if (isFlag)
            Object.defineProperty(dest, apiProp, { get: fn });

        else
            dest[apiProp] = fn;
    });
}
