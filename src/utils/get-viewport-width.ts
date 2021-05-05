import tty, { WriteStream } from 'tty';
import { Stream } from 'stream';

const DEFAULT_VIEWPORT_WIDTH = 78;

export default function (outStream: Stream): number {
    if (outStream === process.stdout && tty.isatty(1)) {
        const detectedViewportWidth = process.stdout.getWindowSize ?
            process.stdout.getWindowSize()[0] :
            (tty as unknown as WriteStream).getWindowSize()[1];

        return Math.max(detectedViewportWidth, DEFAULT_VIEWPORT_WIDTH);
    }

    return DEFAULT_VIEWPORT_WIDTH;
}
