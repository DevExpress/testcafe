// TODO: once we'll have client commons load it from there instead of node modules (currently it's leads to two copies of this packages on client)
// TODO: Get rid of Pinkie after dropping IE11
import COMMAND from '../../browser/connection/command';
import HeartbeatStatus from '../../browser/connection/heartbeat-status';
import { HEARTBEAT_INTERVAL } from '../../utils/browser-connection-timeouts';
import SERVICE_ROUTES from '../../browser/connection/service-routes';

/*eslint-disable no-restricted-properties*/
const LOCATION_HREF   = document.location.href;
const LOCATION_ORIGIN = document.location.origin;
/*eslint-enable no-restricted-properties*/

const STATUS_RETRY_DELAY = 1000;
const MAX_STATUS_RETRY   = 5;

const SERVICE_WORKER_LOCATION = LOCATION_ORIGIN + SERVICE_ROUTES.serviceWorker;

let allowInitScriptExecution = false;
let heartbeatIntervalId      = null;

const evaluate = eval; // eslint-disable-line no-eval

//Utils
export function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// NOTE: the window.XMLHttpRequest may have been wrapped by Hammerhead, while we should send a request to
// the original URL. That's why we need the XMLHttpRequest argument to send the request via native methods.
export function sendXHR (url, createXHR, { method = 'GET', data = null, parseResponse = true } = {}) {
    return new Promise((resolve, reject) => {
        const xhr = createXHR();

        xhr.open(method, url, true);

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
    return LOCATION_HREF.toLowerCase() === url.toLowerCase();
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

async function getStatus (statusUrl, createXHR, { manualRedirect } = {}) {
    const result = await sendXHR(statusUrl, createXHR);

    const redirecting = (result.cmd === COMMAND.run || result.cmd === COMMAND.idle) && !isCurrentLocation(result.url);

    if (redirecting && !manualRedirect)
        redirect(result);

    return { command: result, redirecting };
}

async function tryGetStatus (...args) {
    try {
        return await getStatus(...args);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        return { error };
    }
}

export async function checkStatus (...args) {
    let error  = null;
    let result = null;

    for (let i = 0; i < MAX_STATUS_RETRY; i++) {
        ({ error, ...result } = await tryGetStatus(...args));

        if (!error)
            return result;

        await delay(STATUS_RETRY_DELAY);
    }

    throw error;
}

export async function enableRetryingTestPages () {
    if (!navigator.serviceWorker)
        return;

    try {
        await navigator.serviceWorker.register(SERVICE_WORKER_LOCATION, { scope: LOCATION_ORIGIN });

        await navigator.serviceWorker.ready;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
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
