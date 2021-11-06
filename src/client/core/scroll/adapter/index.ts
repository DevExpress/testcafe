import { ScrollCoreAdapter } from '../types';

// @ts-ignore
const emptyAdapter: ScrollCoreAdapter = {};

export default emptyAdapter;

export function initializeAdapter (initializer: ScrollCoreAdapter): void {
    // eslint-disable-next-line no-restricted-globals
    const keys = Object.keys(initializer) as (keyof ScrollCoreAdapter)[];

    for (const key of keys)
        // @ts-ignore
        emptyAdapter[key] = initializer[key];
}
