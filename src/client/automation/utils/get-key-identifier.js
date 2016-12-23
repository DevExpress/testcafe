import KEY_IDENTIFIER_MAPS from './key-identifier-maps';
import isLetter from './is-letter';


export default function getKeyIdentifier (char) {
    if (isLetter(char))
        return KEY_IDENTIFIER_MAPS.LETTERS[char.toLowerCase()];

    return KEY_IDENTIFIER_MAPS.SYMBOLS[char] || KEY_IDENTIFIER_MAPS.SPECIAL_KEYS[char] || char;
}
