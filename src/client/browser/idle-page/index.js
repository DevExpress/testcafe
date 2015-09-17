import * as browser from '../';


const CHECK_STATUS_INTERVAL = 1000;


window.init = function (statusUrl) {
    browser.checkStatus(statusUrl, window.XMLHttpRequest);

    window.setInterval(function () {
        browser.checkStatus(statusUrl, window.XMLHttpRequest);
    }, CHECK_STATUS_INTERVAL);
};

