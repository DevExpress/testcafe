// @ts-ignore
import { nativeMethods, Promise } from '../../client/driver/deps/hammerhead';

export default function delay (ms: number): Promise<void> {
    const setTimeout = nativeMethods.setTimeout;

    return new Promise((resolve: () => void) => setTimeout(resolve, ms));
}
