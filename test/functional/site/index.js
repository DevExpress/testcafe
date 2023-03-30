/* eslint-disable */
const Server                        = require('./server');
const basicAuthServer               = require('./basic-auth-server');
const ntlmAuthServer                = require('./ntlm-auth-server');
const trustedProxyServer            = require('./trusted-proxy-server');
const transparentProxyServer        = require('./transparent-proxy-server');
const invalidCertificateHttpsServer = require('./invalid-certificate-https-server');

let server1 = null;
let server2 = null;

exports.create = function (ports, viewsPath, wtf) {
    server1 = new Server(ports.server1, viewsPath);
    server2 = new Server(ports.server2, viewsPath);

    basicAuthServer.start(ports.basicAuthServer);
    ntlmAuthServer.start(ports.ntlmAuthServer);

    trustedProxyServer.start(ports.trustedProxyServer);
    transparentProxyServer.start(ports.transparentProxyServer);
    invalidCertificateHttpsServer.start(ports.invalidCertificateHttpsServer);

    console.log('Create servers');
    // wtf.dump();
};

exports.destroy = function (wtf) {
    // wtf.dump();
    console.log('Close 1 server');
    server1.close();
    // wtf.dump();
    console.log('Close 2 server');
    server2.close();
    // wtf.dump();

    console.log('Close basicAuthServer server');
    basicAuthServer.shutdown();
    // wtf.dump();
    console.log('Close ntlmAuthServer server');
    ntlmAuthServer.shutdown();
    // wtf.dump();
    console.log('Close trustedProxyServer server');
    trustedProxyServer.shutdown();
    // wtf.dump();
    console.log('Close transparentProxyServer server');
    transparentProxyServer.shutdown();
    // wtf.dump();
    console.log('Close invalidCertificateHttpsServer server');
    invalidCertificateHttpsServer.shutdown();
    // wtf.dump();
};
