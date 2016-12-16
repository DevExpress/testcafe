import { KEY_IDENTIFIER_MAPS } from '../deps/testcafe-core';
import isLetter from './is-letter';


export default function getKeyIdentifier (char) {
    if (isLetter(char))
        return KEY_IDENTIFIER_MAPS.LETTERS[char.toLowerCase()];

    if (char.length === 1)
        return KEY_IDENTIFIER_MAPS.SYMBOLS[char];

    return KEY_IDENTIFIER_MAPS.SPECIAL_KEYS[char] || char;
}
