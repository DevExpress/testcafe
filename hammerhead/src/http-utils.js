import Promise from 'promise';

export function respond404 (res) {
    res.statusCode = 404;
    res.end();
}

export function respond500 (res, err) {
    res.statusCode = 500;
    res.end(err || '');
}

export function respondWithJSON (res, data, skipContentType) {
    if (!skipContentType)
        res.setHeader('content-type', 'application/json');

    res.end(data ? JSON.stringify(data) : '');
}

export function fetchBody (r) {
    return new Promise((resolve) => {
        var chunks = [];

        r.on('data', (chunk) => chunks.push(chunk));
        r.on('end', () => resolve(Buffer.concat(chunks)));
    });
}