var Server                 = require('./server');
var basicAuthServer        = require('./basic-auth-server');
var ntlmAuthServer         = require('./ntlm-auth-server');
var anonymProxyServer      = require('./anonym-proxy');
var transparentProxyServer = require('./transparent-proxy');

var server1 = null;
var server2 = null;

exports.create = function (ports, viewsPath) {
    server1 = new Server(ports.server1, viewsPath);
    server2 = new Server(ports.server2, viewsPath);

    basicAuthServer.start(ports.basicAuthServer);
    ntlmAuthServer.start(ports.ntlmAuthServer);

    anonymProxyServer.start(ports.anonymProxy);
    transparentProxyServer.start(ports.transparentProxy);
};

exports.destroy = function () {
    server1.close();
    server2.close();
    basicAuthServer.shutdown();
    ntlmAuthServer.shutdown();
    anonymProxyServer.shutdown();
    transparentProxyServer.shutdown();
};
