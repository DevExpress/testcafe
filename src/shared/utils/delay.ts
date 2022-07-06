import { adapter } from '../adapter';
// @ts-ignore
import { nativeMethods } from '../../client/driver/deps/hammerhead';

export default function delay (ms: number): Promise<void> {
    const setTimeout = nativeMethods.setTimeout;

    return new adapter.PromiseCtor((resolve: () => void) => setTimeout(resolve, ms));
}
