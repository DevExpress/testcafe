import escapeRegExp from 'lodash/escapeRegExp';

export function parseRegExpString (regExp) {
    if (typeof regExp !== 'string')
        return regExp;

    const containFlags = regExp.match(/^\/(.*?)\/([gim]*)$/);

    if (containFlags)
        return makeRegExp(containFlags[1], containFlags[2]);

    return makeRegExp(regExp);
}

export function makeRegExp (str, flags) {
    return typeof str === 'string' ? new RegExp(escapeRegExp(str), flags) : str;
}
