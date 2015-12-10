var path                   = require('path');
var expect                 = require('chai').expect;
var request                = require('request');
var noop                   = require('noop-fn');
var createTestCafe         = require('../../lib/');
var COMMAND                = require('../../lib/browser-connection/command');
var Task                   = require('../../lib/runner/task');
var LocalBrowserConnection = require('../../lib/browser-connection/local');
var BrowserConnection      = require('../../lib/browser-connection');
var Bootstrapper           = require('../../lib/runner/bootstrapper');
var BrowserSet             = require('../../lib/runner/browser-set');


describe('Runner', function () {
    var testCafe   = null;
    var runner     = null;
    var connection = null;


    // Fixture setup/teardown
    before(function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe   = tc;
                connection = testCafe.createBrowserConnection();

                connection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                     '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');
            });
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

        it('Should raise an error if browser was not found for the alias', function () {
            return runner
                .browsers('browser42')
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Unable to find the browser. "browser42" is not a ' +
                                            'browser alias or path to an executable file.');
                });
        });

        it('Should raise an error if browser was not set', function () {
            return runner
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No browser selected to test against.');
                });
        });
    });

    describe('.reporter()', function () {
        it('Should raise an error if reporter was not found for the alias', function () {
            return runner
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
        });

        it('Should fallback to the default reporter if reporter was not set', function () {
            runner._runTask = function (reporterPlugin) {
                expect(reporterPlugin.reportFixtureStart).to.be.a('function');
                expect(reporterPlugin.reportTestDone).to.be.a('function');
                expect(reporterPlugin.reportTaskStart).to.be.a('function');
                expect(reporterPlugin.reportTaskDone).to.be.a('function');
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suite/top.test.js')
                .run();
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

        it('Should raise an error if the source was not set', function () {
            return runner
                .browsers(connection)
                .reporter('list')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('No test file specified.');
                });
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

        function testFilter (filterFn, expectedTestNames) {
            runner.filter(filterFn);

            runner._runTask = function (reporterPlugin, browserSet, tests) {
                var actualTestNames = tests
                    .map(function (test) {
                        return test.name;
                    })
                    .sort();

                expectedTestNames = expectedTestNames.sort();

                expect(actualTestNames).eql(expectedTestNames);
            };

            return runner.run();
        }


        it('Should filter by test name', function () {
            var filter = function (testName) {
                return testName.toLowerCase().indexOf('level1') > -1;
            };

            var expectedTestNames = [
                'Level1 fixture1 test',
                'Level1 fixture2 test',
                'Level1 no cfg fixture test'
            ];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture name', function () {
            var filter = function (testName, fixtureName) {
                return fixtureName.toLowerCase().indexOf('top') > -1;
            };

            var expectedTestNames = ['Top level test'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture path', function () {
            var filter = function (testName, fixtureName, fixturePath) {
                return fixturePath.toLowerCase().indexOf('level2.test.js') > -1;
            };

            var expectedTestNames = ['Level2 fixture test'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should raise an error if all tests are rejected by the filter', function () {
            return runner
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
        });
    });

    describe('.run()', function () {
        it('Should not create a new local browser connection if sources are empty', function () {
            var firstConnectionId = testCafe.createBrowserConnection().id;

            return runner
                .browsers({ path: '/non/exist' })
                .reporter('list')
                .src([])
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    var secondConnectionId = testCafe.createBrowserConnection().id;

                    expect(err.message).eql('No test file specified.');

                    expect(secondConnectionId).eql(firstConnectionId + 1);
                });
        });

        it('Should raise an error if the browser connections are not ready', function () {
            var origWaitConnReady = BrowserSet.prototype._waitConnectionsReady;

            BrowserSet.prototype._waitConnectionsReady = function () {
                this.BROWSER_CONNECTION_READY_TIMEOUT = 0;
                return origWaitConnReady.call(this);
            };

            //NOTE: Restore original in prototype in test timeout callback
            var testCallback = this.test.callback;

            this.test.callback = function (err) {
                BrowserSet.prototype._waitConnectionsReady = origWaitConnReady;
                testCallback(err);
            };

            var brokenConnection = testCafe.createBrowserConnection();

            return runner
                .browsers(brokenConnection)
                .reporter('list')
                .src('test/server/data/test-suite/top.test.js')
                .run()
                .then(function () {
                    BrowserSet.prototype._waitConnectionsReady = origWaitConnReady;
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    BrowserSet.prototype._waitConnectionsReady = origWaitConnReady;
                    expect(err.message).eql('Unable to establish one or more of the specified browser connections. ' +
                                            'This can be caused by network issues or remote device failure.');
                });
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

            brokenConnection.emit('error', new Error('It happened'));
        });

        it('Should raise an error if browser disconnected during bootstrapping', function () {
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

            return run;
        });

        it('Should raise an error if connection breaks while tests are running', function () {
            var test             = this.test;
            var brokenConnection = testCafe.createBrowserConnection();

            brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                       '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

            var run = runner
                .browsers(brokenConnection)
                .reporter('json')
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

                    brokenConnection.emit('error', new Error('I have failed :('));
                }
            }, 200);

            return run;
        });
    });

    //TODO: Convert Task termination tests to functional tests
    describe('Task termination', function () {
        const BROWSER_CLOSING_DELAY = 50;
        const TASK_ACTION_DELAY     = 50;

        var origCreateBrowserJobs               = Task.prototype._createBrowserJobs;
        var origClose                           = LocalBrowserConnection.prototype.close;
        var origRunBrowser                      = LocalBrowserConnection.prototype._runBrowser;
        var origAbort                           = Task.prototype.abort;
        var origConvertAliasOrPathToBrowserInfo = Bootstrapper._convertBrowserAliasToBrowserInfo;

        var closeCalled        = 0;
        var taskActionCallback = null;

        function taskDone () {
            var task = this;

            task.pendingBrowserJobs.forEach(function (job) {
                task.emit('browser-job-done', job);
            });

            task.emit('done');
        }

        beforeEach(function () {
            closeCalled        = 0;
            taskActionCallback = taskDone;

            runner
                .src('test/server/data/test-suite/top.test.js')
                .reporter(function () {
                    return {
                        reportTaskStart:    noop,
                        reportTaskDone:     noop,
                        reportTestDone:     noop,
                        reportFixtureStart: noop
                    };
                });
        });

        before(function () {
            Bootstrapper._convertAliasOrPathToBrowserInfo = function (alias) {
                return typeof alias === 'string' ? {} : alias;
            };

            LocalBrowserConnection.prototype.close = function () {
                var bc = this;

                setTimeout(function () {
                    BrowserConnection.prototype.close.call(bc);
                    closeCalled++;
                    bc.emit('closed');
                }, BROWSER_CLOSING_DELAY);
            };

            LocalBrowserConnection.prototype._runBrowser = function () {
                this.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                               '(KHTML, like Gecko) Chrome/42.0.2227.1 Safari/537.36');
            };

            Task.prototype._createBrowserJobs = function () {
                setTimeout(taskActionCallback.bind(this), TASK_ACTION_DELAY);

                return this.browserConnections.map(function (bc) {
                    return { browserConnection: bc };
                });
            };

            Task.prototype.abort = function () {
            };
        });

        after(function () {
            LocalBrowserConnection.prototype.close        = origClose;
            LocalBrowserConnection.prototype._runBrowser  = origRunBrowser;
            Task.prototype._createBrowserJobs             = origCreateBrowserJobs;
            Task.prototype.abort                          = origAbort;
            Bootstrapper._convertAliasOrPathToBrowserInfo = origConvertAliasOrPathToBrowserInfo;
        });

        it('Should not stop the task until local connection browsers are not closed when task done', function () {
            return runner
                .browsers('browser-alias1', 'browser-alias2')
                .run()
                .then(function () {
                    expect(closeCalled).eql(2);
                });
        });

        it('Should not stop the task until local connection browsers are not closed when connection failed', function () {
            var brokenConnection = testCafe.createBrowserConnection();

            brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                       '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

            taskActionCallback = function () {
                brokenConnection.emit('error', new Error('I have failed :('));
            };

            return runner
                .browsers(brokenConnection, 'browser-alias')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('I have failed :(');
                    expect(closeCalled).eql(1);
                });
        });

        it('Should not stop the task while connected browser is not in idle state', function () {
            var IDLE_DELAY = 50;

            var remoteConnection = testCafe.createBrowserConnection();

            remoteConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                       '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

            remoteConnection.idle = false;

            taskActionCallback = function () {
                taskDone.call(this);

                setTimeout(function () {
                    remoteConnection.idle = true;
                    remoteConnection.emit('idle');
                }, IDLE_DELAY);
            };

            return runner
                .browsers(remoteConnection)
                .run()
                .then(function () {
                    expect(remoteConnection.idle).to.be.true;
                    remoteConnection.close();
                });
        });
    });
});
