const LOCALHOST_NAMES = [
    'localhost',
    '127.0.0.1',
    '[::1]'
];

export default function (hostname) {
    return LOCALHOST_NAMES.includes(hostname);
}
