import sanitizeFilename from 'sanitize-filename';

export default function escapeUserAgent (userAgent) {
    return sanitizeFilename(userAgent).replace(/\s+/g, '_');
}
