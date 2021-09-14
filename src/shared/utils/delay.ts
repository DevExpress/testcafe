import { adapter } from '../adapter';

export default function delay (ms: number): Promise<void> {
    const setTimeout = adapter.nativeMethods.setTimeout;

    return new adapter.PromiseCtor((resolve: () => void) => setTimeout(resolve, ms));
}
