import baseGetOptions from './base';
import { Dictionary } from '../../configuration/interfaces';
import unquote from 'unquote';

const OPTIONS_SEPARATOR     = ';';
const ARRAY_ITEMS_SEPARATOR = ',';

function isArray (value: string): boolean {
    return !!value && value.toString().includes(ARRAY_ITEMS_SEPARATOR);
}

function convertToArray (value: string): string[] {
    return value
        .split(ARRAY_ITEMS_SEPARATOR)
        .map(unquote);
}

function convertToArrayIfNecessary (value: string): string[] | string {
    return isArray(value) ? convertToArray(value) : value;
}

export default async function (options: string): Promise<Dictionary<number | string | boolean>> {
    return baseGetOptions(options, {
        optionsSeparator: OPTIONS_SEPARATOR,

        async onOptionParsed (key: string, value: string) {
            return convertToArrayIfNecessary(value);
        }
    });
}
