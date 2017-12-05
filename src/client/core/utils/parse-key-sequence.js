import hammerhead from '../deps/hammerhead';
import KEY_MAPS from './key-maps';
import { some } from './array';
import getKeyArray from './get-key-array';
import getSanitizedKey from './get-sanitized-key';

var trim = hammerhead.utils.trim;


export default function (keyString) {
    if (typeof keyString !== 'string')
        return { error: true };

    keyString = trim(keyString).replace(/\s+/g, ' ');

    var keyStringLength = keyString.length;
    var lastChar        = keyString.charAt(keyStringLength - 1);
    var charBeforeLast  = keyString.charAt(keyStringLength - 2);

    // NOTE: trim last connecting '+'
    if (keyStringLength > 1 && lastChar === '+' && !/[+ ]/.test(charBeforeLast))
        keyString = keyString.substring(0, keyString.length - 1);

    var combinations = keyString.split(' ');

    var error = some(combinations, combination => {
        var keyArray = getKeyArray(combination);

        return some(keyArray, key => {
            var isChar          = key.length === 1 || key === 'space';
            var sanitizedKey    = getSanitizedKey(key);
            var modifierKeyCode = KEY_MAPS.modifiers[sanitizedKey];
            var specialKeyCode  = KEY_MAPS.specialKeys[sanitizedKey];

            return !(isChar || modifierKeyCode || specialKeyCode);
        });
    });

    return {
        combinations: combinations,
        error:        error,
        keys:         keyString
    };
}
