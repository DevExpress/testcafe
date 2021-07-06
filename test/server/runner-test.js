/*eslint-disable no-console */

const path                    = require('path');
const chai                    = require('chai');
const { expect }              = chai;
const request                 = require('request');
const { times, uniqBy }       = require('lodash');
const consoleWrapper          = require('./helpers/console-wrapper');
const isAlpine                = require('./helpers/is-alpine');
const createTestCafe          = require('../../lib/');
const COMMAND                 = require('../../lib/browser/connection/command');
const Task                    = require('../../lib/runner/task');
const BrowserConnection       = require('../../lib/browser/connection');
const browserProviderPool     = require('../../lib/browser/provider/pool');
const delay                   = require('../../lib/utils/delay');
const OptionNames             = require('../../lib/configuration/option-names');
const { GeneralError }        = require('../../lib/errors/runtime');
const { RUNTIME_ERRORS }      = require('../../lib/errors/types');
const { createReporter }      = require('../functional/utils/reporter');
const proxyquire              = require('proxyquire');
const BrowserConnectionStatus = require('../../lib/browser/connection/status');
const { noop }                = require('lodash');
const Test                    = require('../../lib/api/structure/test');

chai.use(require('chai-string'));

describe('Runner', () => {
    let testCafe                  = null;
    let runner                    = null;
    let connection                = null;
    let origRemoteBrowserProvider = null;

    const BROWSER_NAME = `${isAlpine() ? 'chromium' : 'chrome'}:headless`;

    const remoteBrowserProviderMock = {
        openBrowser () {
            return Promise.resolve();
        },

        closeBrowser () {
            return Promise.resolve();
        }
    };

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
        it('Should raise an error if browser was not found for the alias', function () {
            this.timeout(5000);

            return runner
                .browsers('browser42')
                .reporter('list')
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch((err) => {
                    expect(err.message).eql('Cannot find the browser. "browser42" is neither a ' +
                                            'known browser alias, nor a path to an executable file.');
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
                    expect(err.message).eql('Cannot find the browser. "/Applications/Firefox.app" is neither a ' +
                                            'known browser alias, nor a path to an executable file.');
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
                    expect(err.message).eql('You have not specified a browser.');
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
                expect(err.message).startsWith('You cannot call the "browsers" method more than once. Specify an array of parameters instead');
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
                    expect(err.message).eql('The "reporter42" reporter does not exist. ' +
                                            'Check the reporter parameter for errors.');
                });
        });

        it('Should fallback to the default reporter if reporter was not set', () => {
            const storedRunTaskFn = runner._runTask;

            runner._runTask = ({ reporterPlugins }) => {
                const reporterPlugin = reporterPlugins[0].plugin;

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
                expect(err.message).startsWith('You cannot call the "reporter" method more than once. Specify an array of parameters instead');
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

        it('Should not display a message about "overridden options" after call "screenshots" method with undefined arguments', () => {
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

        it('should allow to set object as a `screenshots` method parameter', async () => {
            await runner
                .screenshots({
                    path:        'path',
                    takeOnFails: true,
                    pathPattern: 'pathPattern',
                    fullPage:    true
                })
                ._applyOptions();

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

    describe('--retry-test-pages', () => {
        it('hostname is not localhost and ssl is disabled', () => {
            runner.configuration.mergeOptions({ [OptionNames.retryTestPages]: true });
            runner.configuration.mergeOptions({ [OptionNames.hostname]: 'http://example.com' });

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql(
                        'Cannot enable the \'retryTestPages\' option. Apply one of the following two solutions:\n' +
                        '-- set \'localhost\' as the value of the \'hostname\' option\n' +
                        '-- run TestCafe over HTTPS\n'
                    );
                });
        });

        it('hostname is localhost and ssl is disabled', () => {
            runner.configuration.mergeOptions({ [OptionNames.retryTestPages]: true });

            runner._runTask = () => {
                throw new Error('Promise rejection expected');
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .catch(err => {
                    expect(err.message).eql('Promise rejection expected');
                });
        });

        it('hostname is not localhost and ssl is enabled', () => {
            runner.configuration.mergeOptions({ [OptionNames.retryTestPages]: true });
            runner.configuration.mergeOptions({ [OptionNames.hostname]: 'http://example.com' });
            runner.configuration.mergeOptions({ [OptionNames.ssl]: 'ssl' });

            runner._runTask = () => {
                throw new Error('Promise rejection expected');
            };

            return runner
                .browsers(connection)
                .src('test/server/data/test-suites/basic/testfile2.js')
                .run()
                .catch(err => {
                    expect(err.message).eql('Promise rejection expected');
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
                    expect(err.message).eql('You cannot manage advanced video parameters when the video recording capability is off. ' +
                                            'Specify the root storage folder for video content to enable video recording.');
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
                    expect(err.message).eql('You cannot manage advanced video parameters when the video recording capability is off. ' +
                                            'Specify the root storage folder for video content to enable video recording.');
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

                return Promise.resolve({
                    browserConnectionGroups: []
                });
            };

            runner._runTask = ({ tests }) => {
                const actualFiles = uniqBy(tests.map(test => test.testFile.filename));

                expect(actualFiles).eql(expectedFiles);

                runner._runTask = storedRunTaskFn;

                return Promise.resolve({});
            };

            return runner
                .browsers(BROWSER_NAME)
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
                    expect(err.message).eql("Source files do not contain valid 'fixture' and 'test' declarations.");
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
                expect(err.message).startsWith('You cannot call the "src" method more than once. Specify an array of parameters instead');
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

            runner._runTask = ({ tests }) => {
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
                    expect(err.message).eql('No tests match your filter.\n' +
                        'See https://testcafe.io/documentation/402638/reference/configuration-file#filter.');
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
                        `Could not find test files at the following location: "${process.cwd()}".\n` +
                        'Check patterns for errors:\n' +
                        '\n' +
                        'non-existing-file-1.js\n' +
                        'non-existing-file-2.js\n' +
                        '\n' +
                        'or launch TestCafe from a different directory.\n' +
                        'For more information on how to specify test locations, see https://testcafe.io/documentation/402639/reference/command-line-interface#file-pathglob-pattern.');

                    expect(connectionsCount).eql(0);
                });
        });

        it('Should raise an error if the browser connections are not opened', function () {
            return testCafe
                .createBrowserConnection()
                .then(brokenConnection => {
                    return runner
                        .browsers(brokenConnection)
                        .reporter('list')
                        .src('test/server/data/test-suites/basic/testfile2.js')
                        .run({ browserInitTimeout: 100 });
                })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql('Cannot establish one or more browser connections.\n' +
                                            '1 of 1 browser connections have not been established:\n' +
                                            '- remote\n\n' +
                                            'Hints:\n' +
                                            '- Increase the value of the "browserInitTimeout" option if it is too low ' +
                                            '(currently: 0.1 seconds for all browsers). This option determines how long TestCafe waits for browsers to be ready.\n' +
                                            '- The error can also be caused by network issues or remote device failure. ' +
                                            'Make sure that your network connection is stable and you can reach the remote device.');
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
                                                        'Chrome 41.0.2227.1 / macOS 10.10.1. Cannot run further tests.');
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
                                            'If you did not close the browser yourself, browser performance or network issues may be at fault.');
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
                        expect(err.message).eql('The concurrency factor should be an integer greater than or equal to 1.');
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
                        expect(err.message).contains(`The "proxyBypass" argument (${type}) is not of expected type (string or an array)`);
                    });
            };

            return expectProxyBypassError(1, 'number')
                .then(() => expectProxyBypassError({}, 'object'))
                .then(() => expectProxyBypassError(true, 'boolean'))
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

        it('Should raise an error if request timeout options have wrong type', async () => {
            let errorCount = 0;

            const checkIncorrectRequestTimeout = (optionName, optionValue, expectedErrorMessage) => {
                return runner
                    .run({ [optionName]: optionValue })
                    .catch(err => {
                        errorCount++;

                        expect(err.message).eql(expectedErrorMessage);

                        delete runner.configuration._options[optionName];
                    });
            };

            await checkIncorrectRequestTimeout(OptionNames.pageRequestTimeout, true, '"pageRequestTimeout" option (boolean) is not of expected type (non-negative number).');
            await checkIncorrectRequestTimeout(OptionNames.pageRequestTimeout, -1, '"pageRequestTimeout" option (-1) is not of expected type (non-negative number).');
            await checkIncorrectRequestTimeout(OptionNames.ajaxRequestTimeout, true, '"ajaxRequestTimeout" option (boolean) is not of expected type (non-negative number).');
            await checkIncorrectRequestTimeout(OptionNames.ajaxRequestTimeout, -1, '"ajaxRequestTimeout" option (-1) is not of expected type (non-negative number).');

            expect(errorCount).eql(4);
        });

        describe('On Linux without a graphics subsystem', () => {

            const browserConnectionGateway = {
                startServingConnection: noop,
                stopServingConnection:  noop
            };
            const compilerService          = {
                init:     noop,
                getTests: () => [new Test({ currentFixture: void 0 })]
            };

            let runnerLinux = null;

            class BrowserConnectionMock extends BrowserConnection {
                constructor (...args) {
                    super(...args);

                    this.status = BrowserConnectionStatus.opened;
                }
            }

            function setupBootstrapper () {
                const BootstrapperMock = proxyquire('../../lib/runner/bootstrapper', {
                    '../browser/connection': BrowserConnectionMock,
                });

                return new BootstrapperMock({ browserConnectionGateway, compilerService });
            }

            function createMockRunner () {
                const RunnerMock = proxyquire('../../lib/runner/index', {
                    '../utils/detect-display': () => false,
                    'os-family':               { linux: true, win: false, mac: false },
                });

                const runnerLocal = new RunnerMock({
                    proxy:                    testCafe.proxy,
                    browserConnectionGateway: browserConnectionGateway,
                    configuration:            testCafe.configuration.clone(),
                    compilerService:          compilerService
                });

                runnerLocal.bootstrapper = setupBootstrapper();

                return runnerLocal;
            }

            beforeEach(() => {
                runnerLinux = createMockRunner();
            });

            it('Should raise an error when browser is specified as non-headless', async function () {
                this.timeout(3000);

                const browserName = BROWSER_NAME.replace(':headless', '');

                return runnerLinux
                    .browsers(browserName)
                    .run()
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch((err) => {
                        expect(err.message).eql(
                            `Your Linux version does not have a graphic subsystem to run ${browserName} with a GUI. ` +
                            'You can launch the browser in headless mode. ' +
                            'If you use a portable browser executable, ' +
                            "specify the browser alias before the path instead of the 'path' prefix. " +
                            'For more information, see ' +
                            'https://testcafe.io/documentation/402828/guides/concepts/browsers#test-in-headless-mode'
                        );
                    });
            });

            it('Should raise an error when browser is specified by a path', async function () {
                return runnerLinux
                    .browsers({ path: '/non/exist' })
                    .run()
                    .then(() => {
                        throw new Error('Promise rejection expected');
                    })
                    .catch((err) => {
                        expect(err.message).eql(
                            'Your Linux version does not have a graphic subsystem to run {"path":"/non/exist"} with a GUI. ' +
                            'You can launch the browser in headless mode. ' +
                            'If you use a portable browser executable, ' +
                            `specify the browser alias before the path instead of the 'path' prefix. ` +
                            'For more information, see ' +
                            'https://testcafe.io/documentation/402828/guides/concepts/browsers#test-in-headless-mode'
                        );
                    });
            });

            it('Should not raise an error when browser is specified as headless', async function () {
                let isErrorThrown = false;

                return runnerLinux
                    .browsers(`${BROWSER_NAME}`)
                    ._applyOptions()
                    .then(() => runnerLinux._validateRunOptions())
                    .then(() => runnerLinux._createRunnableConfiguration())
                    .catch(() => {
                        isErrorThrown = true;
                    })
                    .finally(() => {
                        expect(isErrorThrown).to.be.false;
                    });
            });

            it('Should not raise an error when remote browser is passed as BrowserConnection', async function () {
                const browserInfo = await browserProviderPool.getBrowserInfo('remote');
                let isErrorThrown = false;

                return runnerLinux
                    .browsers([new BrowserConnection(browserConnectionGateway, browserInfo)])
                    ._applyOptions()
                    .then(() => runnerLinux._validateRunOptions())
                    .then(() => runnerLinux._createRunnableConfiguration())
                    .catch(() => {
                        isErrorThrown = true;
                    })
                    .finally(() => {
                        expect(isErrorThrown).to.be.false;
                    });
            });
        });

        it('Should raise an error if concurrency more than 1 and cdp port isn\'t undefined', () => {
            const concurrency = 2;
            const cdpPort     = '9223';

            return runner
                .browsers(`${BROWSER_NAME}:emulation;cdpPort=${cdpPort}`)
                .concurrency(concurrency)
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch((err) => {
                    expect(err.message).eql('The value of the "concurrency" option includes the CDP port.');
                });
        });

        it('Should raise an error if the Quarantine Mode is represented by invalid arguments', async () => {
            let errorCount = 0;

            const checkQuarantineOptions = (quarantineOptions, expectedErrorMessage) => {
                return runner
                    .run(quarantineOptions)
                    .catch(err => {
                        errorCount++;

                        expect(err.message).eql(expectedErrorMessage);

                        delete runner.configuration._options[OptionNames.quarantineMode];
                    });
            };

            await checkQuarantineOptions({ quarantineMode: { attemptLimit: 5, successThreshold: 5 } }, 'The value of "attemptLimit" (5) should be greater then the value of "successThreshold" (5).');
            await checkQuarantineOptions({ quarantineMode: { attemptLimit: 5, successThreshold: 10 } }, 'The value of "attemptLimit" (5) should be greater then the value of "successThreshold" (10).');
            await checkQuarantineOptions({ quarantineMode: { attemptLimit: 1 } }, 'The "attemptLimit" parameter only accepts values of 2 and up.');
            await checkQuarantineOptions({ quarantineMode: { attemptLimit: 0 } }, 'The "attemptLimit" parameter only accepts values of 2 and up.');
            await checkQuarantineOptions({ quarantineMode: { successThreshold: 0 } }, 'The "successThreshold" parameter only accepts values of 1 and up.');
            await checkQuarantineOptions({ quarantineMode: { test: '1' } }, 'The "quarantineMode" option does not exist. Specify "attemptLimit" and "successThreshold" to configure quarantine mode.');

            expect(errorCount).eql(6);
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
                expect(err.message).startsWith('You cannot call the "clientScripts" method more than once. Specify an array of parameters instead.');
            }
        });
    });

    describe('.compilerOptions', () => {
        it('Should warn about deprecated options', () => {
            return runner
                .tsConfigPath('path-to-ts-config')
                .run()
                .catch(() => {
                    expect(runner.warningLog.messages).eql([
                        "The 'tsConfigPath' option is deprecated and will be removed in the next major release. " +
                        "Use the 'compilerOptions.typescript.configPath' option instead."
                    ]);
                });
        });

        it('Should raise an error if the compilation options is specified wrongly', async () => {
            const validateCompilerOptions = (opts, errMsg) => {
                return runner
                    .compilerOptions(opts)
                    .run()
                    .catch(err => {
                        expect(err.message).eql(errMsg);

                        delete runner.configuration._options[OptionNames.compilerOptions];
                    });
            };

            await validateCompilerOptions({
                'wrong-compiler-type': {},
                'typescript':          {}
            }, "You cannot specify options for the 'wrong-compiler-type' compiler.");

            await validateCompilerOptions({
                'wrong-compiler-type-1': {},
                'wrong-compiler-type-2': {}
            }, "You cannot specify options for the 'wrong-compiler-type-1' and 'wrong-compiler-type-2' compilers.");
        });
    });

    describe('Regression', () => {
        it('Should not have unhandled rejections in runner (GH-825)', function () {
            this.timeout(10000);

            let rejectionReason = null;

            process.on('unhandledRejection', reason => {
                rejectionReason = reason;
            });

            return runner
                .browsers(BROWSER_NAME)
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
            },

            isHeadlessBrowser () {
                return true;
            }
        };

        function taskDone () {
            this._pendingBrowserJobs.forEach(job => {
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
                .reporter(createReporter());
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

    it('Should interpret the empty array of the arguments as the "undefined" value', async () => {
        runner.isCli = true;

        await runner
            .src('/path-to-test')
            .browsers('remote')
            .reporter('json')
            ._applyOptions();

        runner.apiMethodWasCalled.reset();

        await runner
            .src([])
            .browsers([])
            .reporter([])
            ._applyOptions();

        expect(runner.configuration.getOption('src')).eql(['/path-to-test']);
        expect(runner.configuration.getOption('browsers')).to.be.an('array').that.not.empty;
        expect(runner.configuration.getOption('browsers')[0]).to.include({ providerName: 'remote' });
        expect(runner.configuration.getOption('reporter')).eql([{ name: 'json', output: void 0 }]);
    });

    describe('"Unable to establish one or more of the specifed browser connections" error message', function () {
        const warningProvider = {
            openBrowser (browserId, _, browserName) {
                this.reportWarning(browserId, `some warning from "${browserName}"`);

                const currentConnection = BrowserConnection.getById(browserId);

                currentConnection.emit('error', new GeneralError(RUNTIME_ERRORS.cannotEstablishBrowserConnection));

                return Promise.resolve();
            },

            closeBrowser () {
                return Promise.resolve();
            }
        };

        beforeEach(function () {
            browserProviderPool.addProvider('warningProvider', warningProvider);
        });

        afterEach(function () {
            browserProviderPool.removeProvider('warningProvider');
        });

        it('Should include warnings from browser providers', function () {
            return runner
                .src('./test/server/data/test-suites/basic/testfile1.js')
                .browsers(['warningProvider:browser-alias1', 'warningProvider:browser-alias2'])
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).contains('- some warning from "browser-alias1"');
                    expect(err.message).contains('- some warning from "browser-alias2"');
                });
        });

        it('Should include timeout with the default values when "browser-init-timeout" is not specified', function () {
            return runner
                .src('./test/server/data/test-suites/basic/testfile1.js')
                .browsers(['warningProvider:browser-alias1', 'warningProvider:browser-alias2'])
                .run()
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).eql(
                        'Cannot establish one or more browser connections.\n' +
                        '2 of 2 browser connections have not been established:\n' +
                        '- warningProvider:browser-alias1\n' +
                        '- warningProvider:browser-alias2\n\n' +
                        'Hints:\n' +
                        '- some warning from "browser-alias1"\n' +
                        '- some warning from "browser-alias2"\n' +
                        '- Increase the value of the "browserInitTimeout" option if it is too low ' +
                        '(currently: 2 minutes for local browsers and 6 minutes for remote browsers). ' +
                        'This option determines how long TestCafe waits for browsers to be ready.\n' +
                        '- The error can also be caused by network issues or remote device failure. ' +
                        'Make sure that your network connection is stable and you can reach the remote device.'
                    );
                });
        });

        it('Should include hint about used concurrency factor if it\'s greater than 3', function () {
            return runner
                .src('./test/server/data/test-suites/basic/testfile1.js')
                .browsers(['warningProvider:browser-alias1'])
                .concurrency(4)
                .run({ browserInitTimeout: 100 })
                .then(() => {
                    throw new Error('Promise rejection expected');
                })
                .catch(err => {
                    expect(err.message).contains('The host machine may not be powerful enough to handle the specified concurrency factor (4). ' +
                                                 'Try to decrease the concurrency factor or allocate more computing resources to the host machine.');
                });
        });
    });
});
