// TODO: once we'll have client commons load it from there instead of node modules (currently it's leads to two copies of this packages on client)
import Promise from 'pinkie';
import COMMAND from '../../browser/connection/command';
import STATUS from '../../browser/connection/status';

const HEARTBEAT_INTERVAL = 2 * 1000;

var allowInitScriptExecution = false;

//Utils
// NOTE: the window.XMLHttpRequest may have been wrapped by Hammerhead, while we should send a request to
// the original URL. That's why we need the XMLHttpRequest argument to send the request via native methods.
export function sendXHR (url, createXHR,  { method = 'GET', data = null, parseResponse = true, addAcceptHeader = false } = {}) {
    return new Promise((resolve, reject) => {
        var xhr = createXHR();

        xhr.open(method, url, true);

        if (addAcceptHeader)
            xhr.setRequestHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    resolve(xhr.responseText ? (parseResponse ? JSON.parse(xhr.responseText) : xhr.responseText) : ''); //eslint-disable-line no-restricted-globals
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
                if (status.code === STATUS.closing && !isCurrentLocation(status.url)) {
                    stopInitScriptExecution();
                    document.location = status.url;
                }
            });
    }

    window.setInterval(heartbeat, HEARTBEAT_INTERVAL);

    heartbeat();
}

function executeInitScript (initScriptUrl, createXHR) {
    if (!allowInitScriptExecution)
        return;

    sendXHR(initScriptUrl, createXHR)
        .then(res => {
            if (!res.code)
                return null;

            /* eslint-disable no-eval,  no-restricted-globals*/
            return sendXHR(initScriptUrl, createXHR, { method: 'POST', data: JSON.stringify(eval(res.code)) });
            /* eslint-enable no-eval, no-restricted-globals */
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

export function checkStatus (statusUrl, createXHR, opts) {
    const { manualRedirect } = opts || {};

    let result = null;

    return sendXHR(statusUrl, createXHR)
        .then(res => {
            result = res;

            if (!result.url)
                return Promise.resolve();

            return sendXHR(result.url, createXHR, { parseResponse: false, addAcceptHeader: true })
                .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => sendXHR(result.url, createXHR, { parseResponse: false, addAcceptHeader: true })))
                .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => sendXHR(result.url, createXHR, { parseResponse: false, addAcceptHeader: true })))
                .catch(() => {});
        })
        .then(() => {
            redirecting = (result.cmd === COMMAND.run || result.cmd === COMMAND.idle) && !isCurrentLocation(result.url);

            if (redirecting && !manualRedirect)
                redirect(result);

            return { command: result, redirecting };
        });
}

