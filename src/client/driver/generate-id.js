import { nativeMethods } from './deps/hammerhead';

export default function () {
    return nativeMethods.performanceNow().toString();
}
