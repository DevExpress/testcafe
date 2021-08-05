import { CoreUtilsAdapter } from '../types';

// @ts-ignore
const adapter: CoreUtilsAdapter = {};

export default adapter;

export function initializeAdapter (initializer: CoreUtilsAdapter): void {
    initializer.nativeMethods.objectAssign(adapter, initializer);
}
