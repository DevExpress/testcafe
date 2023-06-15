import { Dictionary } from '../configuration/interfaces';

export default function (obj: Dictionary<string>): Dictionary<string> {
    const result: Dictionary<string> = {};

    Object.keys(obj).forEach(name => {
        result[name.toLowerCase()] = obj[name];
    });

    return result;
}
