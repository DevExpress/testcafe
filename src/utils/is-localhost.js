const localhostNames = [
    'localhost',
    '127.0.0.1'
];

export default function (hostname) {
    return localhostNames.includes(hostname);
}
