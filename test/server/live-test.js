const expect               = require('chai').expect;
const noop                 = require('lodash').noop;
const Promise              = require('pinkie');
const path                 = require('path');
const createTestCafe       = require('../../lib/index');
const Controller           = require('../../lib/live/controller');
const FileWatcher          = require('../../lib/live/file-watcher');
const LiveModeRunner       = require('../../lib/live/test-runner');
const LiveModeBootstrapper = require('../../lib/live/bootstrapper');


const fileName1 = path.resolve('test/server/data/test-suites/live/testfile1.js');
const fileName2 = path.resolve('test/server/data/test-suites/live/testfile2.js');
const fileName3 = path.resolve('test/server/data/test-suites/live/testfile3.js');
const fileName4 = path.resolve('test/server/data/test-suites/live/testfile4.js');

const externalModulePath = path.resolve('test/server/data/test-suites/live/module.js');

class FileWatcherMock extends FileWatcher {
    constructor (files) {
        super(files);
    }

    addFile (file) {
        if (file.indexOf('node_modules') > -1)
            return;

        this.files = this.files || [];

        this.files.push(file);
    }
}

let errors = [];

class ControllerMock extends Controller {
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

    _getBrowserConnections () {
        return Promise.resolve();
    }
}

class RunnerMock extends LiveModeRunner {
    constructor ({ proxy, browserConnectionGateway, configuration }, runTimeout = 0) {
        super(proxy, browserConnectionGateway, configuration.clone());

        this.runCount   = 0;
        this.runTimeout = runTimeout;
    }

    get watchedFiles () {
        return this.controller.fileWatcher.files;
    }

    _createController () {
        return new ControllerMock(this);
    }

    _waitInfinite () {
        return Promise.resolve();
    }

    _runTask () {
        return Promise.resolve();
    }

    _createBootstrapper (browserConnectionGateway) {
        return new BootstrapperMock(this, browserConnectionGateway);
    }

    _createCancelablePromise (promise) {
        return promise;
    }

    runTests () {
        return new Promise(resolve => {
            setTimeout(resolve, this.runTimeout);
        })
            .then(() => {
                this.runCount++;

                return super.runTests();
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

    function runTests (fileName, runTimeout) {
        runner = new RunnerMock(testCafe, runTimeout);

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
        return runTests(fileName1)
            .then(() => {
                expect(runner.runCount).eql(1);

                const { tests } = runner.liveConfigurationCache;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('test1');
                expect(runner.watchedFiles).eql([fileName1]);
            });
    });

    it('rerun', function () {
        return runTests(fileName1)
            .then(() => {
                return runner.controller.restart()
                    .then(() => {
                        expect(runner.runCount).eql(2);
                    });
            });
    });

    it('rerun and add file', function () {
        return runTests(fileName1)
            .then(() => {
                runner.src(fileName2);
            })
            .then(() => {
                return runner.controller.restart();
            })
            .then(() => {
                expect(runner.runCount).eql(2);

                const tests = runner.liveConfigurationCache.tests;

                expect(tests.length).eql(2);
                expect(tests[0].name).eql('test2');
                expect(tests[1].name).eql('test3');
            });
    });

    it('rerun uncompilable', function () {
        return runTests(fileName1)
            .then(() => {
                runner.src(fileName3);

                return runner.controller.restart();
            })
            .then(() => {
                expect(errors.length).eql(1);
                expect(errors[0]).contains('ERROR: Error: Cannot prepare tests due to an error');
                expect(runner.runCount).eql(2);
            })
            .then(() => {
                runner.clearSources();
                runner.src(fileName1);

                return runner.controller.restart();
            })
            .then(() => {
                expect(runner.runCount).eql(3);
                expect(errors.length).eql(1);

                const tests = runner.liveConfigurationCache.tests;

                expect(tests.length).eql(1);
                expect(tests[0].name).eql('test1');

                runner.clearSources();
                runner.src(fileName3);

                return runner.controller.restart();
            })
            .then(() => {
                expect(runner.runCount).eql(4);
                expect(errors.length).eql(2);
            });
    });

    it('required module is added to watchers', function () {
        return runTests(fileName4)
            .then(() => {
                expect(runner.runCount).eql(1);
                expect(runner.watchedFiles).contains(externalModulePath);
            });
    });

    it('run uncompilable', function () {
        return runTests(fileName3)
            .then(() => {
                expect(errors.length).eql(1);
                expect(errors[0]).contains('ERROR: Error: Cannot prepare tests due to an error');
            });
    });

    it('two live mode runners', function () {
        try {
            testCafe.createLiveModeRunner();
            testCafe.createLiveModeRunner();
        }
        catch (err) {
            expect(err.message.indexOf('Cannot create multiple Live Mode runners') > -1).to.be.true;
        }
    });

    it('same runner runs twice', function () {
        try {
            runner = new RunnerMock(testCafe);

            runner.browsers('chrome');

            runner.run();
            runner.run();
        }
        catch (err) {
            expect(err.message.indexOf('Cannot run Live Mode runner multiple times') > -1).to.be.true;
        }
    });

    describe('Controller', function () {
        it('restart', function () {
            return runTests(fileName1)
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
            return runTests(fileName1)
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
            return runTests(fileName1, 100)
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
            return runTests(fileName1)
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
