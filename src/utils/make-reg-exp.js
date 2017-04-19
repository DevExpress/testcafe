import { escapeRegExp as escapeRe } from 'lodash';

export default function makeRegExp (str) {
    return typeof str === 'string' ? new RegExp(escapeRe(str)) : str;
}
