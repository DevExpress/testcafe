// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default class Assignable {
    _getAssignableProperties () {
        throw new Error('Not implemented');
    }

    _assignFrom (obj, validate, initOptions = {}) {
        if (!obj)
            return;

        const props = this._getAssignableProperties();

        for (let i = 0; i < props.length; i++) {
            const { name, type, required, init, defaultValue } = props[i];

            const path    = name.split('.');
            const lastIdx = path.length - 1;
            const last    = path[lastIdx];
            let srcObj  = obj;
            let destObj = this;

            for (let j = 0; j < lastIdx && srcObj && destObj; j++) {
                srcObj  = srcObj[path[j]];
                destObj = destObj[path[j]];
            }

            if (destObj && 'defaultValue' in props[i])
                destObj[name] = defaultValue;

            if (srcObj && destObj) {
                const srcVal = srcObj[last];

                if (srcVal !== void 0 || required) {
                    if (validate && type)
                        type(name, srcVal);

                    destObj[last] = init ? init(name, srcVal, initOptions, validate) : srcVal;
                }
            }
        }
    }
}
