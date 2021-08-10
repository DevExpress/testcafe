import { ClientFunctionAdapter } from '../types';

// @ts-ignore
const adapter: ClientFunctionAdapter = {};

export default adapter;

export function initializeAdapter (initializer: ClientFunctionAdapter): void {
    if (initializer.nativeMethods.objectAssign)
        return void initializer.nativeMethods.objectAssign(adapter, initializer);

    let keys = initializer.nativeMethods.objectKeys(initializer) as (keyof ClientFunctionAdapter)[];

    for (let key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
