import COMMAND from '../../browser-connection/command';


const CHECK_STATUS_INTERVAL = 1000;


window.init = function (id, statusUrl) {
    var interval = window.setInterval(function () {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', statusUrl, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var res = JSON.parse(xhr.responseText);

                if (res.cmd === COMMAND.run) {
                    window.clearInterval(interval);
                    document.location = res.url;
                }

                //NOTE: prepare to close the browser
                if (res.cmd === COMMAND.close)
                    document.title = '[' + document.location.toString() + ']';
            }
        };
        xhr.send(null);
    }, CHECK_STATUS_INTERVAL);
};

