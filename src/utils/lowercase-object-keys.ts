import { Dictionary } from '../configuration/interfaces';

export default function (headers: Dictionary<string>): Dictionary<string> {
    const result: Dictionary<string> = {};

    Object.keys(headers).forEach(name => {
        result[name.toLowerCase()] = headers[name];
    });

    return result;
}
