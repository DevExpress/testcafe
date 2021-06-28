const expect                = require('chai').expect;
const url                   = require('url');
const net                   = require('net');
const path                  = require('path');
const createTestCafe        = require('../../lib/');
const exportableLib         = require('../../lib/api/exportable-lib');
const selfSignedCertificate = require('openssl-self-signed-certificate');

describe('TestCafe factory function', function () {
    let testCafe = null;
    let server   = null;

    function getTestCafe (hostname, port1, port2, ssl, developmentMode, retryTestPages, cache, configPath) {
        return createTestCafe(hostname, port1, port2, ssl, developmentMode, retryTestPages, cache, configPath)
            .then(tc => {
                testCafe = tc;
            });
    }

    afterEach(function () {
        if (server) {
            server.close();
            server = null;
        }

        const promisedClose = testCafe ? testCafe.close() : Promise.resolve();

        testCafe = null;
        return promisedClose;
    });

    it('Should automatically assign host and ports if they are not specified', function () {
        return getTestCafe()
            .then(function () {
                return testCafe.createBrowserConnection();
            })
            .then(function (bc) {
                const bcUrl = url.parse(bc.url);
                const port  = parseInt(bcUrl.port, 10);

                expect(bcUrl.hostname).not.eql('undefined');
                expect(bcUrl.hostname).not.eql('null');
                expect(isNaN(port)).to.be.false;
            });
    });

    it('Should accept custom port and hostname', function () {
        return getTestCafe('localhost', 1338)
            .then(function () {
                return testCafe.createBrowserConnection();
            })
            .then(function (bc) {
                const bcUrl = url.parse(bc.url);
                const port  = parseInt(bcUrl.port, 10);

                expect(bcUrl.hostname).eql('localhost');
                expect(port).eql(1338);
            });
    });

    it('Should raise error if specified port is not free', function () {
        const serverListen = new Promise(function (resolve) {
            server = net.createServer();

            server.listen(1337, resolve);
        });

        return serverListen
            .then(function () {
                return getTestCafe(null, 1337, 1338);
            })
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Port 1337 is occupied by another process.');
            });
    });

    it("Should raise error if specified hostname doesn't resolve to the current machine", function () {
        return getTestCafe('example.org')
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('Cannot resolve hostname "example.org".');
            });
    });

    it('Should contain embedding utils and common runtime functions', function () {
        expect(createTestCafe.embeddingUtils).to.be.ok;
        expect(createTestCafe.Role).eql(exportableLib.Role);
        expect(createTestCafe.ClientFunction).eql(exportableLib.ClientFunction);
    });

    it('Should pass sslOptions to proxy', () => {
        const sslOptions = {
            key:  selfSignedCertificate.key,
            cert: selfSignedCertificate.cert
        };

        return getTestCafe('localhost', 1338, 1339, sslOptions)
            .then(() => {
                expect(testCafe.proxy.server1.key).eql(sslOptions.key);
                expect(testCafe.proxy.server1.cert).eql(sslOptions.cert);
                expect(testCafe.proxy.server2.key).eql(sslOptions.key);
                expect(testCafe.proxy.server2.cert).eql(sslOptions.cert);
            });
    });

    describe('Custom Testcafe Config Path', () => {
        it('Custom config path is used', () => {
            const configFile = 'custom.testcaferc.json';

            return getTestCafe('localhost', 1338, 1339, null, null, null, null, configFile)
                .then(() => {
                    expect(path.basename(testCafe.configuration.filePath)).eql(configFile);
                });
        });

        it('Reverts back to default when not specified', () => {
            const defaultConfigFile = '.testcaferc.json';

            return getTestCafe('localhost', 1338, 1339)
                .then(() => {
                    expect(path.basename(testCafe.configuration.filePath)).eql(defaultConfigFile);
                });
        });

        it('Works when created using null', () => {
            const defaultConfigFile = '.testcaferc.json';

            return createTestCafe(null)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    expect(path.basename(testCafe.configuration.filePath)).eql(defaultConfigFile);
                });
        });
    });
});
