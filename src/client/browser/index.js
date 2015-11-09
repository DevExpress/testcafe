import { Promise } from 'es6-promise';
import COMMAND from '../../browser-connection/command';


const HEARTBEAT_INTERVAL = 30 * 1000;


//Utils
// NOTE: the window.XMLHttpRequest may have been wrapped by Hammerhead, while we should send a request to
// the original URL. That's why we need the XMLHttpRequest argument to send the request via native methods.
function sendXHR (url, XMLHttpRequest) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    resolve(xhr.responseText ? JSON.parse(xhr.responseText) : '');
                else
                    reject('disconnected');
            }
        };

        xhr.send(null);
    });
}

function isCurrentLocation (url) {
    return document.location.href.toLowerCase() === url.toLowerCase();
}


//API
export function startHeartbeat (heartbeatUrl, XMLHttpRequest) {
    sendXHR(heartbeatUrl, XMLHttpRequest);

    window.setInterval(() => sendXHR(heartbeatUrl, XMLHttpRequest), HEARTBEAT_INTERVAL);
}

export function checkStatus (statusUrl, XMLHttpRequest) {
    return sendXHR(statusUrl, XMLHttpRequest)
        .then((res) => {
            if (res.cmd === COMMAND.run || res.cmd === COMMAND.idle && !isCurrentLocation(res.url))
                document.location = res.url;

            //NOTE: prepare to close the browser
            if (res.cmd === COMMAND.close)
                document.title = '[' + document.location.toString() + ']';

            return res.cmd;
        });
}

