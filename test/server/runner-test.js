var path                = require('path');
var expect              = require('chai').expect;
var request             = require('request');
var Promise             = require('pinkie');
var noop                = require('lodash').noop;
var times               = require('lodash').times;
var createTestCafe      = require('../../lib/');
var COMMAND             = require('../../lib/browser/connection/command');
var Task                = require('../../lib/runner/task');
var BrowserConnection   = require('../../lib/browser/connection');
var BrowserSet          = require('../../lib/runner/browser-set');
var browserProviderPool = require('../../lib/browser/provider/pool');
var delay               = require('../../lib/utils/delay');


describe('Runner', function () {
    var testCafe                  = null;
    var runner                    = null;
    var connection                = null;
    var origRemoteBrowserProvider = null;

    var remoteBrowserProviderMock = {
        openBrowser: function () {
            return Promise.resolve();
        },

        closeBrowser: function () {
            return Promise.resolve();
        }
    };

    // Fixture setup/teardown
    before(function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe = tc;

                return browserProviderPool.getProvider('remote');
            })
            .then(function (remoteBrowserProvider) {
                origRemoteBrowserProvider = remoteBrowserProvider;

                browserProviderPool.addProvider('remote', remoteBrowserProviderMock);

                return testCafe.createBrowserConnection();
            })
            .then(function (bc) {
                connection = bc;

                connection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                     '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');
            });
    });

    after(function () {
        browserProviderPool.addProvider('remote', origRemoteBrowserProvider);

        connection.close();
        return testCafe.close();
    });


    // Test setup/teardown
    beforeEach(function () {
        runner = testCafe.createRunner();
    });


    describe('.browsers()', function () {
        it('Should accept target browsers in different forms', function () {
            return Promise
                .all(times(3, function () {
                    return testCafe.createBrowserConnection();
                }))
                .then(function (connections) {
                    var browserInfo1 = { path: '/Applications/Google Chrome.app' };
                    var browserInfo2 = { path: '/Applications/Firefox.app' };

                    runner.browsers('ie', 'chrome');
                    runner.browsers('firefox');

                    runner.browsers('opera', [connections[0]], [browserInfo1, connections[1]]);
                    runner.browsers([connections[2], browserInfo2]);

                    expect(runner.bootstrapper.browsers).eql([
                        'ie',
                        'chrome',
                        'firefox',
                        'opera',
                        connections[0],
                        browserInfo1,
                        connections[1],
                        connections[2],
                        browserInfo2
                    ]);
                });

        });

        it('Should raise an error if browser was not found for the alias', function () {
            return runner
                .browsers('browser42')
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Unable to find the browser. "browser42" is not a ' +
                                            'browser alias or path to an executable file.');
                });
        });


        it('Should raise an error if an unprefixed path is provided', function () {
            return runner
                .browsers('/Applications/Firefox.app')
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Unable to find the browser. "/Applications/Firefox.app" is not a ' +
                                            'browser alias or path to an executable file.');
                });
        });

        it('Should raise an error if browser was not set', function () {
            return runner
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
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
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The provided "reporter42" reporter does not exist. ' +
                                            'Check that you have specified the report format correctly.');
                });
        });

        it('Should raise an error if several reporters are going to write to the stdout', function () {
            return runner
                .browsers(connection)
                .reporter('json')
                .reporter('xunit')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('Multiple reporters attempting to write to stdout: "json, xunit". ' +
                                            'Only one reporter can write to stdout.');
                });
        });

        it('Should fallback to the default reporter if reporter was not set', function () {
            runner._runTask = function (reporters) {
                var reporterPlugin = reporters[0].plugin;

                expect(reporterPlugin.reportFixtureStart).to.be.a('function');
                expect(reporterPlugin.reportTestDone).to.be.a('function');
                expect(reporterPlugin.reportTaskStart).to.be.a('function');
                expect(reporterPlugin.reportTaskDone).to.be.a('function');

                return Promise.resolve({});
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile2.js')
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
                    'test/server/data/test-suites/basic/testfile1.js',
                    'test/server/data/test-suites/basic/testfile2.js'
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

                return Promise.resolve({});
            };

            return runner.run();
        }


        it('Should filter by test name', function () {
            var filter = function (testName) {
                return testName.indexOf('Fixture2') < 0;
            };

            var expectedTestNames = [
                'Fixture1Test1',
                'Fixture1Test2',
                'Fixture3Test1'
            ];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture name', function () {
            var filter = function (testName, fixtureName) {
                return fixtureName === 'Fixture1';
            };

            var expectedTestNames = [
                'Fixture1Test1',
                'Fixture1Test2'
            ];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture path', function () {
            var filter = function (testName, fixtureName, fixturePath) {
                return fixturePath.indexOf('testfile2.js') > -1;
            };

            var expectedTestNames = ['Fixture3Test1'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should raise an error if all tests are rejected by the filter', function () {
            return runner
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
            var origGenerateId   = BrowserConnection._generateId;
            var connectionsCount = 0;

            BrowserConnection._generateId = function () {
                connectionsCount++;
                return origGenerateId();
            };

            return runner
                .browsers({ path: '/non/exist' })
                .reporter('list')
                .src([])
                .run()
                .then(function () {
                    BrowserConnection._generateId = origGenerateId;

                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    BrowserConnection._generateId = origGenerateId;

                    expect(err.message).eql('No test file specified.');

                    expect(connectionsCount).eql(0);
                });
        });

        it('Should raise an error if the browser connections are not ready', function () {
            var origWaitConnOpened  = BrowserSet.prototype._waitConnectionsOpened;
            var origGetReadyTimeout = BrowserSet.prototype._getReadyTimeout;

            BrowserSet.prototype._getReadyTimeout = function () {
                return Promise.resolve(0);
            };

            BrowserSet.prototype._waitConnectionsOpened = function () {
                return origWaitConnOpened.call(this);
            };

            //NOTE: Restore original in prototype in test timeout callback
            var testCallback = this.test.callback;

            this.test.callback = function (err) {
                BrowserSet.prototype._waitConnectionsOpened = origWaitConnOpened;
                BrowserSet.prototype._getReadyTimeout       = origGetReadyTimeout;
                testCallback(err);
            };

            return testCafe
                .createBrowserConnection()
                .then(function (brokenConnection) {
                    return runner
                        .browsers(brokenConnection)
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();
                })
                .then(function () {
                    BrowserSet.prototype._waitConnectionsOpened = origWaitConnOpened;
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    BrowserSet.prototype._waitConnectionsOpened = origWaitConnOpened;
                    BrowserSet.prototype._getReadyTimeout       = origGetReadyTimeout;

                    expect(err.message).eql('Unable to establish one or more of the specified browser connections. ' +
                                            'This can be caused by network issues or remote device failure.');
                });
        });

        it('Should raise an error if browser gets disconnected before bootstrapping', function (done) {
            testCafe
                .createBrowserConnection()
                .then(function (brokenConnection) {
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

                    runner.browsers(brokenConnection)
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js');

                    brokenConnection.emit('error', new Error('It happened'));
                });
        });

        it('Should raise an error if browser disconnected during bootstrapping', function () {
            return Promise
                .all(times(2, function () {
                    return testCafe.createBrowserConnection();
                }))
                .then(function (connections) {
                    var run = runner
                        .browsers(connections[0], connections[1])
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();

                    connections[0].HEARTBEAT_TIMEOUT = 200;
                    connections[1].HEARTBEAT_TIMEOUT = 200;

                    var options = {
                        url:            connections[0].url,
                        followRedirect: false,
                        headers:        {
                            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                          '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
                        }
                    };

                    request(options);

                    return run;
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('The Chrome 41.0.2227 / Mac OS X 10.10.1 browser disconnected. ' +
                                            'This problem may appear when a browser hangs or is closed, ' +
                                            'or due to network issues.');
                });
        });

        it('Should raise an error if connection breaks while tests are running', function () {
            var test = this.test;

            return testCafe
                .createBrowserConnection()
                .then(function (brokenConnection) {
                    brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    var run = runner
                        .browsers(brokenConnection)
                        .reporter('json')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();

                    function check () {
                        setTimeout(function () {
                            brokenConnection.getStatus().then(function (status) {
                                if (test.timedOut || status.cmd === COMMAND.run)
                                    brokenConnection.emit('error', new Error('I have failed :('));
                                else
                                    check();
                            });
                        }, 200);
                    }

                    check();

                    return run;
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('I have failed :(');
                });
        });

        it('Should raise an error if speed option has wrong value', function () {
            var exceptionCount = 0;

            var incorrectSpeedError = function (speed) {
                return runner
                    .run({ speed })
                    .catch(function (err) {
                        exceptionCount++;
                        expect(err.message).eql('Speed should be a number between 0.01 and 1.');
                    });
            };

            return Promise.resolve()
                .then(() => incorrectSpeedError('yo'))
                .then(() => incorrectSpeedError(-0.01))
                .then(() => incorrectSpeedError(0))
                .then(() => incorrectSpeedError(1.01))
                .then(() => expect(exceptionCount).to.be.eql(4));
        });

        it('Should raise an error if concurrency option has wrong value', function () {
            var exceptionCount = 0;

            var incorrectConcurrencyFactorError = function (concurrency) {
                return runner
                    .concurrency(concurrency)
                    .run()
                    .catch(function (err) {
                        exceptionCount++;
                        expect(err.message).eql('The concurrency factor should be an integer greater or equal to 1.');
                    });
            };

            return Promise.resolve()
                .then(() => incorrectConcurrencyFactorError('yo'))
                .then(() => incorrectConcurrencyFactorError(-1))
                .then(() => incorrectConcurrencyFactorError(0.1))
                .then(() => incorrectConcurrencyFactorError(0))
                .then(() => expect(exceptionCount).to.be.eql(4));
        });

        it('Should raise an error if proxyBypass option has wrong type', function () {
            var exceptionCount = 0;

            var expectProxyBypassError = function (proxyBypass, type) {
                runner.opts.proxyBypass = proxyBypass;

                return runner
                    .run()
                    .catch(function (err) {
                        exceptionCount++;
                        expect(err.message).contains('"proxyBypass" argument is expected to be a string or an array, but it was ' + type);
                    });
            };

            return expectProxyBypassError(1, 'number')
                .then(() => expectProxyBypassError({}, 'object'))
                .then(() => expectProxyBypassError(true, 'bool'))
                .then(() => expect(exceptionCount).to.be.eql(3));
        });
    });

    describe('Regression', function () {
        it('Should not have unhandled rejections in runner (GH-825)', function () {
            var rejectionReason = null;

            process.on('unhandledRejection', function (reason) {
                rejectionReason = reason;
            });

            return runner
                .browsers({ path: '/non/exist' })
                .src([])
                .run()
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err).not.eql('Promise rejection expected');

                    return delay(100);
                })
                .then(function () {
                    expect(rejectionReason).to.be.null;
                });
        });
    });

    //TODO: Convert Task termination tests to functional tests
    describe('Task termination', function () {
        const BROWSER_CLOSING_DELAY = 50;
        const TASK_ACTION_DELAY     = 50;

        var origCreateBrowserJobs = Task.prototype._createBrowserJobs;
        var origAbort             = Task.prototype.abort;

        var closeCalled        = 0;
        var abortCalled        = false;
        var taskActionCallback = null;

        var MockBrowserProvider = {
            openBrowser: function (browserId, pageUrl) {
                var options = {
                    url:            pageUrl,
                    followRedirect: false,
                    headers:        {
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                      '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
                    }
                };

                request(options);

                return Promise.resolve();
            },

            closeBrowser: function () {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        closeCalled++;
                        resolve();
                    }, BROWSER_CLOSING_DELAY);
                });
            }
        };

        function taskDone () {
            var task = this;

            task.pendingBrowserJobs.forEach(function (job) {
                task.emit('browser-job-done', job);
            });

            task.emit('done');
        }

        beforeEach(function () {
            closeCalled        = 0;
            abortCalled        = false;
            taskActionCallback = taskDone;

            runner
                .src('test/server/data/test-suites/basic/testfile2.js')
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
            browserProviderPool.addProvider('mock', MockBrowserProvider);

            Task.prototype._createBrowserJobs = function () {
                setTimeout(taskActionCallback.bind(this), TASK_ACTION_DELAY);

                return this.browserConnectionGroups.map(function (bcGroup) {
                    return { browserConnections: bcGroup };
                });
            };

            Task.prototype.abort = function () {
                abortCalled = true;
            };
        });

        after(function () {
            browserProviderPool.removeProvider('mock');

            Task.prototype._createBrowserJobs = origCreateBrowserJobs;
            Task.prototype.abort              = origAbort;
        });

        it('Should not stop the task until local connection browsers are not closed when task done', function () {
            return runner
                .browsers('mock:browser-alias1', 'mock:browser-alias2')
                .run()
                .then(function () {
                    expect(closeCalled).eql(2);
                });
        });

        it('Should not stop the task until local connection browsers are not closed when connection failed', function () {
            return testCafe
                .createBrowserConnection()
                .then(function (brokenConnection) {
                    brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    taskActionCallback = function () {
                        brokenConnection.emit('error', new Error('I have failed :('));
                    };

                    return runner
                        .browsers(brokenConnection, 'mock:browser-alias')
                        .run();
                })
                .then(function () {
                    throw new Error('Promise rejection expected');
                })
                .catch(function (err) {
                    expect(err.message).eql('I have failed :(');
                    expect(closeCalled).eql(1);
                });
        });

        it('Should not stop the task while connected browser is not in idle state', function () {
            var IDLE_DELAY       = 50;
            var remoteConnection = null;

            return testCafe
                .createBrowserConnection()
                .then(function (bc) {
                    remoteConnection = bc;

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
                        .run();
                })
                .then(function () {
                    expect(remoteConnection.idle).to.be.true;
                    remoteConnection.close();
                });
        });

        it('Should be able to cancel test', function () {
            var IDLE_DELAY       = 100;
            var remoteConnection = null;

            return testCafe
                .createBrowserConnection()
                .then(function (bc) {
                    remoteConnection = bc;

                    remoteConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    remoteConnection.idle = false;

                    // Don't let the test finish by emitting the task's 'done' event
                    taskActionCallback = function () {
                    };

                    setTimeout(function () {
                        remoteConnection.idle = true;
                        remoteConnection.emit('idle');
                    }, IDLE_DELAY);

                    return runner
                        .browsers('mock:browser-alias1', remoteConnection)
                        .run()
                        .cancel();
                })
                .then(function () {
                    expect(closeCalled).eql(1);
                    expect(abortCalled).to.be.true;
                    expect(remoteConnection.idle).to.be.true;
                    remoteConnection.close();
                });
        });
    });
});
