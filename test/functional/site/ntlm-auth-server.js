var express = require('express');
var ntlm    = require('express-ntlm');

module.exports = function create (port) {
    var app = express();

    app.use(ntlm());

    app.all('*', function (req, res) {
        res.end('<html><body><div id="result">' + JSON.stringify(req.ntlm) + '</div></body></html>');
    });

    return app.listen(port);
};
