import { CoreUtilsAdapter } from '../types';

// @ts-ignore
const adapter: CoreUtilsAdapter = {};

export default adapter;

export function initializeAdapter (initializer: CoreUtilsAdapter): void {
    if (initializer.nativeMethods.objectAssign)
        return void initializer.nativeMethods.objectAssign(adapter, initializer);

    let keys = initializer.nativeMethods.objectKeys(initializer) as (keyof CoreUtilsAdapter)[];

    for (let key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
