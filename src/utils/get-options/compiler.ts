import baseGetOptions from './base';
import { Dictionary } from '../../configuration/interfaces';
import unquote from 'unquote';

const OPTIONS_SEPARATOR     = ';';
const ARRAY_ITEMS_SEPARATOR = ',';

const TYPESCRIPT_OPTIONS_PREFIX = 'typescript.options.';

const TYPESCRIPT_ARRAY_OPTION_NAMES = ['rootDirs', 'types', 'typeRoots', 'lib'].map(optionName => TYPESCRIPT_OPTIONS_PREFIX + optionName);

function isTypeScriptArrayOption (name: string): boolean {
    return !!name && TYPESCRIPT_ARRAY_OPTION_NAMES.includes(name);
}

function convertToArray (value: string): string[] {
    if (!value)
        return [];

    return value
        .split(ARRAY_ITEMS_SEPARATOR)
        .map(unquote);
}

function convertToArrayIfNecessary (key: string, value: string): string[] | string {
    return isTypeScriptArrayOption(key) ? convertToArray(value) : value;
}

export default async function (options: string): Promise<Dictionary<number | string | boolean>> {
    return baseGetOptions(options, {
        optionsSeparator: OPTIONS_SEPARATOR,

        async onOptionParsed (key: string, value: string) {
            return convertToArrayIfNecessary(key, value);
        }
    });
}
