import tty from 'tty';

const DEFAULT_VIEWPORT_WIDTH = 78;

export default function (isTTY) {
    if (isTTY && tty.isatty(1) && tty.isatty(2)) {
        return process.stdout.getWindowSize ?
               process.stdout.getWindowSize(1)[0] :
               tty.getWindowSize()[1];
    }

    return DEFAULT_VIEWPORT_WIDTH;
}
