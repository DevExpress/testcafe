// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export const HEARTBEAT_TIMEOUT       = 2 * 60 * 1000;
export const BROWSER_RESTART_TIMEOUT = 60 * 1000;

export const HEARTBEAT_INTERVAL = 2 * 1000;

export const CHECK_IFRAME_DRIVER_LINK_DELAY  = 500;
export const SEND_STATUS_REQUEST_TIME_LIMIT  = 5000;
export const SEND_STATUS_REQUEST_RETRY_DELAY = 300;
export const SEND_STATUS_REQUEST_RETRY_COUNT = Math.floor(HEARTBEAT_TIMEOUT / SEND_STATUS_REQUEST_RETRY_DELAY - 1);
export const CHECK_STATUS_RETRY_DELAY        = 1000;
