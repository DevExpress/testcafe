var path         = require('path');
var expect       = require('chai').expect;
var request      = require('request');
var TestCafe     = require('../../lib/');
var SpecReporter = require('../../lib/reporters/spec');
var COMMAND      = require('../../lib/browser-connection/command');

describe('Runner', function () {
    var testCafe   = null;
    var runner     = null;
    var connection = null;


    // Fixture setup/teardown
    before(function () {
        testCafe   = new TestCafe(1335, 1336);
        connection = testCafe.createBrowserConnection();

        connection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                             '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');
    });

    after(function () {
        connection.close();
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

        it('Should raise an error if browser was not found for the alias', function (done) {
            var run = runner
                .browsers('browser42')
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
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

        it('Should raise an error if browser was not set', function (done) {
            var run = runner
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
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
    });

    describe('.reporter()', function () {
        it('Should raise an error if reporter was not found for the alias', function (done) {
            var run = runner
                .browsers(connection)
                .reporter('reporter42')
                .src('test/server/data/test-suite/top.test.js')
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

        it('Should fallback to the "spec" reporter if reporter was not set', function (done) {
            runner._runTask = function (Reporter) {
                expect(Reporter).eql(SpecReporter);
            };

            var run = runner
                .browsers(connection)
                .src('test/server/data/test-suite/top.test.js')
                .run();

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });

    describe('.src()', function () {
        it('Should accept source files in different forms', function () {
            var cwd = process.cwd();

            var expected = [
                './test1.js',
                './test2.js',
                './dir/test3.js',
                '../test4.js',
                './test5.js',
                './test6.js',
                './test7.js'
            ];

            expected = expected.map(function (filePath) {
                return path.resolve(cwd, filePath);
            });

            runner.src('./test1.js', './test2.js');
            runner.src('./dir/test3.js');
            runner.src('../test4.js', ['./test5.js'], ['./test6.js', './test7.js']);

            expect(runner.bootstrapper.sources).eql(expected);
        });

        it('Should raise an error if the source was not set', function (done) {
            var run = runner
                .browsers(connection)
                .reporter('list')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No test file specified. Use the Runner.src() ' +
                                            'function to specify one or several test files to run.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });

    describe('.filter()', function () {

        // Test setup
        beforeEach(function () {
            runner
                .browsers(connection)
                .reporter('list')
                .src([
                    'test/server/data/test-suite/top.test.js',
                    'test/server/data/test-suite/child/test.test.js',
                    'test/server/data/test-suite/level1/level1_1.test.js',
                    'test/server/data/test-suite/level1/level1_2.test.js',
                    'test/server/data/test-suite/level1/level2/level2.test.js',
                    'test/server/data/test-suite/level1_no_cfg/level1_no_cfg.test.js'
                ]);
        });

        function testFilter (filterFn, expectedTestNames, done) {
            runner.filter(filterFn);

            runner._runTask = function (Reporter, browserConnections, tests) {
                var actualTestNames = tests
                    .map(function (test) {
                        return test.name;
                    })
                    .sort();

                expectedTestNames = expectedTestNames.sort();

                expect(actualTestNames).eql(expectedTestNames);
            };

            runner
                .run()
                .then(function () {
                    done();
                })
                .catch(done);
        }


        it('Should filter by test name', function (done) {
            var filter = function (testName) {
                return testName.toLowerCase().indexOf('level1') > -1;
            };

            var expectedTestNames = [
                'Level1 fixture1 test',
                'Level1 fixture2 test',
                'Level1 no cfg fixture test'
            ];

            testFilter(filter, expectedTestNames, done);
        });

        it('Should filter by fixture name', function (done) {
            var filter = function (testName, fixtureName) {
                return fixtureName.toLowerCase().indexOf('top') > -1;
            };

            var expectedTestNames = ['Top level test'];

            testFilter(filter, expectedTestNames, done);
        });

        it('Should filter by fixture path', function (done) {
            var filter = function (testName, fixtureName, fixturePath) {
                return fixturePath.toLowerCase().indexOf('level2.test.js') > -1;
            };

            var expectedTestNames = ['Level2 fixture test'];

            testFilter(filter, expectedTestNames, done);
        });

        it('Should raise an error if all tests are rejected by the filter', function (done) {
            var run = runner
                .browsers(connection)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .filter(function () {
                    return false;
                })
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No tests to run. Either the test files contain no tests ' +
                                            'or the filter function is too restrictive.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });

    describe('.run()', function () {
        it('Should not create a new local browser connection if sources are empty', function (done) {
            var firstConnectionId = testCafe.createBrowserConnection().id;

            var run = runner
                .browsers({ path: '/non/exist' })
                .reporter('list')
                .src([])
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function () {
                    var secondConnectionId = testCafe.createBrowserConnection().id;

                    expect(secondConnectionId).eql(firstConnectionId + 1);
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise an error if the browser connections are not ready', function (done) {
            var brokenConnection = testCafe.createBrowserConnection();

            runner.bootstrapper.BROWSER_CONNECTION_READY_TIMEOUT = 0;

            var run = runner
                .browsers(brokenConnection)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Unable to establish one or more of the specified browser connections. ' +
                                            'This can be caused by network issues or remote device failure.');
                });

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise an error if browser gets disconnected before bootstrapping', function (done) {
            var brokenConnection = testCafe.createBrowserConnection();

            brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                       '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

            brokenConnection.on('error', function () {
                runner
                    .run()
                    .then(function () {
                        throw new Error('Promise rejection expected');
                    })
                    .catch(function (err) {
                        expect(err.message).eql('The following browsers disconnected: ' +
                                                'Chrome 41.0.2227 / Mac OS X 10.10.1. Tests will not be run.');
                    })
                    .then(done)
                    .catch(done);
            });

            runner.
                browsers(brokenConnection)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js');

            brokenConnection.emit('error', 'It happened');
        });

        it('Should raise an error if browser disconnected during bootstrapping', function (done) {
            var connection1 = testCafe.createBrowserConnection();
            var connection2 = testCafe.createBrowserConnection();

            var run = runner
                .browsers(connection1, connection2)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The Chrome 41.0.2227 / Mac OS X 10.10.1 browser disconnected. ' +
                                            'This problem may appear when a browser hangs or is closed, ' +
                                            'or due to network issues.');
                });

            connection1.HEARTBEAT_TIMEOUT = 200;
            connection2.HEARTBEAT_TIMEOUT = 200;

            var options = {
                url:            connection1.url,
                followRedirect: false,
                headers:        {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                  '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
                }
            };

            request(options);

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('Should raise an error if connection breaks while tests are running', function (done) {
            var test             = this.test;
            var brokenConnection = testCafe.createBrowserConnection();

            brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                       '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

            var run = runner
                .browsers(brokenConnection)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('I have failed :(');
                });

            var interval = setInterval(function () {
                var status = brokenConnection.getStatus();

                if (test.timedOut || status.cmd === COMMAND.run) {
                    clearInterval(interval);

                    brokenConnection.emit('error', 'I have failed :(');
                }
            }, 200);

            run
                .then(function () {
                    done();
                })
                .catch(done);
        });
    });
});
