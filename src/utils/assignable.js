// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { ActionInvalidObjectPropertyError } from '../shared/errors';
import stringEndsWith from './string-ends-with';

const arrayIndexOf   = Array.prototype.indexOf;
const arrayMap       = Array.prototype.map;
const arraySort      = Array.prototype.sort;
const arrayFilter    = Array.prototype.filter;
const arrayConcat    = Array.prototype.concat;

const COMMAND_NAME_SUFFIX = 'Command';


function validateObjectProps (obj, dest) {
    const objectName         = dest.constructor.name;
    const validKeys          = arrayMap.call(dest.getAllAssignableProperties(), p => p.name);
    const reportedProperties = arraySort.call(dest.getReportedProperties());

    for (const key in obj) {
        if (!(arrayIndexOf.call(validKeys, key) > -1 || key in dest))
            throw new ActionInvalidObjectPropertyError(objectName, key, reportedProperties);
    }
}

function getDisplayTypeName (constructorName, propName) {
    if (stringEndsWith.call(constructorName, COMMAND_NAME_SUFFIX))
        return propName;

    return `${ constructorName }.${ propName }`;
}

export default class Assignable {
    getAssignableProperties () {
        return [];
    }

    getAllAssignableProperties () {
        let parent = Object.getPrototypeOf(this);
        let result = [];

        while (parent && parent.getAssignableProperties) {
            result = arrayConcat.call(result, parent.getAssignableProperties());
            parent = Object.getPrototypeOf(parent);
        }

        return result;
    }

    getNonReportedProperties () {
        return [];
    }

    getReportedProperties () {
        const props            = arrayMap.call(this.getAllAssignableProperties(), prop => prop.name);
        const nonReportedProps = this.getNonReportedProperties();

        return arrayFilter.call(props, name => !(arrayIndexOf.call(nonReportedProps, name) > -1));
    }

    _assignFrom (obj, validate, initOptions = {}) {
        if (!obj)
            return;

        if (validate)
            validateObjectProps(obj, this);

        const props = this.getAllAssignableProperties();

        for (let i = 0; i < props.length; i++) {
            const { name, type, required, init, defaultValue } = props[i];

            if (defaultValue !== void 0)
                this[name] = defaultValue;

            const srcVal = obj[name];

            if (srcVal === void 0 && !required)
                continue;

            if (validate && type) {
                const typeName = getDisplayTypeName(this.constructor.name, name);

                type(typeName, srcVal);
            }

            this[name] = init ? init(name, srcVal, initOptions, validate) : srcVal;
        }
    }
}
