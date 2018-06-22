import fs from 'fs';
import os from 'os';

const MAX_PATH_LENGTH = {
    'Linux':      4096,
    'Windows_NT': 260,
    'Darwin':     1024
};

const OS_MAX_PATH_LENGTH = MAX_PATH_LENGTH[os.type()];

const OPTIONS_SEPARATOR          = ';';
const OPTION_KEY_VALUE_SEPARATOR = '=';
const FILE_OPTION_NAMES          = ['cert', 'key', 'pfx'];
const NUMBER_REG_EX              = /^[0-9-.,]+$/;
const BOOLEAN_STRING_VALUES      = ['true', 'false'];

export default function (optionsStr = '') {
    const splittedOptions = optionsStr.split(OPTIONS_SEPARATOR);

    if (!splittedOptions.length)
        return null;

    const parsedOptions = {};

    splittedOptions.forEach(item => {
        const keyValuePair = item.split(OPTION_KEY_VALUE_SEPARATOR);
        const key          = keyValuePair[0];
        let value          = keyValuePair[1];

        if (!key || !value)
            return;

        value = convertToBestFitType(value);

        if (FILE_OPTION_NAMES.includes(key) && value.length < OS_MAX_PATH_LENGTH && fs.existsSync(value))
            value = fs.readFileSync(value);

        parsedOptions[key] = value;
    });

    return parsedOptions;
}

function convertToBestFitType (valueStr) {
    if (typeof valueStr !== 'string')
        return void 0;

    else if (NUMBER_REG_EX.test(valueStr))
        return parseFloat(valueStr);

    else if (BOOLEAN_STRING_VALUES.includes(valueStr))
        return valueStr === 'true';

    else if (!valueStr.length)
        return void 0;

    return valueStr;
}

