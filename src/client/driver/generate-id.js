import { nativeMethods } from './deps/hammerhead';

export default function () {
    if (typeof nativeMethods.performanceNow === 'function')
        return nativeMethods.performanceNow().toString();

    return (nativeMethods.dateNow() + Math.random()).toString();
}
