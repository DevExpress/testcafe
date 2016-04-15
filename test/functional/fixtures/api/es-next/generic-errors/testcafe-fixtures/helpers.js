import assert from 'assert';

export default function throwError () {
    throw new Error('yo!');
}

export function assertionError () {
    assert(false);
}
