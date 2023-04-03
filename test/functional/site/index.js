/* eslint-disable */
const Server                        = require('./server');
const basicAuthServer               = require('./basic-auth-server');
const ntlmAuthServer                = require('./ntlm-auth-server');
const trustedProxyServer            = require('./trusted-proxy-server');
const transparentProxyServer        = require('./transparent-proxy-server');
const invalidCertificateHttpsServer = require('./invalid-certificate-https-server');

let server1 = null;
let server2 = null;

exports.create = function (ports, viewsPath) {
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

exports.destroy = async function () {
    await server1.close();
    await server2.close();

    await basicAuthServer.shutdown();
    await ntlmAuthServer.shutdown();
    await trustedProxyServer.shutdown();
    await transparentProxyServer.shutdown();
    await invalidCertificateHttpsServer.shutdown();
};
