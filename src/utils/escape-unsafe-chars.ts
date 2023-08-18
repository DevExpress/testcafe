import { Dictionary } from '../configuration/interfaces';

const charMap: Dictionary<string> = {
    '<': '\u003C',
    '>': '\u003E',
    '/': '\u002F',
};

export default function escapeUnsafeChars (str: string): string {
    return str.replace(/[<>/]/g, x => charMap[x]);
}
