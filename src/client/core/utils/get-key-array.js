import { map } from './array';

export default function getKeyArray (keyCombination) {
    // NOTE: we should separate the '+' symbol that concats other
    // keys and the '+'  key to support commands like the 'ctrl++'
    var keys = keyCombination.replace(/^\+/g, 'plus').replace(/\+\+/g, '+plus').split('+');

    return map(keys, key => key.replace('plus', '+'));
}
