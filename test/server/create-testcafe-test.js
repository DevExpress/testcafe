var expect         = require('chai').expect;
var url            = require('url');
var net            = require('net');
var createTestCafe = require('../../lib/');

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
        if (testCafe) {
            testCafe.close();
            testCafe = null;
        }

        if (server) {
            server.close();
            server = null;
        }
    });

    it('Should automatically assign host and ports if they are not specified', function (done) {
        getTestCafe()
            .then(function () {
                var bc    = testCafe.createBrowserConnection();
                var bcUrl = url.parse(bc.url);
                var port  = parseInt(bcUrl.port, 10);

                expect(bcUrl.hostname).not.eql('undefined');
                expect(bcUrl.hostname).not.eql('null');
                expect(isNaN(port)).to.be.false;

                done();
            })
            .catch(done);
    });

    it('Should accept custom port and hostname', function (done) {
        getTestCafe('localhost', 1338)
            .then(function () {
                var bc    = testCafe.createBrowserConnection();
                var bcUrl = url.parse(bc.url);
                var port  = parseInt(bcUrl.port, 10);

                expect(bcUrl.hostname).eql('localhost');
                expect(port).eql(1338);

                done();
            })
            .catch(done);
    });

    it('Should raise error if specified port is not free', function (done) {
        server = net.createServer();

        server.listen(1337, function () {
            getTestCafe(null, 1337, 1338)
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The specified 1337 port is already in use by another program.');
                })

                .then(function () {
                    done();
                })
                .catch(done);
        });
    });

    it("Should raise error if specified hostname doesn't resolve to the current machine", function (done) {
        getTestCafe('example.org')
            .then(function () {
                throw new Error('Promise rejection expected');
            })
            .catch(function (err) {
                expect(err.message).eql('The specified "example.org" hostname cannot be resolved to the current machine.');
            })

            .then(function () {
                done();
            })
            .catch(done);
    });
});
