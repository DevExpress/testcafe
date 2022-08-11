import escapeRegExp from 'lodash/escapeRegExp';

export default function makeRegExp (str) {
    return typeof str === 'string' ? new RegExp(escapeRegExp(str)) : str;
}
