const NUMBER_REG_EX               = /^[0-9-.,]+$/;
const BOOLEAN_STRING_VALUES       = ['true', 'false'];


export default function (valueStr) {
    if (typeof valueStr !== 'string')
        return valueStr;

    else if (NUMBER_REG_EX.test(valueStr))
        return parseFloat(valueStr);

    else if (BOOLEAN_STRING_VALUES.includes(valueStr))
        return valueStr === 'true';

    else if (!valueStr.length)
        return void 0;

    return valueStr;
}
