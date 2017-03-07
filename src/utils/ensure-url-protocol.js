const PROTOCOL_RE          = /^(https?|file):\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

export default function ensureUrlProtocol (url) {
    if (!PROTOCOL_RE.test(url) && url !== 'about:blank') {
        var protocol = IMPLICIT_PROTOCOL_RE.test(url) ? 'http:' : 'http://';

        url = protocol + url;
    }

    return url;
}
