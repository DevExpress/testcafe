export function respond404 (res) {
    res.statusCode = 404;
    res.end();
}

export function respond500 (res, err) {
    res.statusCode = 500;
    res.end(err || '');
}

export function redirect (res, url) {
    res.statusCode = 302;
    res.setHeader('location', url);
    res.end();
}

export function respondWithJSON (res, data) {
    res.setHeader('content-type', 'application/json');
    res.end(data ? JSON.stringify(data) : '');
}
