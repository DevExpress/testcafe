const Server                 = require('./server');
const basicAuthServer        = require('./basic-auth-server');
const ntlmAuthServer         = require('./ntlm-auth-server');
const trustedProxyServer     = require('./trusted-proxy-server');
const transparentProxyServer = require('./transparent-proxy-server');

let server1 = null;
let server2 = null;

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
