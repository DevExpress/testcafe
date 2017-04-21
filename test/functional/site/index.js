var Server                 = require('./server');
var basicAuthServer        = require('./basic-auth-server');
var ntlmAuthServer         = require('./ntlm-auth-server');
var trustedProxyServer     = require('./trusted-proxy-server');
var transparentProxyServer = require('./transparent-proxy-server');

var server1 = null;
var server2 = null;

exports.create = function (ports, viewsPath) {
    server1 = new Server(ports.server1, viewsPath);
    server2 = new Server(ports.server2, viewsPath);

    basicAuthServer.start(ports.basicAuthServer);
    ntlmAuthServer.start(ports.ntlmAuthServer);

    trustedProxyServer.start(ports.trustedProxyServer);
    transparentProxyServer.start(ports.transparentProxyServer);
};

exports.destroy = function () {
    server1.close();
    server2.close();
    basicAuthServer.shutdown();
    ntlmAuthServer.shutdown();
    trustedProxyServer.shutdown();
    transparentProxyServer.shutdown();
};
