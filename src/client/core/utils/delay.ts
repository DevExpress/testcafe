import hammerhead from '../deps/hammerhead';

const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;


export default function (ms: number): Promise<void> {
    return new Promise((resolve: () => void) => nativeMethods.setTimeout.call(window, resolve, ms));
}
