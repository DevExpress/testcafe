import { SharedAdapter } from '../types';

// @ts-ignore
export const adapter: SharedAdapter = { };

export function initializeAdapter (initializer: SharedAdapter): void {
    // eslint-disable-next-line no-restricted-globals
    const keys = Object.keys(initializer) as (keyof SharedAdapter)[];

    for (const key of keys)
        // @ts-ignore
        adapter[key] = initializer[key];
}
