// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default function (value, min, max) {
    return Math.min(Math.max(min, value), max);
}
