import hammerhead from '../../deps/hammerhead';

const nativeMethods = hammerhead.nativeMethods;

export function castArray (elements) {
    return nativeMethods.isArray(elements) ? elements : [elements];
}
