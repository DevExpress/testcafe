import { set, isEmpty, isEqual, isNil as isNullOrUndefined } from 'lodash';
import { Dictionary } from '../configuration/interfaces';

const OBJECTS_EMPTY_ERROR                = 'Objects should be not empty';
const OBJECTS_DIFFERENT_PROPERTIES_ERROR = 'Objects should contain the same properties';

function getFullPropertyPath (property: string, parentProperty: string): string {
    if (parentProperty)
        return `${parentProperty}.${property}`;

    return property;
}

function validate (source: Dictionary<object>, modified: Dictionary<object>): void {
    if (isEmpty(source) || isEmpty(modified))
        throw new TypeError(OBJECTS_EMPTY_ERROR);

    if (!isEqual(Object.keys(source), Object.keys(modified)))
        throw new TypeError(OBJECTS_DIFFERENT_PROPERTIES_ERROR);
}

function diff (source: Dictionary<object>, modified: Dictionary<object>, result: Dictionary<object>, parentProperty: string = ''): void {
    validate(source, modified);

    for (const property in source) {
        const fullPropertyPath = getFullPropertyPath(property, parentProperty);

        const sourceValue   = source[property] as Dictionary<object>;
        const modifiedValue = modified[property] as Dictionary<object>;

        if (!isNullOrUndefined(modifiedValue) && sourceValue !== modifiedValue) {
            if (typeof sourceValue === 'object' && typeof modifiedValue === 'object')
                diff(sourceValue, modifiedValue, result, fullPropertyPath);
            else
                set(result, fullPropertyPath, modifiedValue);
        }
    }
}

export default (source: Dictionary<object>, modified: Dictionary<object>) => {
    const result = {};

    try {
        diff(source, modified, result);
    }
    catch {
        return null;
    }

    if (isEmpty(result))
        return null;

    return result;
};
