import hammerhead from '../deps/hammerhead';
import KEY_MAPS from './key-maps';
import { some } from './array';
import getKeyArray from './get-key-array';
import getSanitizedKey from './get-sanitized-key';

const trim = hammerhead.utils.trim;


export default function (keyString) {
    if (typeof keyString !== 'string')
        return { error: true };

    keyString = trim(keyString).replace(/\s+/g, ' ');

    const keyStringLength = keyString.length;
    const lastChar        = keyString.charAt(keyStringLength - 1);
    const charBeforeLast  = keyString.charAt(keyStringLength - 2);

    // NOTE: trim last connecting '+'
    if (keyStringLength > 1 && lastChar === '+' && !/[+ ]/.test(charBeforeLast))
        keyString = keyString.substring(0, keyString.length - 1);

    const combinations = keyString.split(' ');

    const error = some(combinations, combination => {
        const keyArray = getKeyArray(combination);

        return some(keyArray, key => {
            const isChar          = key.length === 1 || key === 'space';
            const sanitizedKey    = getSanitizedKey(key);
            const modifierKeyCode = KEY_MAPS.modifiers[sanitizedKey];
            const specialKeyCode  = KEY_MAPS.specialKeys[sanitizedKey];

            return !(isChar || modifierKeyCode || specialKeyCode);
        });
    });

    return {
        combinations: combinations,
        error:        error,
        keys:         keyString
    };
}
