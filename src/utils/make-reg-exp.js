import escapeRegExp from 'lodash/escapeRegExp';

const SPLIT_INPUT_AND_FLAGS_REG_EXP = /^\/(.*?)\/([gim]*)$/;

export function parseRegExpString (regExp) {
    if (typeof regExp !== 'string')
        return regExp;

    const parsedRegExpWithFlags = regExp.match(SPLIT_INPUT_AND_FLAGS_REG_EXP);

    if (parsedRegExpWithFlags)
        return RegExp(parsedRegExpWithFlags[1], parsedRegExpWithFlags[2]);

    return makeRegExp(regExp);
}

export function makeRegExp (str, flags) {
    return typeof str === 'string' ? new RegExp(escapeRegExp(str), flags) : str;
}
