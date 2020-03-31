import { set, isEmpty } from 'lodash';
import { Dictionary } from '../configuration/interfaces';

function getFullPropertyPath (property: string, parentProperty: string): string {
    if (parentProperty)
        return `${parentProperty}.${property}`;

    return property;
}

function diff (source: Dictionary<object>, modified: Dictionary<object>, result: Dictionary<object>, parentProperty: string = ''): void {
    for (const property in source) {
        const fullPropertyPath = getFullPropertyPath(property, parentProperty);

        const sourceValue   = source[property] as Dictionary<object>;
        const modifiedValue = modified[property] as Dictionary<object>;

        if (sourceValue !== modifiedValue) {
            if (typeof sourceValue === 'object' && typeof modifiedValue === 'object')
                diff(sourceValue, modifiedValue, result, fullPropertyPath);
            else
                set(result, fullPropertyPath, modifiedValue);
        }
    }
}

export default (source: Dictionary<object>, modified: Dictionary<object>) => {
    const result = {};

    diff(source, modified, result);

    if (isEmpty(result))
        return null;

    return result;
};
