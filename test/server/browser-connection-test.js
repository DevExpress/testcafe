const { expect }              = require('chai');
const fetch                   = require('node-fetch');
const { noop }                = require('lodash');
const createTestCafe          = require('../../lib/');
const COMMAND                 = require('../../lib/browser/connection/command');
const browserProviderPool     = require('../../lib/browser/provider/pool');
const BrowserConnectionStatus = require('../../lib/browser/connection/status');

const { createBrowserProviderMock } = require('./helpers/mocks');

describe('Browser connection', function () {
    let testCafe                    = null;
    let connection                  = null;
    let originRemoteBrowserProvider = null;

    const remoteBrowserProviderMock = createBrowserProviderMock();

    before(function () {
        this.timeout(20000);

        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe = tc;

                return browserProviderPool.getProvider('remote');
            })
            .then(function (remoteBrowserProvider) {
                originRemoteBrowserProvider = remoteBrowserProvider;

                browserProviderPool.addProvider('remote', remoteBrowserProviderMock);
            });
    });

    after(function () {
        browserProviderPool.addProvider('remote', originRemoteBrowserProvider);

        return testCafe.close();
    });

    beforeEach(function () {
        return testCafe
            .createBrowserConnection()
            .then(function (bc) {
                connection = bc;
            });
    });

    afterEach(async function () {
        connection._forceIdle();

        await connection.close();
    });

    it('Should fire "ready" event and redirect to idle page once established', function () {
        let eventFired = false;

        connection.on('ready', function () {
            eventFired = true;
        });

        const options = {
            redirect: 'manual',
            headers:  {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                              '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
            },
        };

        return fetch(connection.url, options)
            .then(function (res) {
                expect(eventFired).to.be.true;
                expect(connection.status).eql(BrowserConnectionStatus.opened);
                expect(connection.userAgent).eql('Chrome 41.0.2227.1 / macOS 10.10.1');
                expect(res.status).eql(302);
                expect(res.headers.get('location')).eql(connection.idleUrl);
            });
    });

    it('Should respond with error if connection was established twice', function () {
        return fetch(connection.url)
            .then(() => fetch(connection.url)
                .then(res => {
                    return res.text()
                        .then((body) => {
                            expect(res.status).to.eql(500);
                            expect(body).to.eql('The connection is already established.');
                        });
                })
            );
    });

    it('Should fire "error" event on browser disconnection', function (done) {
        connection.HEARTBEAT_TIMEOUT = 0;

        connection.on('error', function (error) {
            expect(error.message).eql('The Chrome 41.0.2227.1 / macOS 10.10.1 browser disconnected. If you did not ' +
                'close the browser yourself, browser performance or network issues may be at fault.');
            done();
        });

        const options = {
            followRedirect: false,
            headers:        {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                              '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
            },
        };

        fetch(connection.url, options);
    });

    it('Should provide status', function () {
        function createBrowserJobMock (urls) {
            return {
                popNextTestRunInfo: function () {
                    const url = urls.shift();

                    return {
                        url,
                        testRunId: 'testRunId' + url,
                    };
                },

                get hasQueuedTestRuns () {
                    return urls.length;
                },

                once: noop,
                on:   noop,

                warningLog: {
                    copyFrom: noop,
                },
            };
        }

        connection.addJob(createBrowserJobMock(['1', '2']));
        connection.addJob(createBrowserJobMock(['3']));

        function queryStatus () {
            return fetch(connection.statusDoneUrl);
        }

        return fetch(connection.url)
            .then(queryStatus)
            .then(function (res) {
                res.json()
                    .then((body) => {
                        expect(body).eql({
                            cmd:       COMMAND.run,
                            url:       '1',
                            testRunId: 'testRunId1',
                        });
                    });
            })

            .then(queryStatus)
            .then(function (res) {
                res.json()
                    .then((body) => {
                        expect(body).eql({
                            cmd:       COMMAND.run,
                            url:       '2',
                            testRunId: 'testRunId2',
                        });
                    });
            })

            .then(queryStatus)
            .then(function (res) {
                res.json()
                    .then((body) => {
                        expect(body).eql({
                            cmd:       COMMAND.run,
                            url:       '3',
                            testRunId: 'testRunId3',
                        });
                    });
            })

            .then(queryStatus)
            .then(function (res) {
                res.json()
                    .then((body) => {
                        expect(body).eql({
                            cmd:       COMMAND.idle,
                            url:       connection.idleUrl,
                            testRunId: null,
                        });
                    });
            });
    });

    it('Should respond to the service queries with error if not ready', function () {
        let testCases = [
            connection.heartbeatUrl,
            connection.idleUrl,
            connection.statusUrl,
        ];

        testCases = testCases.map(function (url) {
            return fetch(url).then(function (res) {
                expect(res.status).eql(500);
                res.text()
                    .then(body => {
                        expect(body).eql('The connection is not ready yet.');
                    });
            });
        });

        return Promise.all(testCases);
    });

    it('Should set meta information for User-Agent', () => {
        let eventFired = false;

        connection.on('ready', function () {
            eventFired = true;
        });

        const options = {
            followRedirect: false,
            headers:        {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                              '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
            },
        };

        const prettyUserAgentWithMetaInfo = `Chrome 41.0.2227.1 / macOS 10.10.1 (meta-info)`;

        connection.setProviderMetaInfo('meta-info', { appendToUserAgent: true });

        return fetch(connection.url, options)
            .then(() => {
                expect(eventFired).to.be.true;

                expect(connection.browserInfo.userAgentProviderMetaInfo).eql('');
                expect(connection.browserInfo.parsedUserAgent.prettyUserAgent).eql(prettyUserAgentWithMetaInfo);
                expect(connection.userAgent).eql(prettyUserAgentWithMetaInfo);

                // NOTE:
                // set meta info after connection was already established without changing pretty user agent
                connection.setProviderMetaInfo('another meta-info');

                expect(connection.browserInfo.userAgentProviderMetaInfo).eql('another meta-info');
                expect(connection.browserInfo.parsedUserAgent.prettyUserAgent).eql(prettyUserAgentWithMetaInfo);
                expect(connection.userAgent).eql(prettyUserAgentWithMetaInfo + ' (another meta-info)');
            });
    });
});

