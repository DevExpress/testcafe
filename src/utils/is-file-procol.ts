const FILE_PROTOCOL_ORIGIN = 'file://';

export default function isFileProtocol (url = ''): boolean {
    return url.indexOf(FILE_PROTOCOL_ORIGIN) === 0;
}
