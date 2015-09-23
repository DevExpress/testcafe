import * as browser from '../';
import COMMAND from '../../../browser-connection/command';


const CHECK_STATUS_INTERVAL = 1000;


var interval = null;

function checkStatus (statusUrl) {
    browser
        .checkStatus(statusUrl, window.XMLHttpRequest)
        .then((cmd) => {
            if (cmd !== COMMAND.idle)
                window.clearInterval(interval);
        });
}

window.init = function (statusUrl) {
    interval = window.setInterval(() => checkStatus(statusUrl), CHECK_STATUS_INTERVAL);

    checkStatus(statusUrl);
};

