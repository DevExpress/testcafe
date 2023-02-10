const FILE_PROTOCOL = 'file://';

function isFileProtocol (url = ''): boolean {
    return url.indexOf(FILE_PROTOCOL) === 0;
}

export default isFileProtocol;
