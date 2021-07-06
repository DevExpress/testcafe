const { expect }                    = require('chai');
const { noop }                      = require('lodash');
const path                          = require('path');
const createTestCafe                = require('../../lib/index');
const FileWatcher                   = require('../../lib/live/file-watcher');
const LiveModeController            = require('../../lib/live/controller');
const LiveModeRunner                = require('../../lib/live/test-runner');
const LiveModeBootstrapper          = require('../../lib/live/bootstrapper');
const LiveModeKeyboardEventObserver = require('../../lib/live/keyboard-observer');

const testFileWithSingleTestPath               = path.resolve('test/server/data/test-suites/live/test.js');
const testFileWithMultipleTestsPath            = path.resolve('test/server/data/test-suites/live/multiple-tests.js');
const testFileWithSyntaxErrorPath              = path.resolve('test/server/data/test-suites/live/test-with-syntax-error.js');
const testFileWithExternalModulePath           = path.resolve('test/server/data/test-suites/live/test-external-module.js');
const testFileWithExternalModuleRerunPath      = path.resolve('test/server/data/test-suites/live/test-external-module-rerun.js');
const testFileWithExternalUnexistingModulePath = path.resolve('test/server/data/test-suites/live/test-external-unexisting-module.js');
const testFileWithSkippedTestPath              = path.resolve('test/server/data/test-suites/live/test-with-skipped.js');

const externalModulePath         = path.resolve('test/server/data/test-suites/live/module.js');
const externalCommonJsModulePath = path.resolve('test/server/data/test-suites/live/commonjs-module.js');

const DOCKER_TESTCAFE_FOLDER_REGEXP = /^\/usr\/lib\/node_modules\/testcafe/;

const browserSetMock = {
    browserConnectionGroups: []
};

class FileWatcherMock extends FileWatcher {
    addFile (controller, file) {
        if (!FileWatcher.shouldWatchFile(file.replace(DOCKER_TESTCAFE_FOLDER_REGEXP, '')))
            return;

        this.files = this.files || [];

        this.files.push(file);
    }
}

let errors = [];

class LiveModeKeyboardEventObserverMock extends LiveModeKeyboardEventObserver {
    _listenKeyEvents () {
    }
}

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

    _createKeyboardObserver () {
        return new LiveModeKeyboardEventObserverMock();
    }

    _createFileWatcher () {
        return new FileWatcherMock();
    }
}

class BootstrapperMock extends LiveModeBootstrapper {
    constructor (runner, browserConnectionGateway) {
        super(runner, browserConnectionGateway);
    }

    createRunnableConfiguration () {
        return Promise.resolve({
            reporterPlugins:     [],
            tests:               [],
            browserSet:          browserSetMock,
            testedApp:           {},
            commonClientScripts: []
        });
    }
}

class RunnerMock extends LiveModeRunner {
    constructor ({ proxy, browserConnectionGateway, configuration }, { runTimeout = 0, errorOnValidate = false, onBootstrapDone = noop }) {
        super({
            proxy,
            browserConnectionGateway,
            configuration: configuration.clone()
        });

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
                this.emit('tests-completed');

                this.stopInfiniteWaiting();
            })
            .catch(error => {
                this.emit('error-occurred', error);
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
            .browsers('remote')
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

        const observer = new LiveModeKeyboardEventObserverMock();

        observer.controllers = [];
    });

    it('run', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                expect(runner.runCount).eql(1);

                const { tests } = runner.configurationCache;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('basic');
                expect(runner.disposed).eql(true);
                expect(runner.watchedFiles).include(testFileWithSingleTestPath);
            });
    });

    it('rerun', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                return runner.controller.restart()
                    .then(() => {
                        expect(runner.runCount).eql(2);
                    });
            });
    });

    it('rerun with require', function () {
        return runTests(testFileWithExternalModuleRerunPath)
            .then(() => {
                let err = null;

                runner.controller.fileWatcher._onChanged(runner.controller, externalCommonJsModulePath);

                try {
                    require(externalCommonJsModulePath);
                }
                catch (e) {
                    err = e;
                }

                expect(err).is.null;
            });
    });

    it('rerun and add file', function () {
        return runTests(testFileWithSingleTestPath)
            .then(() => {
                runner.src(testFileWithMultipleTestsPath);
                return runner._applyOptions();
            })
            .then(() => {
                return runner.controller.restart();
            })
            .then(() => {
                expect(runner.runCount).eql(2);

                const tests = runner.configurationCache.tests;

                expect(tests.length).eql(2);
                expect(tests[0].name).eql('multiple 1');
                expect(tests[1].name).eql('multiple 2');
                expect(runner.testRunController.expectedTestCount).eql(2);
            });
    });

    it('rerun uncompilable', function () {
        expect(errors.length).eql(0);

        return runTests(testFileWithSingleTestPath)
            .then(() => {
                runner.src(testFileWithSyntaxErrorPath);
                return runner._applyOptions();
            })
            .then(() => {
                return runner.controller.restart();
            })
            .then(() => {
                expect(errors.length).eql(1);
                expect(errors[0].toString()).contains('Error: Cannot prepare tests due to the following error');
                expect(runner.runCount).eql(2);
            })
            .then(() => {
                runner.clearSources();
                runner.src(testFileWithSingleTestPath);

                return runner._applyOptions();
            })
            .then(() => {
                return runner.controller.restart();
            })
            .then(() => {
                expect(runner.runCount).eql(3);
                expect(errors.length).eql(1);

                const tests = runner.configurationCache.tests;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('basic');

                runner.clearSources();
                runner.src(testFileWithSyntaxErrorPath);

                return runner._applyOptions();
            })
            .then(() => {
                return runner.controller.restart();
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
                expect(errors[0].toString()).contains('Error: Cannot prepare tests due to the following error');
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
            expect(err.message.indexOf('Cannot launch multiple live mode instances of the TestCafe test runner') > -1).to.be.true;
        }
    });

    it('same runner runs twice', function () {
        this.timeout(6000);

        runner = new RunnerMock(testCafe, {})
            .browsers('remote');

        const promise = runner.run();

        try {
            runner.run();
        }
        catch (err) {
            expect(err.message.indexOf('Cannot launch the same live mode instance of the TestCafe test runner multiple times') > -1).to.be.true;
        }

        return promise;
    });

    it('error on validate', function () {
        return runTests(testFileWithSingleTestPath, { errorOnValidate: true })
            .catch(err => {
                expect(err.message.indexOf('validationError') > -1).to.be.true;
            });
    });

    it('"test files not found" error', function (done) {
        runner = new RunnerMock(testCafe, {});

        runner.once('error-occurred', error => {
            expect(error.message).contain('Could not find test files at the following location');

            done();
        });

        runner
            .src('dummy.js')
            .browsers('remote')
            .run()
            .then(() => {
                throw new Error('Should raise the "Test files not found" error');
            });
    });

    it('Keyboard event observer stopped after run', function () {
        let counter = 0;

        runner = new RunnerMock(testCafe, {});

        runner.once('tests-completed', () => {
            counter++;

            expect(runner.controller.keyboardObserver.controllers.length).eql(1);
        });

        return runner
            .src(testFileWithSingleTestPath)
            .browsers('remote')
            .run()
            .then(() => {
                counter++;
                expect(runner.controller.keyboardObserver.controllers.length).eql(0);
            })
            .then(() => {
                expect(counter).eql(2);
            });
    });

    it('skipped tests', async () => {
        return runTests(testFileWithSkippedTestPath)
            .then(() => {
                expect(runner.testRunController.expectedTestCount).eql(2);
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

                    return runner.controller.restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(2);
                });
        });

        it('restart sequence', function () {
            return runTests(testFileWithSingleTestPath)
                .then(() => {
                    expect(runner.runCount).eql(1);

                    runner.controller.restart();

                    expect(runner.controller.restarting).eql(false);
                    expect(runner.controller.running).eql(true);

                    runner.controller.restart();

                    expect(runner.controller.restarting).eql(true);
                    expect(runner.controller.running).eql(true);

                    expect(runner.runCount).eql(1);
                });
        });

        it('stop', function () {
            return runTests(testFileWithSingleTestPath, { runTimeout: 100 })
                .then(() => {
                    expect(runner.runCount).eql(1);
                    runner.controller.restart();

                    return runner.controller.stop();
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

                    runner.controller.toggleWatching();

                    return runner.controller.restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(1);

                    runner.controller.toggleWatching();

                    return runner.controller.restart();
                })
                .then(() => {
                    expect(runner.runCount).eql(2);
                });
        });
    });
});
