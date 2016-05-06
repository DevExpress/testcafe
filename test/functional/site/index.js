var Server = require('./server');


var server1 = null;
var server2 = null;

exports.create = function (port1, port2, viewsPath) {
    server1 = new Server(port1, viewsPath);
    server2 = new Server(port2, viewsPath);
};

exports.destroy = function () {
    server1.close();
    server2.close();
};
