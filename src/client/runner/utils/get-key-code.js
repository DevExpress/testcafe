import isLetter from './is-letter';
import KEY_MAPS from './key-maps';


export default function (char) {
    if (isLetter(char))
        return char.toUpperCase().charCodeAt(0);

    var res = KEY_MAPS.shiftMap[char] ? KEY_MAPS.shiftMap[char].charCodeAt(0) : char.charCodeAt(0);

    return KEY_MAPS.symbolCharCodeToKeyCode[res] || res;
}
