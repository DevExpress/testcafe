var expect            = require('chai').expect;
var Promise           = require('es6-promise').Promise;
var promisify         = require('es6-promisify');
var request           = require('request');
var TestCafe          = require('../../lib/');
var BrowserConnection = require('../../lib/browser-connection');
var COMMAND           = require('../../lib/browser-connection/command');


var promisedRequest = promisify(request);


describe('Browser connection', function () {
    var testCafe   = null;
    var connection = null;


    // Fixture setup/teardown
    before(function () {
        testCafe = new TestCafe(1335, 1336);
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
    it('Should fire "ready" event and redirect to idle page once established', function (done) {
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

        request(options, function (err, res) {
            expect(eventFired).to.be.true;
            expect(connection.ready).to.be.true;
            expect(connection.userAgent.toAgent()).eql('Chrome 41.0.2227');
            expect(res.statusCode).eql(302);
            expect(res.headers['location']).eql(connection.idleUrl);

            done();
        });
    });

    it('Should respond with error if connection was established twice', function (done) {
        promisedRequest(connection.url)
            .then(function () {
                return promisedRequest(connection.url);
            })
            .then(function (res) {
                expect(res[0].statusCode).eql(500);
                expect(res[1]).eql('The connection is already established.');
                done();
            })
            .catch(done);
    });

    it('Should fire "error" event on browser disconnection', function (done) {
        var savedHeartbeatTimeout = BrowserConnection.HEARTBEAT_TIMEOUT;

        BrowserConnection.HEARTBEAT_TIMEOUT = 0;

        connection.on('error', function (msg) {
            expect(msg).eql('The Chrome 41.0.2227 / Mac OS X 10.10.1 browser disconnected. This problem may ' +
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

        request(options, function () {
            BrowserConnection.HEARTBEAT_TIMEOUT = savedHeartbeatTimeout;
        });
    });

    it('Should provide status', function (done) {
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

        promisedRequest(connection.url)

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res[1])).eql({ cmd: COMMAND.run, url: '1' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res[1])).eql({ cmd: COMMAND.run, url: '2' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res[1])).eql({ cmd: COMMAND.run, url: '3' });
            })

            .then(queryStatus)
            .then(function (res) {
                expect(JSON.parse(res[1])).eql({ cmd: COMMAND.idle, url: connection.idleUrl });
                done();
            })

            .catch(done);
    });

    it('Should respond to the service queries with error if not ready', function (done) {
        var testCases = [
            connection.heartbeatUrl,
            connection.idleUrl,
            connection.statusUrl
        ];

        testCases = testCases.map(function (url) {
            return promisedRequest(url).then(function (res) {
                expect(res[0].statusCode).eql(500);
                expect(res[1]).eql('The connection is not ready yet.');
            });
        });

        Promise.all(testCases)
            .then(function () {
                done();
            })
            .catch(done);
    });
});

