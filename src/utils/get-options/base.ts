import convertToBestFitType from '../convert-to-best-fit-type';
import { Dictionary, GetOptionConfiguration } from '../../configuration/interfaces';

const DEFAULT_OPTIONS_SEPARATOR   = ',';
const DEFAULT_KEY_VALUE_SEPARATOR = '=';

type OptionKeyValue = [string, string];

function convertOptionValueType (value: any): any { /* eslint-disable-line @typescript-eslint/no-explicit-any */
    // NOTE: threat a key without a separator and a value as a boolean flag
    if (value === void 0)
        return true;

    return convertToBestFitType(value);
}

function parseOptionsString (optionsStr: string, optionsSeparator: string, keyValueSeparator: string): OptionKeyValue[] {
    return optionsStr
        .split(optionsSeparator)
        .map(keyValueString => keyValueString.split(keyValueSeparator))
        .map(([key, ...value]) => [key, value.length > 1 ? value.join(keyValueSeparator) : value[0]]);
}

export default async function (sourceOptions: string | Dictionary<string | number | boolean> = '', optionsConfig: GetOptionConfiguration = {}): Promise<Dictionary<any>> { /* eslint-disable-line @typescript-eslint/no-explicit-any */
    const {
        optionsSeparator = DEFAULT_OPTIONS_SEPARATOR,
        keyValueSeparator = DEFAULT_KEY_VALUE_SEPARATOR,
        skipOptionValueTypeConversion = false,
        onOptionParsed = void 0,
    } = optionsConfig;

    const optionsList = typeof sourceOptions === 'string' ?
        parseOptionsString(sourceOptions, optionsSeparator, keyValueSeparator) :
        Object.entries(sourceOptions);

    const resultOptions = Object.create(null);

    await Promise.all(optionsList.map(async ([key, value]) => {
        if (!skipOptionValueTypeConversion)
            value = convertOptionValueType(value);

        if (onOptionParsed)
            value = await onOptionParsed(key, value);

        resultOptions[key] = value;
    }));

    return resultOptions;
}

