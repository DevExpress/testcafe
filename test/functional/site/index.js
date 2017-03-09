var Server                    = require('./server');
var ProxyServer               = require('./proxy-server');
var createServerWithBasicAuth = require('./basic-auth-server');
var createServerWithNtlmAuth  = require('./ntlm-auth-server');

var server1         = null;
var server2         = null;
var basicAuthServer = null;
var ntlmAuthServer  = null;
var proxyServer     = null;

exports.create = function (port1, port2, port3, port4, port5, viewsPath) {
    server1         = new Server(port1, viewsPath);
    server2         = new Server(port2, viewsPath);
    basicAuthServer = createServerWithBasicAuth(port3);
    ntlmAuthServer  = createServerWithNtlmAuth(port4);
    proxyServer     = new ProxyServer(port5);
};

exports.destroy = function () {
    server1.close();
    server2.close();
    basicAuthServer.close();
    ntlmAuthServer.close();
    proxyServer.close();
};
