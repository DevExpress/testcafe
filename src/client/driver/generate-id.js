import { nativeMethods } from './deps/hammerhead';

// NOTE: We need the additional 'Math.random' part to ensure that the
// method does not generate identical IDs when executed within an array
export default function () {
    return `${nativeMethods.performanceNow()}.${Math.floor(Math.random() * 100000)}`;
}
