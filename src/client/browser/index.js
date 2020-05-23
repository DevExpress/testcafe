// TODO: once we'll have client commons load it from there instead of node modules (currently it's leads to two copies of this packages on client)
// TODO: Get rid of Pinkie after dropping IE11
import Promise from 'pinkie';
import COMMAND from '../../browser/connection/command';
import HeartbeatStatus from '../../browser/connection/heartbeat-status';
import { UNSTABLE_NETWORK_MODE_HEADER } from '../../browser/connection/unstable-network-mode';
import { HEARTBEAT_INTERVAL } from '../../utils/browser-connection-timeouts';

let allowInitScriptExecution = false;
let retryTestPages           = false;
let heartbeatIntervalId      = null;

const noop  = () => void 0;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const evaluate = eval; // eslint-disable-line no-eval

const FETCH_PAGE_TO_CACHE_RETRY_DELAY = 300;
const FETCH_PAGE_TO_CACHE_RETRY_COUNT = 5;

//Utils
// NOTE: the window.XMLHttpRequest may have been wrapped by Hammerhead, while we should send a request to
// the original URL. That's why we need the XMLHttpRequest argument to send the request via native methods.
export function sendXHR (url, createXHR, { method = 'GET', data = null, parseResponse = true } = {}) {
    return new Promise((resolve, reject) => {
        const xhr = createXHR();

        xhr.open(method, url, true);

        if (isRetryingTestPagesEnabled()) {
            xhr.setRequestHeader(UNSTABLE_NETWORK_MODE_HEADER, 'true');
            xhr.setRequestHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let responseText = xhr.responseText || '';

                    if (responseText && parseResponse)
                        responseText = JSON.parse(xhr.responseText); //eslint-disable-line no-restricted-globals

                    resolve(responseText);
                }
                else
                    reject('disconnected');
            }
        };

        xhr.send(data);
    });
}

function isCurrentLocation (url) {
    /*eslint-disable no-restricted-properties*/
    return document.location.href.toLowerCase() === url.toLowerCase();
    /*eslint-enable no-restricted-properties*/
}


//API
export function startHeartbeat (heartbeatUrl, createXHR) {
    function heartbeat () {
        sendXHR(heartbeatUrl, createXHR)
            .then(status => {
                if (status.code === HeartbeatStatus.closing && !isCurrentLocation(status.url)) {
                    stopInitScriptExecution();
                    document.location = status.url;
                }
            });
    }

    heartbeatIntervalId = window.setInterval(heartbeat, HEARTBEAT_INTERVAL);

    heartbeat();
}

export function stopHeartbeat () {
    window.clearInterval(heartbeatIntervalId);
}

function executeInitScript (initScriptUrl, createXHR) {
    if (!allowInitScriptExecution)
        return;

    sendXHR(initScriptUrl, createXHR)
        .then(res => {
            if (!res.code)
                return null;

            return sendXHR(initScriptUrl, createXHR, { method: 'POST', data: JSON.stringify(evaluate(res.code)) }); //eslint-disable-line no-restricted-globals
        })
        .then(() => {
            window.setTimeout(() => executeInitScript(initScriptUrl, createXHR), 1000);
        });
}

export function startInitScriptExecution (initScriptUrl, createXHR) {
    allowInitScriptExecution = true;

    executeInitScript(initScriptUrl, createXHR);
}

export function stopInitScriptExecution () {
    allowInitScriptExecution = false;
}

export function redirect (command) {
    stopInitScriptExecution();
    document.location = command.url;
}

export function fetchPageToCache (pageUrl, createXHR) {
    const requestAttempt = () => sendXHR(pageUrl, createXHR, { parseResponse: false });
    const retryRequest   = () => delay(FETCH_PAGE_TO_CACHE_RETRY_DELAY).then(requestAttempt);

    let fetchPagePromise = requestAttempt();

    for (let i = 0; i < FETCH_PAGE_TO_CACHE_RETRY_COUNT; i++)
        fetchPagePromise = fetchPagePromise.catch(retryRequest);

    return fetchPagePromise.catch(noop);
}

export function checkStatus (statusUrl, createXHR, opts) {
    const { manualRedirect } = opts || {};

    return sendXHR(statusUrl, createXHR)
        .then(result => {
            let ensurePagePromise = Promise.resolve();

            if (result.url && isRetryingTestPagesEnabled())
                ensurePagePromise = fetchPageToCache(result.url, createXHR);

            return ensurePagePromise.then(() => result);
        })
        .then(result => {
            const redirecting = (result.cmd === COMMAND.run || result.cmd === COMMAND.idle) && !isCurrentLocation(result.url);

            if (redirecting && !manualRedirect)
                redirect(result);

            return { command: result, redirecting };
        });
}

export function enableRetryingTestPages () {
    retryTestPages = true;
}

export function disableRetryingTestPages () {
    retryTestPages = false;
}

export function isRetryingTestPagesEnabled () {
    return retryTestPages;
}

export function getActiveWindowId (activeWindowIdUrl, createXHR) {
    return sendXHR(activeWindowIdUrl, createXHR);
}

export function setActiveWindowId (activeWindowIdUrl, createXHR, windowId) {
    return sendXHR(activeWindowIdUrl, createXHR, {
        method: 'POST',
        data:   JSON.stringify({ windowId }) //eslint-disable-line no-restricted-globals
    });
}
