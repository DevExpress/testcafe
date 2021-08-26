import { CoreUtilsAdapter } from '../types';

// @ts-ignore
const adapter: CoreUtilsAdapter = {};

export default adapter;

export function initializeAdapter (initializer: CoreUtilsAdapter): void {
    if (initializer.nativeMethods.objectAssign) {
        initializer.nativeMethods.objectAssign(adapter, initializer);

        return;
    }

    const keys = initializer.nativeMethods.objectKeys(initializer) as (keyof CoreUtilsAdapter)[];

    for (const key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
