var expect         = require('chai').expect;
var Promise        = require('es6-promise').Promise;
var promisify      = require('es6-promisify');
var request        = require('request');
var createTestCafe = require('../../lib/');
var COMMAND        = require('../../lib/browser-connection/command');

function promisedRequest (opts) {
    return promisify(request)(opts)
        .then(function (result) {
            return result[0];
        });
}

describe('Browser connection', function () {
    var testCafe   = null;
    var connection = null;


    // Fixture setup/teardown
    before(function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe = tc;
            });
    });

    after(function () {
        testCafe.close();
    });


    // Test setup/teardown
    beforeEach(function () {
        connection = testCafe.createBrowserConnection();
    });

    afterEach(function () {
        connection.close();
    });


    // Tests
    it('Should fire "ready" event and redirect to idle page once established', function () {
        var eventFired = false;

        connection.on('ready', function () {
            eventFired = true;
        });

        var options = {
            url:            connection.url,
            followRedirect: false,
            headers:        {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                              '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
            }
        };

        return promisedRequest(options)
            .then(function (res) {
                expect(eventFired).to.be.true;
                expect(connection.ready).to.be.true;
                expect(connection.userAgent).eql('Chrome 41.0.2227 / Mac OS X 10.10.1');
                expect(res.statusCode).eql(302);
                expect(res.headers['location']).eql(connection.idleUrl);
            });
    });

    it('Should respond with error if connection was established twice', function () {
        return promisedRequest(connection.url)
            .then(function () {
                return promisedRequest(connection.url);
            })
            .then(function (res) {
                expect(res.statusCode).eql(500);
                expect(res.body).eql('The connection is already established.');
            });
    });

    it('Should fire "error" event on browser disconnection', function (done) {
        connection.HEARTBEAT_TIMEOUT = 0;

        connection.on('error', function (error) {
            expect(error.message).eql('The Chrome 41.0.2227 / Mac OS X 10.10.1 browser disconnected. This problem may ' +
                                      'appear when a browser hangs or is closed, or due to network issues.');
            done();
        });

        var options = {
            url:            connection.url,
            followRedirect: false,
            headers:        {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                              '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
            }
        };

        request(options);
    });

    it('Should provide status', function () {
        function createBrowserJobMock (urls) {
            return {
                popNextTestRunUrl: function () {
                    var url = urls.shift();

                    return url;
                },

                get hasQueuedTestRuns () {
                    return urls.length;
                },

                once: function () {
                    // Do nothing =)
                }
            };
        }

        connection.addJob(createBrowserJobMock(['1', '2']));
        connection.addJob(createBrowserJobMock(['3']));

        function queryStatus () {
            return promisedRequest(connection.statusUrl);
        }

        return promisedRequest(connection.url)

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res.body)).eql({ cmd: COMMAND.run, url: '1' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res.body)).eql({ cmd: COMMAND.run, url: '2' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res.body)).eql({ cmd: COMMAND.run, url: '3' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res.body)).eql({ cmd: COMMAND.idle, url: connection.idleUrl });
            });
    });

    it('Should respond to the service queries with error if not ready', function () {
        var testCases = [
            connection.heartbeatUrl,
            connection.idleUrl,
            connection.statusUrl
        ];

        testCases = testCases.map(function (url) {
            return promisedRequest(url).then(function (res) {
                expect(res.statusCode).eql(500);
                expect(res.body).eql('The connection is not ready yet.');
            });
        });

        return Promise.all(testCases);
    });
});

