const expect               = require('chai').expect;
const noop                 = require('lodash').noop;
const Promise              = require('pinkie');
const path                 = require('path');
const createTestCafe       = require('../../lib/index');
const FileWatcher          = require('../../lib/live/file-watcher');
const LiveModeController   = require('../../lib/live/controller');
const LiveModeRunner       = require('../../lib/live/test-runner');
const LiveModeBootstrapper = require('../../lib/live/bootstrapper');

const testFileWithSingleTestPath               = path.resolve('test/server/data/test-suites/live/test.js');
const testFileWithMultipleTestsPath            = path.resolve('test/server/data/test-suites/live/multiple-tests.js');
const testFileWithSyntaxErrorPath              = path.resolve('test/server/data/test-suites/live/test-with-syntax-error.js');
const testFileWithExternalModulePath           = path.resolve('test/server/data/test-suites/live/test-external-module.js');
const testFileWithExternalUnexistingModulePath = path.resolve('test/server/data/test-suites/live/test-external-unexisting-module.js');

const externalModulePath = path.resolve('test/server/data/test-suites/live/module.js');

class FileWatcherMock extends FileWatcher {
    constructor (files) {
        super(files);
    }

    addFile (file) {
        if (file.replace(/^\/usr\/lib\/node_modules\/testcafe/, '').indexOf('node_modules') > -1)
            return;

        this.files = this.files || [];

        this.files.push(file);
    }
}

let errors = [];

class ControllerMock extends LiveModeController {
    constructor (runner) {
        super(runner);

        this.logger = {
            writeIntroMessage:          noop,
            writeStopRunningMessage:    noop,
            writeTestsFinishedMessage:  noop,
            writeRunTestsMessage:       noop,
            writeToggleWatchingMessage: noop,
            writeExitMessage:           noop,

            err: err => {
                errors.push(err);
            }
        };
    }

    dispose () {
    }

    _createFileWatcher (src) {
        this.fileWatcher = new FileWatcherMock(src);

        return this.fileWatcher;
    }

    _listenKeyPress () {
    }
}

class BootstrapperMock extends LiveModeBootstrapper {
    constructor (runner, browserConnectionGateway) {
        super(runner, browserConnectionGateway);
    }

    createRunnableConfiguration () {
        return Promise.resolve({
            reporterPlugins: [],
            tests:           [],
            browserSet:      {},
            testedApp:       {}
        });
    }
}

class RunnerMock extends LiveModeRunner {
    constructor ({ proxy, browserConnectionGateway, configuration }, { runTimeout = 0, errorOnValidate = false, onBootstrapDone = noop }) {
        super(proxy, browserConnectionGateway, configuration.clone());

        this.runCount        = 0;
        this.runTimeout      = runTimeout;
        this.errorOnValidate = errorOnValidate;
        this.disposed        = false;

        this.once('done-bootstrapping', onBootstrapDone);
    }

    get watchedFiles () {
        return this.controller.fileWatcher.files;
    }

    _createController () {
        return new ControllerMock(this);
    }

    _runTask () {
        return Promise.resolve();
    }

    _dispose () {
        this.disposed = true;

        return super._dispose();
    }

    _createBootstrapper (browserConnectionGateway) {
        return new BootstrapperMock(this, browserConnectionGateway);
    }

    _createCancelablePromise (promise) {
        return promise;
    }

    _validateScreenshotOptions () {
        if (this.errorOnValidate)
            throw new Error('validationError');
        super._validateScreenshotOptions();
    }

    runTests () {
        return new Promise(resolve => {
            setTimeout(resolve, this.runTimeout);
        })
            .then(() => {
                this.runCount++;

                return super.runTests();
            })
            .then(() => {
                this.stopInfiniteWaiting();
            });
    }

    stop () {
        return new Promise(resolve => {
            setTimeout(resolve, 10);
        })
            .then(() => super.stop());
    }

    src (sources) {
        this.apiMethodWasCalled.src = false;

        super.src(sources);

        this._setBootstrapperOptions();

        return this;
    }

    clearSources () {
        this.bootstrapper.sources = [];
    }

    resetConfiguration () {
        this.liveConfigurationCache = null;
    }
}

describe('TestCafe Live', function () {
    let testCafe = null;
    let runner   = null;

    function runTests (fileName, options = {}) {
        runner = new RunnerMock(testCafe, options);

        return runner
            .src(fileName)
            .browsers('chrome')
            .run();
    }

    before(function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(function (tc) {
                testCafe = tc;
            });
    });

    after(function () {
        return testCafe.close();
    });

    beforeEach(function () {
        errors = [];
    });

    it('run', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                expect(runner.runCount).eql(1);

                const { tests } = runner.liveConfigurationCache;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('test1');
                expect(runner.disposed).eql(true);
                expect(runner.watchedFiles).eql([testFileWithSingleTestPath]);
            });
    });

    it('rerun', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                return runner.controller._restart()
                    .then(() => {
                        expect(runner.runCount).eql(2);
                    });
            });
    });

    it('rerun and add file', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                runner.src(testFileWithMultipleTestsPath);
            })
            .then(() => {
                return runner.controller._restart();
            })
            .then(() => {
                expect(runner.runCount).eql(2);

                const tests = runner.liveConfigurationCache.tests;

                expect(tests.length).eql(2);
                expect(tests[0].name).eql('test2');
                expect(tests[1].name).eql('test3');
                expect(runner.testRunController.expectedTestCount).eql(2);
            });
    });

    it('rerun uncompilable', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                runner.src(testFileWithSyntaxErrorPath);

                return runner.controller._restart();
            })
            .then(() => {
                expect(errors.length).eql(1);
                expect(errors[0].toString()).contains('Error: Cannot prepare tests due to an error');
                expect(runner.runCount).eql(2);
            })
            .then(() => {
                runner.clearSources();
                runner.src(testFileWithSingleTestPath);

                return runner.controller._restart();
            })
            .then(() => {
                expect(runner.runCount).eql(3);
                expect(errors.length).eql(1);

                const tests = runner.liveConfigurationCache.tests;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('test1');

                runner.clearSources();
                runner.src(testFileWithSyntaxErrorPath);

                return runner.controller._restart();
            })
            .then(() => {
                expect(runner.runCount).eql(4);
                expect(errors.length).eql(2);
            });
    });

    it('required module is added to watchers', function () {
        return runTests(testFileWithExternalModulePath)
            .then(() => {
                expect(runner.runCount).eql(1);
                expect(runner.watchedFiles).contains(externalModulePath);
            });
    });

    it('run uncompilable', function () {
        return runTests(testFileWithSyntaxErrorPath)
            .then(() => {
                expect(errors.length).eql(1);
                expect(errors[0].toString()).contains('Error: Cannot prepare tests due to an error');
            });
    });

    it('done-bootstrap event', function () {
        let handled = false;

        return runTests(testFileWithExternalUnexistingModulePath, {
            onBootstrapDone: () => {
                handled = true;
            }
        })
            .then(() => {
                expect(handled).eql(true);
                expect(errors.length).eql(1);
                expect(errors[0].toString()).contains('Error: Cannot find module \'./non-existing-module\'');
            });
    });

    it('two live mode runners', function () {
        try {
            testCafe.createLiveModeRunner();
            testCafe.createLiveModeRunner();
        }
        catch (err) {
            expect(err.message.indexOf('Cannot create multiple live mode runners') > -1).to.be.true;
        }
    });

    it('same runner runs twice', function () {
        try {
            runner = new RunnerMock(testCafe, {});

            runner.browsers('chrome');

            runner.run();
            runner.run();
        }
        catch (err) {
            expect(err.message.indexOf('Cannot run a live mode runner multiple times') > -1).to.be.true;
        }
    });

    it('error on validate', function () {
        return runTests(testFileWithSingleTestPath, { errorOnValidate: true })
            .catch(err => {
                expect(err.message.indexOf('validationError') > -1).to.be.true;
            });
    });

    describe('Controller', function () {
        it('restart', function () {
            return runTests(testFileWithSingleTestPath)
                .then(() => {
                    expect(runner.controller.running).eql(false);
                    expect(runner.controller.restarting).eql(false);
                    expect(runner.controller.watchingPaused).eql(false);
                    expect(runner.controller.stopping).eql(false);

                    expect(runner.runCount).eql(1);

                    return runner.controller._restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(2);
                });
        });

        it('restart sequence', function () {
            return runTests(testFileWithSingleTestPath)
                .then(() => {
                    expect(runner.runCount).eql(1);

                    runner.controller._restart();

                    expect(runner.controller.restarting).eql(false);
                    expect(runner.controller.running).eql(true);

                    runner.controller._restart();

                    expect(runner.controller.restarting).eql(true);
                    expect(runner.controller.running).eql(true);

                    expect(runner.runCount).eql(1);
                });
        });

        it('stop', function () {
            return runTests(testFileWithSingleTestPath, { runTimeout: 100 })
                .then(() => {
                    expect(runner.runCount).eql(1);
                    runner.controller._restart();

                    return runner.controller._stop();
                })
                .then(() => {
                    expect(runner.runCount).eql(1);
                    expect(runner.controller.restarting).eql(false);
                    expect(runner.controller.running).eql(false);
                });
        });

        it('watching', function () {
            return runTests(testFileWithSingleTestPath)
                .then(() => {
                    expect(runner.runCount).eql(1);

                    runner.controller._toggleWatching();

                    return runner.controller._restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(1);

                    runner.controller._toggleWatching();

                    return runner.controller._restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(2);
                });
        });
    });
});
