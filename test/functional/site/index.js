var Server                    = require('./server');
var createServerWithBasicAuth = require('./basic-auth-server');
var createServerWithNtlmAuth  = require('./ntlm-auth-server');

var server1         = null;
var server2         = null;
var basicAuthServer = null;
var ntlmAuthServer  = null;

exports.create = function (port1, port2, port3, port4, viewsPath) {
    server1         = new Server(port1, viewsPath);
    server2         = new Server(port2, viewsPath);
    basicAuthServer = createServerWithBasicAuth(port3);
    ntlmAuthServer  = createServerWithNtlmAuth(port4);
};

exports.destroy = function () {
    server1.close();
    server2.close();
    basicAuthServer.close();
    ntlmAuthServer.close();
};

exports.addUrlToHub = function (url) {
    server1.addUrlToHub(url);
};

exports.waitHubEstablish = function () {
    return server1.waitHubEstablish();
};
