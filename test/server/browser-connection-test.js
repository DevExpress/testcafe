const { expect }              = require('chai');
const { promisify }           = require('util');
const request                 = require('request');
const createTestCafe          = require('../../lib/');
const COMMAND                 = require('../../lib/browser/connection/command');
const browserProviderPool     = require('../../lib/browser/provider/pool');
const BrowserConnectionStatus = require('../../lib/browser/connection/status');

const promisedRequest = promisify(request);

describe('Browser connection', function () {
    let testCafe                  = null;
    let connection                = null;
    let origRemoteBrowserProvider = null;

    const remoteBrowserProviderMock = {
        openBrowser: function () {
            return Promise.resolve();
        },

        closeBrowser: function () {
            return Promise.resolve();
        }
    };

    before(function () {
        this.timeout(20000);

        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe = tc;

                return browserProviderPool.getProvider('remote');
            })
            .then(function (remoteBrowserProvider) {
                origRemoteBrowserProvider = remoteBrowserProvider;

                browserProviderPool.addProvider('remote', remoteBrowserProviderMock);
            });
    });

    after(function () {
        browserProviderPool.addProvider('remote', origRemoteBrowserProvider);

        return testCafe.close();
    });

    beforeEach(function () {
        return testCafe
            .createBrowserConnection()
            .then(function (bc) {
                connection = bc;
            });
    });

    afterEach(function () {
        connection._forceIdle();
        connection.close();
    });

    it('Should fire "ready" event and redirect to idle page once established', function () {
        let eventFired = false;

        connection.on('ready', function () {
            eventFired = true;
        });

        const options = {
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
                expect(connection.status).eql(BrowserConnectionStatus.opened);
                expect(connection.userAgent).eql('Chrome 41.0.2227.1 / macOS 10.10.1');
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
            expect(error.message).eql('The Chrome 41.0.2227.1 / macOS 10.10.1 browser disconnected. This problem may ' +
                                      'appear when a browser hangs or is closed, or due to network issues.');
            done();
        });

        const options = {
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
                    const url = urls.shift();

                    return url;
                },

                get hasQueuedTestRuns () {
                    return urls.length;
                },

                once: function () {
                    // Do nothing =)
                },

                on: function () {
                    // Do nothing
                }
            };
        }

        connection.addJob(createBrowserJobMock(['1', '2']));
        connection.addJob(createBrowserJobMock(['3']));

        function queryStatus () {
            return promisedRequest(connection.statusDoneUrl);
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
        let testCases = [
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

