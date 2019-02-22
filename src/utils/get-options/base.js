import Promise from 'pinkie';
import convertToBestFitType from '../convert-to-best-fit-type';


const DEFAULT_OPTIONS_SEPARATOR   = ',';
const DEFAULT_KEY_VALUE_SEPARATOR = '=';


function convertOptionValueType (value) {
    // NOTE: threat a key without a separator and a value as a boolean flag
    if (value === void 0)
        return true;

    return convertToBestFitType(value);
}

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
        skipOptionValueTypeConversion = false,
        onOptionParsed = void 0,
    } = optionsConfig;

    const optionsList = typeof sourceOptions === 'string' ?
        parseOptionsString(sourceOptions, optionsSeparator, keyValueSeparator) :
        Object.entries(sourceOptions);

    const resultOptions = {};

    await Promise.all(optionsList.map(async ([key, value]) => {
        if (!skipOptionValueTypeConversion)
            value = convertOptionValueType(value);

        if (onOptionParsed)
            value = await onOptionParsed(key, value);

        resultOptions[key] = value;
    }));

    return resultOptions;
}

