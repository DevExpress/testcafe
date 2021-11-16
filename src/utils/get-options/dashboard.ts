import baseGetOptions from './base';
import { Dictionary } from '../../configuration/interfaces';

const STRING_OPTION_NAMES = ['buildId', 'token'];

export default async function (options: string): Promise<Dictionary<number | string | boolean>> {
    return baseGetOptions(options, {
        async onOptionParsed (key: string, value: string) {
            if (key && STRING_OPTION_NAMES.includes(key))
                return String(value);

            return value;
        },
    });
}
