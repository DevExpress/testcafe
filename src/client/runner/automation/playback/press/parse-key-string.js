import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import { getKeyArray, getSanitizedKey } from './utils';
import KEY_MAPS from '../../../utils/key-maps';

var trim       = hammerhead.utils.trim;
var arrayUtils = testCafeCore.arrayUtils;


export default function (keyString) {
    keyString = trim(keyString).replace(/\s+/g, ' ');

    var keyStringLength = keyString.length;
    var lastChar        = keyString.charAt(keyStringLength - 1);
    var charBeforeLast  = keyString.charAt(keyStringLength - 2);

    // NOTE: trim last connecting '+'
    if (keyStringLength > 1 && lastChar === '+' && !/[\+ ]/.test(charBeforeLast))
        keyString = keyString.substring(0, keyString.length - 1);

    var combinations = keyString.split(' ');

    var error = arrayUtils.some(combinations, combination => {
        var keyArray = getKeyArray(combination);

        return arrayUtils.some(keyArray, key => {
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
