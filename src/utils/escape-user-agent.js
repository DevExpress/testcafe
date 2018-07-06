import sanitizeFilename from 'sanitize-filename';

export default function escapeUserAgent (userAgent) {
    return sanitizeFilename(userAgent.toString()).replace(/\s+/g, '_');
}
