/*eslint-disable no-console */

const path                    = require('path');
const chai                    = require('chai');
const { expect }              = chai;
const request                 = require('request');
const { noop, times, uniqBy } = require('lodash');
const createTestCafe          = require('../../lib/');
const COMMAND                 = require('../../lib/browser/connection/command');
const Task                    = require('../../lib/runner/task');
const BrowserConnection       = require('../../lib/browser/connection');
const BrowserSet              = require('../../lib/runner/browser-set');
const browserProviderPool     = require('../../lib/browser/provider/pool');
const delay                   = require('../../lib/utils/delay');
const consoleWrapper          = require('./helpers/console-wrapper');

chai.use(require('chai-string'));

describe('Runner', () => {
    let testCafe                  = null;
    let runner                    = null;
    let connection                = null;
    let origRemoteBrowserProvider = null;

    const remoteBrowserProviderMock = {
        openBrowser () {
            return Promise.resolve();
        },

        closeBrowser () {
            return Promise.resolve();
        }
    };

    const browserMock = { path: '/non/exist' };

    before(() => {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testCafe = tc;

                return browserProviderPool.getProvider('remote');
            })
            .then(remoteBrowserProvider => {
                origRemoteBrowserProvider = remoteBrowserProvider;

                browserProviderPool.addProvider('remote', remoteBrowserProviderMock);

                return testCafe.createBrowserConnection();
            })
            .then(bc => {
                connection = bc;

                connection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                     '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');
            });
    });

    after(() => {
        browserProviderPool.addProvider('remote', origRemoteBrowserProvider);

        connection.close();
        return testCafe.close();
    });

    beforeEach(() => {
        runner = testCafe.createRunner();
    });

    afterEach(() => {
        consoleWrapper.messages.clear();
    });

    describe('.browsers()', () => {
        it('Should raise an error if browser was not found for the alias', () => {
            return runner
                .browsers('browser42')
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch((err) => {
                    expect(err.message).eql('Unable to find the browser. "browser42" is not a ' +
                                            'browser alias or path to an executable file.');
                });
        });

        it('Should raise an error if an unprefixed path is provided', () => {
            return runner
                .browsers('/Applications/Firefox.app')
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('Unable to find the browser. "/Applications/Firefox.app" is not a ' +
                                            'browser alias or path to an executable file.');
                });
        });

        it('Should raise an error if browser was not set', () => {
            return runner
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('No browser selected to test against.');
                });
        });

        it('Should raise an error for the multiple ".browsers" method call', () => {
            try {
                runner
                    .browsers('browser1')
                    .browsers('browser2');

                throw new Error('Should raise an appropriate error.');
            }
            catch (err) {
                expect(err.message).startsWith('You cannot call the "browsers" method more than once. Pass an array of parameters');
            }
        });
    });

    describe('.reporter()', () => {
        it('Should raise an error if reporter was not found for the alias', () => {
            return runner
                .browsers(connection)
                .reporter('reporter42')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('The provided "reporter42" reporter does not exist. ' +
                                            'Check that you have specified the report format correctly.');
                });
        });

        it('Should fallback to the default reporter if reporter was not set', () => {
            const storedRunTaskFn = runner._runTask;

            runner._runTask = reporters => {
                const reporterPlugin = reporters[0].plugin;

                expect(reporterPlugin.reportFixtureStart).to.be.a('function');
                expect(reporterPlugin.reportTestDone).to.be.a('function');
                expect(reporterPlugin.reportTaskStart).to.be.a('function');
                expect(reporterPlugin.reportTaskDone).to.be.a('function');

                runner._runTask = storedRunTaskFn;

                return Promise.resolve({});
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run();
        });

        it('Should raise an error if the reporter output has a wrong type', () => {
            try {
                runner.reporter('xunit', 9);

                throw new Error('Should raise a valid error.');
            }
            catch (e) {
                expect(e.message).eql("Specify a file name or a writable stream as the reporter's output target.");
            }
        });

        it('Should raise an error for the multiple ".reporter" method call', () => {
            try {
                runner
                    .reporter('json')
                    .reporter('xunit');

                throw new Error('Should raise an appropriate error.');
            }
            catch (err) {
                expect(err.message).startsWith('You cannot call the "reporter" method more than once. Pass an array of parameters');
            }
        });

        it('Should raise an error if null is specified as a reporter output stream (GH-3114)', () => {
            try {
                runner.reporter('json', null);
            }
            catch (e) {
                expect(e.message).eql("Specify a file name or a writable stream as the reporter's output target.");
            }
        });
    });

    describe('.screenshots()', () => {
        it('Should throw an error when the screenshots base path contains forbidden characters', () => {
            return runner
                .browsers(connection)
                .screenshots('path:with*forbidden|chars')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('There are forbidden characters in the "path:with*forbidden|chars" ' +
                                            'screenshots base directory path:\n ' +
                                            '\t":" at index 4\n\t"*" at index 9\n\t"|" at index 19\n');
                });
        });

        it('Should throw an error when the screenshots pattern contains forbidden characters', () => {
            return runner
                .browsers(connection)
                .screenshots('correct_path', false, '${TEST}:${BROWSER}')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('There are forbidden characters in the "${TEST}:${BROWSER}" ' +
                                            'screenshots path pattern:\n \t":" at index 7\n');
                });
        });

        it('Should allow to use relative paths in the screenshots base path and path patterns', () => {
            const storedRunTaskFn = runner._runTask;

            runner._runTask = function () {
                runner._runTask = storedRunTaskFn;

                return Promise.resolve({});
            };

            return runner
                .browsers(connection)
                .screenshots('..', false, '${BROWSER}/./${TEST}')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run();
        });

        it('Should allow to specify path pattern without a base screenshot path', () => {
            runner._createRunnableConfiguration = () => {
                throw new Error('stop executing runner.');
            };

            return runner
                .browsers(connection)
                .screenshots(void 0, true, '${DATE}')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('stop executing runner.');

                    expect(runner.configuration.getOption('screenshots').path).eql(path.resolve(process.cwd(), 'screenshots'));
                    expect(runner.configuration.getOption('screenshots').pathPattern).eql('${DATE}');
                });
        });

        it('Should not display a message about "overriden options" after call "screenshots" method with undefined arguments', () => {
            const savedConsoleLog = console.log;

            console.log = consoleWrapper.log;

            return runner
                .screenshots(void 0, void 0, void 0)
                .run({ skipJsErrors: true })
                .catch(() => {
                    console.log = savedConsoleLog;

                    expect(consoleWrapper.messages.log).eql(null);
                });
        });

        it('should allow to set object as a `screenshots` method parameter', () => {
            runner
                .screenshots({
                    path:        'path',
                    takeOnFails: true,
                    pathPattern: 'pathPattern',
                    fullPage:    true
                });

            expect(runner.configuration.getOption('screenshots').path).eql('path');
            expect(runner.configuration.getOption('screenshots').takeOnFails).eql(true);
            expect(runner.configuration.getOption('screenshots').pathPattern).eql('pathPattern');
            expect(runner.configuration.getOption('screenshots').fullPage).eql(true);
        });

        it('Validate screenshot options. The `screenshots` option has priority', () => {
            runner.configuration.mergeOptions({
                'screenshots': {
                    'path':        'path1',
                    'pathPattern': 'pattern1',
                    'fullPage':    true
                },
                'screenshotPath':        'path2',
                'screenshotPathPattern': 'pattern2'
            });

            expect(runner._getScreenshotOptions()).eql({
                path:        'path1',
                pathPattern: 'pattern1',
            });
        });

        it('Validate screenshot options. Obsolete options are still validated', () => {
            runner.configuration.mergeOptions({
                'screenshots': {
                    'fullPage': true
                },
                'screenshotPath':        'path2',
                'screenshotPathPattern': 'pattern2'
            });

            expect(runner._getScreenshotOptions()).eql({
                path:        'path2',
                pathPattern: 'pattern2'
            });
        });

        it('Should use default `screenshots.path` if is not set', () => {
            runner._createRunnableConfiguration = () => {
                throw new Error('stop executing runner.');
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile1.js')
                .run()
                .catch(err => {
                    expect(err.message).eql('stop executing runner.');
                    expect(runner.configuration.getOption('screenshots').path).eql(path.resolve(process.cwd(), 'screenshots'));
                });
        });
    });

    describe('.video()', () => {
        it('Should throw an error if video options are specified without a base video path', () => {
            return runner
                .browsers(connection)
                .video(void 0, { failedOnly: true })
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('Unable to set video or encoding options when video recording is disabled. Specify the base path where video files are stored to enable recording.');
                });
        });

        it('Should throw an error if video encoding options are specified without a base video path', () => {
            return runner
                .browsers(connection)
                .video(void 0, null, { 'c:v': 'x264' })
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('Unable to set video or encoding options when video recording is disabled. Specify the base path where video files are stored to enable recording.');
                });
        });
    });

    describe('.src()', () => {
        it('Should accept source files in different forms', () => {
            const cwd                           = process.cwd();
            const storedRunTaskFn               = runner._runTask;
            const storedGetBrowserConnectionsFn = runner.bootstrapper._getBrowserConnections;

            const expectedFiles = [
                'test/server/data/test-suites/basic/testfile1.js',
                'test/server/data/test-suites/basic/testfile2.js',
                'test/server/data/test-suites/basic/testfile3.js'
            ].map(file => path.resolve(cwd, file));

            runner.bootstrapper._getBrowserConnections = () => {
                runner.bootstrapper._getBrowserConnections = storedGetBrowserConnectionsFn;

                return Promise.resolve();
            };

            runner._runTask = (reporterPlugin, browserSet, tests) => {
                const actualFiles = uniqBy(tests.map(test => test.testFile.filename));

                expect(actualFiles).eql(expectedFiles);

                runner._runTask = storedRunTaskFn;

                return Promise.resolve({});
            };

            return runner
                .browsers(browserMock)
                .src('test/server/data/test-suites/basic/testfile1.js',
                    [
                        'test/server/data/test-suites/basic/*.js',
                        'test/server/data/test-suites/basic'
                    ]
                )
                .run();
        });

        it('Should use default `src` if the source was not set', () => {
            runner._createRunnableConfiguration = () => {
                throw new Error('stop executing runner.');
            };

            return runner
                .browsers(connection)
                .reporter('list')
                .run()
                .catch(err => {
                    expect(err.message).eql('stop executing runner.');
                    expect(runner.configuration.getOption('src')).eql(['tests', 'test']);
                });
        });

        it('Should raise an error if the source and imported module have no tests', () => {
            return runner
                .browsers(connection)
                .src(['test/server/data/test-suites/test-as-module/without-tests/testfile.js'])
                .run()
                .catch(err => {
                    expect(err.message).eql('No tests found in the specified source files.\n' +
                        "Ensure the sources contain the 'fixture' and 'test' directives.");
                });
        });

        it('Should raise an error for the multiple ".src" method call', () => {
            try {
                runner
                    .src('/source1')
                    .src('/source2');

                throw new Error('Should raise an appropriate error.');
            }
            catch (err) {
                expect(err.message).startsWith('You cannot call the "src" method more than once. Pass an array of parameters');
            }
        });
    });

    describe('.filter()', () => {
        beforeEach(() => {
            runner
                .browsers(connection)
                .reporter('list')
                .src([
                    'test/server/data/test-suites/basic/testfile1.js',
                    'test/server/data/test-suites/basic/testfile2.js',
                    'test/server/data/test-suites/filter/meta.js'
                ]);
        });

        function testFilter (filterFn, expectedTestNames) {
            const storedRunTaskFn = runner._runTask;

            runner.filter(filterFn);

            runner._runTask = (reporterPlugin, browserSet, tests) => {
                const actualTestNames = tests.map(test =>test.name).sort();

                expectedTestNames = expectedTestNames.sort();

                expect(actualTestNames).eql(expectedTestNames);

                runner._runTask = storedRunTaskFn;

                return Promise.resolve({});
            };

            return runner.run();
        }


        it('Should filter by test name', () => {
            const filter = testName => !testName.includes('Fixture2');

            const expectedTestNames = [
                'Fixture1Test1',
                'Fixture1Test2',
                'Fixture3Test1',
                'Fixture4Test1',
                'Fixture5Test1',
                'Fixture5Test2'
            ];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture name', () => {
            const filter = (testName, fixtureName) => fixtureName === 'Fixture1';

            const expectedTestNames = [
                'Fixture1Test1',
                'Fixture1Test2'
            ];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture path', () => {
            const filter = (testName, fixtureName, fixturePath) => fixturePath.includes('testfile2.js');

            const expectedTestNames = ['Fixture3Test1'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by test meta', () => {
            const filter = (testName, fixtureName, fixturePath, testMeta) => testMeta.meta === 'test';

            const expectedTestNames = ['Fixture5Test2'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should filter by fixture meta', () => {
            const filter = (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => fixtureMeta.meta === 'test';

            const expectedTestNames = ['Fixture4Test1'];

            return testFilter(filter, expectedTestNames);
        });

        it('Should raise an error if all tests are rejected by the filter', () => {
            return runner
                .filter(() => false)
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('The specified filter settings exclude all tests.\n' +
                        'Modify these settings to leave at least one available test.\n' +
                        'For more information on how to specify filter settings, see https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html#filter.');
                });
        });
    });

    describe('.run()', () => {
        it('Should not create a new remote browser connection if tests are not found', () => {
            const origGenerateId   = BrowserConnection._generateId;

            let connectionsCount = 0;

            BrowserConnection._generateId = () => {
                connectionsCount++;
                return origGenerateId();
            };

            return runner
                .browsers(connection)
                .reporter('list')
                .src(['non-existing-file-1.js', 'non-existing-file-2.js'])
                .run()
                .then(() => {
                    BrowserConnection._generateId = origGenerateId;

                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    BrowserConnection._generateId = origGenerateId;

                    expect(err.message).eql(
                        'TestCafe could not find the test files that match the following patterns:\n' +
                        'non-existing-file-1.js\n' +
                        'non-existing-file-2.js\n' +
                        '\n' +
                        `The "${process.cwd()}" current working directory was used as the base path.\n` +
                        'Ensure the file patterns are correct or change the current working directory.\n' +
                        'For more information on how to specify test files, see https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#file-pathglob-pattern.');

                    expect(connectionsCount).eql(0);
                });
        });

        it('Should raise an error if the browser connections are not ready', function () {
            const origGetReadyTimeout = BrowserSet.prototype._getReadyTimeout;

            BrowserSet.prototype._getReadyTimeout = () => {
                return Promise.resolve(100);
            };

            //NOTE: Restore original in prototype in test timeout callback
            const testCallback = this.test.callback;

            this.test.callback = err => {
                BrowserSet.prototype._getReadyTimeout       = origGetReadyTimeout;
                testCallback(err);
            };

            return testCafe
                .createBrowserConnection()
                .then(brokenConnection => {
                    return runner
                        .browsers(brokenConnection)
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    BrowserSet.prototype._getReadyTimeout = origGetReadyTimeout;

                    expect(err.message).eql('Unable to establish one or more of the specified browser connections. ' +
                                            'This can be caused by network issues or remote device failure.');
                });
        });

        it('Should raise an error if browser gets disconnected before bootstrapping', done => {
            testCafe
                .createBrowserConnection()
                .then(brokenConnection => {
                    brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    brokenConnection.on('error', () => {
                        runner
                            .run()
                            .then(() => {
                                throw new Error('Promise rejection expected');
                            })
                            .catch(err => {
                                expect(err.message).eql('The following browsers disconnected: ' +
                                                        'Chrome 41.0.2227.1 / macOS 10.10.1. Tests will not be run.');
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

        it('Should raise an error if browser disconnected during bootstrapping', () => {
            return Promise
                .all(times(2, () => testCafe.createBrowserConnection()))
                .then(connections => {
                    const run = runner
                        .browsers(connections[0], connections[1])
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();

                    connections[0].HEARTBEAT_TIMEOUT = 200;
                    connections[1].HEARTBEAT_TIMEOUT = 200;

                    const options = {
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
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('The Chrome 41.0.2227.1 / macOS 10.10.1 browser disconnected. ' +
                                            'This problem may appear when a browser hangs or is closed, ' +
                                            'or due to network issues.');
                });
        });

        it('Should raise an error if connection breaks while tests are running', function () {
            const test = this.test;

            return testCafe
                .createBrowserConnection()
                .then(brokenConnection => {
                    brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    const run = runner
                        .browsers(brokenConnection)
                        .reporter('json')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run();

                    function check () {
                        setTimeout(() => {
                            brokenConnection.getStatus().then(status => {
                                if (test.timedOut || status.cmd === COMMAND.run)
                                    brokenConnection.emit('error', new Error('I have failed :('));
                                else
                                    check();
                            }).catch(err => {
                                throw err;
                            });
                        }, 200);
                    }

                    check();

                    return run;
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('I have failed :(');
                });
        });

        it('Should raise an error if speed option has wrong value', function () {
            let exceptionCount = 0;

            const incorrectSpeedError = speed => {
                return runner
                    .run({ speed })
                    .catch(err => {
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

        it('Should raise an error if concurrency option has wrong value', () => {
            let exceptionCount = 0;

            const incorrectConcurrencyFactorError = concurrency => {
                return runner
                    .concurrency(concurrency)
                    .run()
                    .catch(err => {
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

        it('Should raise an error if proxyBypass option has wrong type', () => {
            let exceptionCount = 0;

            const expectProxyBypassError = (proxyBypass, type) => {
                runner.configuration.mergeOptions({ proxyBypass });

                return runner
                    .run()
                    .catch(err => {
                        exceptionCount++;
                        expect(err.message).contains('"proxyBypass" argument is expected to be a string or an array, but it was ' +
                                                     type);
                    });
            };

            return expectProxyBypassError(1, 'number')
                .then(() => expectProxyBypassError({}, 'object'))
                .then(() => expectProxyBypassError(true, 'bool'))
                .then(() => {
                    expect(exceptionCount).to.be.eql(3);

                    delete runner.configuration._options.proxyBypass;
                });
        });

        it('Should not display a message about "overridden options" after call "run" method with flags with undefined value', () => {
            const savedConsoleLog = console.log;

            console.log = consoleWrapper.log;

            return runner
                .run()
                .catch(() => {
                    console.log = savedConsoleLog;

                    expect(consoleWrapper.messages.log).eql(null);
                });
        });

        it('Should use the default debugLogger if necessary', () => {
            const defaultLogger = require('../../lib/notifications/debug-logger');

            runner._validateDebugLogger();

            expect(runner.configuration.getOption('debugLogger')).to.deep.equal(defaultLogger);

            runner.configuration.mergeOptions({ debugLogger: null });
            runner._validateDebugLogger();

            expect(runner.configuration.getOption('debugLogger')).to.be.null;

            const customLogger = {
                showBreakpoint: 'foo',
                hideBreakpoint: () => {}
            };

            runner.configuration.mergeOptions({ debugLogger: customLogger });
            runner._validateDebugLogger();

            expect(runner.configuration.getOption('debugLogger')).to.deep.equal(defaultLogger);

            customLogger.showBreakpoint = () => {};
            runner.configuration.mergeOptions({ debugLogger: customLogger });
            runner._validateDebugLogger();

            expect(runner.configuration.getOption('debugLogger')).to.deep.equal(customLogger);
        });

        it('Should raise an error if "allowMultipleWindows" option is used for legacy tests', () => {
            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/legacy/test.test.js')
                .run({ allowMultipleWindows: true })
                .catch(err => {
                    expect(err.message).eql('You cannot run Legacy API tests in multi-window mode.');
                });
        });

        it('Should raise an error if "allowMultipleWindows" option is used non-local browsers', () => {
            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile1.js')
                .run({ allowMultipleWindows: true })
                .catch(err => {
                    expect(err.message).eql('You cannot use multi-window mode in "remote".');
                });
        });
    });

    describe('.clientScripts', () => {
        it('Should raise an error for the multiple ".clientScripts" method call', () => {
            try {
                runner
                    .clientScripts({ source: 'var i = 0;' })
                    .clientScripts({ source: 'var i = 1;' });

                throw new Error('Should raise an appropriate error.');
            }
            catch (err) {
                expect(err.message).startsWith('You cannot call the "clientScripts" method more than once. Pass an array of parameters to this method instead.');
            }
        });
    });

    describe('Regression', () => {
        it('Should not have unhandled rejections in runner (GH-825)', () => {
            let rejectionReason = null;

            process.on('unhandledRejection', reason => {
                rejectionReason = reason;
            });

            return runner
                .browsers(browserMock)
                .src([])
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err).not.eql('Promise rejection expected');

                    return delay(100);
                })
                .then(() => {
                    expect(rejectionReason).to.be.null;
                });
        });
    });

    //TODO: Convert Task termination tests to functional tests
    describe('Task termination', () => {
        const BROWSER_CLOSING_DELAY = 50;
        const TASK_ACTION_DELAY     = 50;

        const origCreateBrowserJobs = Task.prototype._createBrowserJobs;
        const origAbort             = Task.prototype.abort;

        let closeCalled        = 0;
        let abortCalled        = false;
        let taskActionCallback = null;

        const MockBrowserProvider = {
            openBrowser (browserId, pageUrl) {
                const options = {
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

            closeBrowser () {
                return new Promise(resolve => {
                    setTimeout(() => {
                        closeCalled++;
                        resolve();
                    }, BROWSER_CLOSING_DELAY);
                });
            }
        };

        function taskDone () {
            this.pendingBrowserJobs.forEach(job => {
                this.emit('browser-job-done', job);
            });

            this.emit('done');
        }

        beforeEach(() => {
            closeCalled        = 0;
            abortCalled        = false;
            taskActionCallback = taskDone;

            runner
                .src('test/server/data/test-suites/basic/testfile2.js')
                .reporter(() => {
                    return {
                        reportTaskStart:    noop,
                        reportTaskDone:     noop,
                        reportTestDone:     noop,
                        reportFixtureStart: noop
                    };
                });
        });

        before(() => {
            browserProviderPool.addProvider('mock', MockBrowserProvider);

            Task.prototype._createBrowserJobs = function () {
                setTimeout(taskActionCallback.bind(this), TASK_ACTION_DELAY);

                return this.browserConnectionGroups.map(bcGroup => {
                    return { browserConnections: bcGroup };
                });
            };

            Task.prototype.abort = () => {
                abortCalled = true;
            };
        });

        after(() => {
            browserProviderPool.removeProvider('mock');

            Task.prototype._createBrowserJobs = origCreateBrowserJobs;
            Task.prototype.abort              = origAbort;
        });

        it('Should not stop the task until local connection browsers are not closed when task done', () => {
            return runner
                .browsers('mock:browser-alias1', 'mock:browser-alias2')
                .run()
                .then(() => {
                    expect(closeCalled).eql(2);
                });
        });

        it('Should not stop the task until local connection browsers are not closed when connection failed', () => {
            return testCafe
                .createBrowserConnection()
                .then(brokenConnection => {
                    brokenConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    taskActionCallback = () => {
                        brokenConnection.emit('error', new Error('I have failed :('));
                    };

                    return runner
                        .browsers(brokenConnection, 'mock:browser-alias')
                        .run();
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('I have failed :(');
                    expect(closeCalled).eql(1);
                });
        });

        it('Should not stop the task while connected browser is not in idle state', () => {
            const IDLE_DELAY = 50;

            let remoteConnection = null;

            return testCafe
                .createBrowserConnection()
                .then(bc => {
                    remoteConnection = bc;

                    remoteConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    remoteConnection.idle = false;

                    taskActionCallback = function () {
                        taskDone.call(this);

                        setTimeout(() => {
                            remoteConnection.idle = true;
                            remoteConnection.emit('idle');
                        }, IDLE_DELAY);
                    };

                    return runner
                        .browsers(remoteConnection)
                        .run();
                })
                .then(() => {
                    expect(remoteConnection.idle).to.be.true;
                    remoteConnection.close();
                });
        });

        it('Should be able to cancel test', () => {
            const IDLE_DELAY = 100;

            let remoteConnection = null;

            return testCafe
                .createBrowserConnection()
                .then(bc => {
                    remoteConnection = bc;

                    remoteConnection.establish('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 ' +
                                               '(KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36');

                    remoteConnection.idle = false;

                    // Don't let the test finish by emitting the task's 'done' event
                    taskActionCallback = () => void 0;

                    setTimeout(() => {
                        remoteConnection.idle = true;
                        remoteConnection.emit('idle');
                    }, IDLE_DELAY);

                    return runner
                        .browsers('mock:browser-alias1', remoteConnection)
                        .run()
                        .cancel();
                })
                .then(() => {
                    expect(closeCalled).eql(1);
                    expect(abortCalled).to.be.true;
                    expect(remoteConnection.idle).to.be.true;
                    remoteConnection.close();
                });
        });
    });

    it('Should interpret the empty array of the arguments as the "undefined" value', () => {
        runner.isCli = true;

        runner
            .src('/path-to-test')
            .browsers('ie')
            .reporter('json');

        runner.apiMethodWasCalled.reset();

        runner
            .src([])
            .browsers([])
            .reporter([]);

        expect(runner.configuration.getOption('src')).eql(['/path-to-test']);
        expect(runner.configuration.getOption('browsers')).eql(['ie']);
        expect(runner.configuration.getOption('reporter')).eql([ { name: 'json', output: void 0 } ]);
    });
});
