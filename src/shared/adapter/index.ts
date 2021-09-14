import { SharedAdapter } from '../types';

// @ts-ignore
export const adapter: SharedAdapter = { };

export function initializeAdapter (initializer: SharedAdapter): void {
    if (initializer.nativeMethods.objectAssign) {
        initializer.nativeMethods.objectAssign(adapter, initializer);

        return;
    }

    const keys = initializer.nativeMethods.objectKeys(initializer) as (keyof SharedAdapter)[];

    for (const key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
