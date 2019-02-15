import { GeneralError } from "../../errors/runtime";
import MESSAGE from "../../errors/runtime/message";

export default function (optionName, value) {
    if (value === void 0)
        return value;

    try {
        return new RegExp(value);
    }
    catch (err) {
        throw new GeneralError(MESSAGE.optionValueIsNotValidRegExp, optionName);
    }
}
