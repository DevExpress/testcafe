export function respond404 (res) {
    res.statusCode = 404;
    res.end();
}

export function redirect (res, url) {
    res.statusCode = 302;
    res.setHeader('location', url);
    res.end();
}