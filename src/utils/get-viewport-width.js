import tty from 'tty';

const DEFAULT_VIEWPORT_WIDTH = 78;

export default function (outStream) {
    if (outStream === process.stdout && tty.isatty(1)) {
        var detectedViewportWidth = process.stdout.getWindowSize ?
            process.stdout.getWindowSize(1)[0] :
            tty.getWindowSize()[1];

        return Math.max(detectedViewportWidth, DEFAULT_VIEWPORT_WIDTH);
    }

    return DEFAULT_VIEWPORT_WIDTH;
}
