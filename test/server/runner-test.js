var expect            = require('chai').expect;
var request           = require('request');
var TestCafe          = require('../../lib/');
var Bootsrapper       = require('../../lib/runner/bootstrapper');
var BrowserConnection = require('../../lib/browser-connection');


describe('Runner', function () {
    var testCafe = null;
    var runner   = null;


    // Fixture setup/teardown
    before(function () {
        testCafe = new TestCafe(1335, 1336);
    });

    after(function () {
        testCafe.close();
    });


    // Test setup/teardown
    beforeEach(function () {
        runner = testCafe.createRunner();
    });


    describe('.browsers()', function () {
        it('Should accept target browsers in different forms', function () {
            var connection1  = testCafe.createBrowserConnection();
            var connection2  = testCafe.createBrowserConnection();
            var connection3  = testCafe.createBrowserConnection();
            var browserInfo1 = { path: '/Applications/Google Chrome.app' };
            var browserInfo2 = { path: '/Applications/Firefox.app' };

            runner.browsers('ie', 'chrome');
            runner.browsers('ff');

            runner.browsers('opera', [connection1], [browserInfo1, connection2]);
            runner.browsers([connection3, browserInfo2]);

            expect(runner.bootstrapper.browsers).eql([
                'ie',
                'chrome',
                'ff',
                'opera',
                connection1,
                browserInfo1,
                connection2,
                connection3,
                browserInfo2
            ]);
        });

        it('Should raise error if browser was not found for the alias', function (done) {
            var run = runner
                .browsers('browser42')
                .reporter('spec')
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Cannot find a corresponding browser for the following alias: browser42.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise error if browser was not set', function (done) {
            var run = runner
                .reporter('spec')
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No browser selected to test against. Use the ' +
                                            'Runner.browsers() method to specify the target browser.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise error if browser disconnected during bootstrapping', function (done) {
            var connection1 = testCafe.createBrowserConnection();
            var connection2 = testCafe.createBrowserConnection();

            var run = runner
                .browsers(connection1, connection2)
                .reporter('spec')
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The Chrome 41.0.2227 / Mac OS X 10.10.1 browser disconnected. ' +
                                            'This problem may appear when a browser hangs or is closed, ' +
                                            'or due to network issues.');
                });

            var savedHeartbeatTimeout = BrowserConnection.HEARTBEAT_TIMEOUT;

            BrowserConnection.HEARTBEAT_TIMEOUT = 0;

            var options = {
                url:            connection1.url,
                followRedirect: false,
                headers:        {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                  '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
                }
            };

            request(options, function () {
                BrowserConnection.HEARTBEAT_TIMEOUT = savedHeartbeatTimeout;
            });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise error if the browser connections are not ready', function (done) {
            var connection        = testCafe.createBrowserConnection();
            var savedReadyTimeout = Bootsrapper.BROWSER_CONNECTION_READY_TIMEOUT;

            Bootsrapper.BROWSER_CONNECTION_READY_TIMEOUT = 0;

            var run = runner
                .browsers(connection)
                .reporter('spec')
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    Bootsrapper.BROWSER_CONNECTION_READY_TIMEOUT = savedReadyTimeout;

                    expect(err.message).eql('Unable to establish one or more of the specified browser connections. ' +
                                            'This can be caused by network issues or remote device failure.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });

    describe('.reporter()', function () {
        var connection = null;

        // Fixture setup/teardown
        before(function () {
            connection = testCafe.createBrowserConnection();
            connection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                 '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');
        });

        after(function () {
            connection.close();
        });

        it('Should raise error if reporter was not found for the alias', function (done) {
            var run = runner
                .browsers(connection)
                .reporter('reporter42')
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The provided "reporter42" reporter does not exist. ' +
                                            'Check that you have specified the report format correctly.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise error if reporter was not set', function (done) {
            var run = runner
                .browsers(connection)
                .src('./test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No reporter has been set for the test runner. Use the ' +
                                            'Runner.reporter() method to specify reporting parameters.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });
});
