import { ClientFunctionAdapter } from '../types';

// @ts-ignore
const adapter: ClientFunctionAdapter = {};

export default adapter;

export function initializeAdapter (initializer: ClientFunctionAdapter): void {
    initializer.nativeMethods.objectAssign(adapter, initializer);
}
