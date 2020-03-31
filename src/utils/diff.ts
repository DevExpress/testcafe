import { set } from 'lodash';
import { Dictionary } from '../configuration/interfaces';

function getFullPropertyPath (property: string, parentProperty: string): string {
    if (parentProperty)
        return `${parentProperty}.${property}`;

    return property;
}

function diff (object1: Dictionary<any>, object2: Dictionary<any>, result: Dictionary<any> = {}, parentProperty: string): Dictionary<any> {
    for (const prop in object1) {
        const fullPropertyPath = getFullPropertyPath(prop, parentProperty);
        const value1 = object1[prop];
        const value2 = object2[prop];

        if (value1 !== value2) {
            if (typeof value1 === 'object' && typeof value2 === 'object')
                diff(value1 as Dictionary<object>, value2 as Dictionary<object>, result, fullPropertyPath);
            else
                set(result, fullPropertyPath, value2);
        }
    }

    return result;
}

export default (object1: Dictionary<any>, object2: Dictionary<any>) => {
    const result = {};

    return diff(object1, object2, result, '');
};
