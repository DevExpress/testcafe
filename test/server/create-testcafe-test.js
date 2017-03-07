var expect         = require('chai').expect;
var url            = require('url');
var net            = require('net');
var createTestCafe = require('../../lib/');
var exportableLib  = require('../../lib/api/exportable-lib');
var Promise        = require('pinkie');


describe('TestCafe factory function', function () {
    var testCafe = null;
    var server   = null;

    function getTestCafe (hostname, port1, port2) {
        return createTestCafe(hostname, port1, port2)
            .then(function (tc) {
                testCafe = tc;
            });
    }

    afterEach(function () {
        if (server) {
            server.close();
            server = null;
        }

        var promisedClose = testCafe ? testCafe.close() : Promise.resolve();

        testCafe = null;
        return promisedClose;
    });

    it('Should automatically assign host and ports if they are not specified', function () {
        return getTestCafe()
            .then(function () {
                return testCafe.createBrowserConnection();
            })
            .then(function (bc) {
                var bcUrl = url.parse(bc.url);
                var port  = parseInt(bcUrl.port, 10);

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
                var bcUrl = url.parse(bc.url);
                var port  = parseInt(bcUrl.port, 10);

                expect(bcUrl.hostname).eql('localhost');
                expect(port).eql(1338);
            });
    });

    it('Should raise error if specified port is not free', function () {
        var serverListen = new Promise(function (resolve) {
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
                expect(err.message).eql('The specified 1337 port is already in use by another program.');
            });
    });

    it("Should raise error if specified hostname doesn't resolve to the current machine", function () {
        return getTestCafe('example.org')
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('The specified "example.org" hostname cannot be resolved to the current machine.');
            });
    });

    it('Should contain plugin testing, embedding utils and common runtime functions', function () {
        expect(createTestCafe.pluginTestingUtils).to.be.an.object;
        expect(createTestCafe.embeddingUtils).to.be.an.object;
        expect(createTestCafe.Role).eql(exportableLib.Role);
        expect(createTestCafe.ClientFunction).eql(exportableLib.ClientFunction);
    });
});
