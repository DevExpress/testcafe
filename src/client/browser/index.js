// TODO: once we'll have client commons load it from there instead of node modules (currently it's leads to two copies of this packages on client)
// TODO: Get rid of Pinkie after dropping IE11
import COMMAND from '../../browser/connection/command';
import HeartbeatStatus from '../../browser/connection/heartbeat-status';
import { HEARTBEAT_INTERVAL } from '../../utils/browser-connection-timeouts';
import SERVICE_ROUTES from '../../browser/connection/service-routes';
import isFileProtocol from '../../shared/utils/is-file-protocol';

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

export function redirectUsingCdp (command, createXHR, openFileProtocolUrl) {
    sendXHR(openFileProtocolUrl, createXHR, { method: 'POST', data: JSON.stringify({ url: command.url }) }); //eslint-disable-line no-restricted-globals
}

export function redirect (command, createXHR, openFileProtocolUrl) {
    stopInitScriptExecution();

    if (isFileProtocol(command.url))
        redirectUsingCdp(command, createXHR, openFileProtocolUrl);
    else
        document.location = command.url;
}

function proxylessCheckRedirecting ({ result }) {
    if (result.cmd === COMMAND.idle)
        return regularCheckRedirecting(result);

    // NOTE: The tested page URL can be the same for a few tests.
    // So, we are forced to return true for all 'run' commands.
    return true;
}

function regularCheckRedirecting (result) {
    return (result.cmd === COMMAND.run || result.cmd === COMMAND.idle)
        && !isCurrentLocation(result.url);
}

async function getStatus ({ statusUrl, openFileProtocolUrl }, createXHR, { manualRedirect, proxyless } = {}) {
    const result      = await sendXHR(statusUrl, createXHR);
    const redirecting = proxyless ? proxylessCheckRedirecting({ result }) : regularCheckRedirecting(result);

    if (redirecting && !manualRedirect)
        redirect(result, createXHR, openFileProtocolUrl);

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
        data:   JSON.stringify({ windowId }), //eslint-disable-line no-restricted-globals
    });
}

export function closeWindow (closeWindowUrl, createXHR, windowId) {
    return sendXHR(closeWindowUrl, createXHR, {
        method: 'POST',
        data:   JSON.stringify({ windowId }), //eslint-disable-line no-restricted-globals
    });
}

export async function dispatchProxylessEvent (dispatchProxylessEventUrl, testCafeUI, createXHR, type, options) {
    await testCafeUI.hide();

    const data = JSON.stringify({ //eslint-disable-line no-restricted-globals
        type,
        options,
    });

    await sendXHR(dispatchProxylessEventUrl, createXHR, {
        method: 'POST',
        data,
    });

    await testCafeUI.show();
}

export async function dispatchProxylessEventSequence (dispatchProxylessEventSequenceUrl, testCafeUI, createXHR, sequence) {
    await testCafeUI.hide();

    await sendXHR(dispatchProxylessEventSequenceUrl, createXHR, {
        method: 'POST',
        data:   JSON.stringify(sequence), //eslint-disable-line no-restricted-globals
    });

    await testCafeUI.show();
}

export function parseSelector (parseSelectorUrl, createXHR, selector) {
    return sendXHR(parseSelectorUrl, createXHR, {
        method: 'POST',
        data:   JSON.stringify({ selector }), //eslint-disable-line no-restricted-globals
    });
}
