const LOCALHOST_NAMES = [
    'localhost',
    '127.0.0.1',
    '[::1]'
];

export default function (hostname: string): boolean {
    return LOCALHOST_NAMES.includes(hostname);
}
