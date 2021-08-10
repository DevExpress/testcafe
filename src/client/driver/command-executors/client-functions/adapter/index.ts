import { ClientFunctionAdapter } from '../types';

// @ts-ignore
const adapter: ClientFunctionAdapter = {};

export default adapter;

export function initializeAdapter (initializer: ClientFunctionAdapter): void {
    if (initializer.nativeMethods.objectAssign) {
        initializer.nativeMethods.objectAssign(adapter, initializer);

        return;
    }

    const keys = initializer.nativeMethods.objectKeys(initializer) as (keyof ClientFunctionAdapter)[];

    for (const key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
