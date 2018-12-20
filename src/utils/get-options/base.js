import Promise from 'pinkie';
import convertToBestFitType from '../convert-to-best-fit-type';


const DEFAULT_OPTIONS_SEPARATOR   = ',';
const DEFAULT_KEY_VALUE_SEPARATOR = '=';

const DEFAULT_ON_OPTION_PARSED = (key, value) => value;

function parseOptionsString (optionsStr, optionsSeparator, keyValueSeparator) {
    return optionsStr
        .split(optionsSeparator)
        .map(keyValueString => keyValueString.split(keyValueSeparator))
        .map(([key, ...value]) => [key, value.length > 1 ? value.join(keyValueSeparator) : value[0]]);
}

export default async function (sourceOptions = '', optionsConfig) {
    const {
        optionsSeparator = DEFAULT_OPTIONS_SEPARATOR,
        keyValueSeparator = DEFAULT_KEY_VALUE_SEPARATOR,
        onOptionParsed = DEFAULT_ON_OPTION_PARSED
    } = optionsConfig;

    const optionsList = typeof sourceOptions === 'string' ?
        parseOptionsString(sourceOptions, optionsSeparator, keyValueSeparator) :
        Object.entries(sourceOptions);

    const resultOptions = {};

    await Promise.all(optionsList.map(async ([key, value]) => {
        // NOTE: threat a key without a separator and a value as a boolean flag
        if (value === void 0)
            value = true;

        value = convertToBestFitType(value);

        resultOptions[key] = await onOptionParsed(key, value);
    }));

    return resultOptions;
}

