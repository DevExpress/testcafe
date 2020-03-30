import { Dictionary } from '../configuration/interfaces';

function diff (object1: Dictionary<any>, object2: Dictionary<any>, result: Dictionary<any> = {}): Dictionary<any> {
    for (const prop in object1) {
        const value1 = object1[prop];
        const value2 = object2[prop];

        if (value1 !== value2) {
            if (typeof value1 === 'object' && typeof value2 === 'object') {
                result[prop] = {};

                diff(value1 as Dictionary<object>, value2 as Dictionary<object>, result[prop]);
            }
            else
                result[prop] = value2;
        }
    }

    return result;
}

export default (object1: Dictionary<any>, object2: Dictionary<any>) => {
    const result = {};

    diff(object1, object2, result);

    return result;
};
