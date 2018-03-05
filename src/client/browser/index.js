// TODO: once we'll have client commons load it from there instead of node modules (currently it's leads to two copies of this packages on client)
import Promise from 'pinkie';
import COMMAND from '../../browser/connection/command';
import STATUS from '../../browser/connection/status';

const HEARTBEAT_INTERVAL = 2 * 1000;

var allowInitScriptExecution = false;

//Utils
// NOTE: the window.XMLHttpRequest may have been wrapped by Hammerhead, while we should send a request to
// the original URL. That's why we need the XMLHttpRequest argument to send the request via native methods.
function sendXHR (url, createXHR, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        var xhr = createXHR();

        xhr.open(method, url, true);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    resolve(xhr.responseText ? JSON.parse(xhr.responseText) : ''); //eslint-disable-line no-restricted-globals
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
            return sendXHR(initScriptUrl, createXHR, 'POST', JSON.stringify(eval(res.code)));
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

export function checkStatus (statusUrl, createXHR) {
    return sendXHR(statusUrl, createXHR)
        .then(res => {
            if (res.cmd === COMMAND.run || res.cmd === COMMAND.idle && !isCurrentLocation(res.url)) {
                stopInitScriptExecution();
                document.location = res.url;
            }

            return res.cmd;
        });
}

