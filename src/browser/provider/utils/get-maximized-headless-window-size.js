const DEFAULT_MAXIMIZED_HEADLESS_WINDOW_SIZE = '1920x1080';

export default function () {
    const sizeString = process.env.MAXIMIZED_HEADLESS_WINDOW_SIZE || DEFAULT_MAXIMIZED_HEADLESS_WINDOW_SIZE;

    const { 0: width, 1: height } = sizeString.split('x').map(str => Number(str));

    return { width, height };
}
