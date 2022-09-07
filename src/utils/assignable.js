// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { ActionInvalidObjectPropertyError } from '../shared/errors';

function validateObjectProps (obj, dest) {
    const objectName = dest.constructor.name;
    const validKeys = dest._getAssignableProperties().map(p => p.name);

    for (const key in obj) {
        if (!(validKeys.includes(key) || key in dest))
            throw new ActionInvalidObjectPropertyError(objectName, key, validKeys);
    }
}

export default class Assignable {
    _getAssignableProperties () {
        throw new Error('Not implemented');
    }

    _assignFrom (obj, validate, initOptions = {}) {
        if (!obj)
            return;

        if (validate)
            validateObjectProps(obj, this);

        const props = this._getAssignableProperties();

        for (let i = 0; i < props.length; i++) {
            const { name, type, required, init, defaultValue } = props[i];

            if (defaultValue !== void 0)
                this[name] = defaultValue;

            const srcVal = obj[name];

            if (srcVal !== void 0 || required) {
                if (validate && type)
                    type(name, srcVal);

                this[name] = init ? init(name, srcVal, initOptions, validate) : srcVal;
            }
        }
    }
}
