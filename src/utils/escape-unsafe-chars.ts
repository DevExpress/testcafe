import { Dictionary } from '../configuration/interfaces';

const charMap: Dictionary<string> = {
    '<':      '\\u003C',
    '>':      '\\u003E',
    '/':      '\\u002F',
    '\\':     '\\\\',
    '\b':     '\\b',
    '\f':     '\\f',
    '\n':     '\\n',
    '\r':     '\\r',
    '\t':     '\\t',
    '\0':     '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
};

export default function escapeUnsafeChars (str: string): string {
    return str.replace(/[<>\\\b\f\n\r\t\0\u2028\u2029]/g, x => charMap[x]);
}
