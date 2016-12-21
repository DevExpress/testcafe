var express = require('express');

var app = express();

app.all('*', function (req, res) {
    res.end('<html><body><div id="result">Test</div></body></html>');

    setTimeout(function () {
        /* eslint-disable no-process-exit */
        process.exit(1);
        /* eslint-enable no-process-exit */
    }, 30);
});

app.listen(3025);
