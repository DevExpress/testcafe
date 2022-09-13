// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { ActionInvalidObjectPropertyError } from '../shared/errors';

const COMMAND_NAME_SUFFIX = 'Command';
const arrayIndexOf        = Array.prototype.indexOf;
const arrayMap            = Array.prototype.map;
const arrayFilter         = Array.prototype.filter;
const arrayConcat         = Array.prototype.concat;
const objectToString      = Object.prototype.toString;
const stringIndexOf       = String.prototype.indexOf;
const stringEndsWith      = String.prototype.endsWith
                            || function (searchString, position) {
                                const subjectString = objectToString.call(this);

                                if (position === void 0 || position > subjectString.length)
                                    position = subjectString.length;

                                position -= searchString.length;

                                const lastIndex = stringIndexOf.call(subjectString, searchString, position);

                                return lastIndex !== -1 && lastIndex === position;
                            };

function validateObjectProps (obj, dest) {
    const objectName         = dest.constructor.name;
    const validKeys          = arrayMap.call(dest._getAllAssignableProperties(), p => p.name);
    const reportedProperties = dest._getReportedProperties();

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
    _getAssignableProperties () {
        return [];
    }

    _getAllAssignableProperties () {
        let parent      = Object.getPrototypeOf(this);
        let result = [];

        while (parent && parent._getAssignableProperties) {
            result = arrayConcat.call(result, parent._getAssignableProperties());
            parent = Object.getPrototypeOf(parent);
        }

        return result;
    }

    _getNonReportedProperties () {
        return [];
    }

    _getReportedProperties () {
        const props = arrayMap.call( this._getAllAssignableProperties(), prop => prop.name );
        const nonReportedProps = this._getNonReportedProperties();

        return arrayFilter.call(props, name => !(arrayIndexOf.call(nonReportedProps, name) > -1));
    }

    _assignFrom (obj, validate, initOptions = {}) {
        if (!obj)
            return;

        if (validate)
            validateObjectProps(obj, this);

        const props = this._getAllAssignableProperties();

        for (let i = 0; i < props.length; i++) {
            const { name, type, required, init, defaultValue } = props[i];

            if (defaultValue !== void 0)
                this[name] = defaultValue;

            const srcVal = obj[name];

            if (srcVal !== void 0 || required) {
                if (validate && type)
                    type(getDisplayTypeName(this.constructor.name, name), srcVal);

                this[name] = init ? init(name, srcVal, initOptions, validate) : srcVal;
            }
        }
    }
}
