import Promise from 'pinkie';
import { noop } from 'lodash';
import LiveModeTestRunController from './test-run-controller';
import LiveModeController from './controller';
import Runner from '../runner';
import LiveModeBootstrapper from './bootstrapper';
import parseFileList from '../utils/parse-file-list';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';

class LiveModeRunner extends Runner {
    constructor (proxy, browserConnectionGateway, options) {
        super(proxy, browserConnectionGateway, options);

        /* EVENTS */
        this.TEST_RUN_DONE_EVENT         = 'test-run-done';
        this.REQUIRED_MODULE_FOUND_EVENT = 'require-module-found';

        this.stopping            = false;
        this.tcRunnerTaskPromise = null;
        this.stopInfiniteWaiting = noop;
        this.preventRunCall      = false;

        this.testRunController = new LiveModeTestRunController();

        this.embeddingOptions({
            TestRunCtor: this.testRunController.TestRunCtor,
            assets:      []
        });

        this.controller = this._createController();
    }

    runTests (isFirstRun = false) {
        let runError = null;

        return this._finishPreviousTestRuns()
            .then(() => {
                return this._validateRunnableConfiguration(isFirstRun);
            })
            .then(() => {
                this.testRunController.setExpectedTestCount(this.liveConfigurationCache.tests.filter(t => !t.skip).length);
            })
            .then(() => {
                this.tcRunnerTaskPromise = super.run(this.opts);

                return this.tcRunnerTaskPromise;
            })
            .catch(err => {
                this.setBootstrappingError(null);

                runError = err;
            })
            .then(() => {
                this.tcRunnerTaskPromise = null;

                this.emit(this.TEST_RUN_DONE_EVENT, { err: runError });
            });
    }

    _createRunnableConfiguration () {
        if (this.liveConfigurationCache)
            return Promise.resolve(this.liveConfigurationCache);

        return super._createRunnableConfiguration()
            .then(configuration => {
                this.liveConfigurationCache = configuration;

                return configuration;
            });
    }

    setBootstrappingError (err) {
        this.bootstrappingError = err;
    }

    run (options) {
        if (this.preventRunCall)
            throw new GeneralError(MESSAGE.cannotRunLiveModeRunnerMultipleTimes);

        this.preventRunCall = true;

        this.opts = Object.assign({}, this.opts, options);

        this._setBootstrapperOptions();

        const fileListPromise = parseFileList(this.bootstrapper.sources, process.cwd());

        fileListPromise
            .then(files => this.controller.init(files))
            .then(() => this._createRunnableConfiguration())
            .then(() => this.runTests(true));


        return this._waitUntilExit()
            .then(() => {
                if (this.liveConfigurationCache) {
                    const { browserSet } = this.liveConfigurationCache;

                    if (browserSet)
                        browserSet.browserConnections.forEach(bc => bc.forceIdle());
                }

                this.controller.dispose();
            })
            .then(() => {
                this.preventRunCall = false;
            });
    }

    suspend () {
        if (!this.tcRunnerTaskPromise)
            return Promise.resolve();

        return new Promise(resolve => {
            this.testRunController.once(this.testRunController.RUN_STOPPED_EVENT, () => {
                this.stopping = false;
                resolve();

                this.emit(this.TEST_RUN_DONE_EVENT, {});
            });

            this.stopping = true;
            this.testRunController.stop();
            this.tcRunnerTaskPromise.cancel();
        });
    }

    exit () {
        if (this.tcRunnerTaskPromise)
            this.tcRunnerTaskPromise.cancel();

        return Promise.resolve()
            .then(() => this.stopInfiniteWaiting());
    }

    async _finishPreviousTestRuns () {
        if (!this.liveConfigurationCache.tests) return;

        this.testRunController.run();
    }

    _validateRunnableConfiguration (isFirstRun) {
        if (isFirstRun) {
            if (this.bootstrappingError)
                return Promise.reject(this.bootstrappingError);

            return Promise.resolve();
        }

        return this.bootstrapper._getTests()
            .then(tests => {
                this.liveConfigurationCache.tests = tests;

                return this.bootstrappingError ? Promise.reject(this.bootstrappingError) : Promise.resolve();
            });
    }

    _createTask (tests, browserConnectionGroups, proxy, opts) {
        opts.live = true;

        return super._createTask(tests, browserConnectionGroups, proxy, opts);
    }

    _createBootstrapper (browserConnectionGateway) {
        return new LiveModeBootstrapper(this, browserConnectionGateway);
    }

    _createController () {
        return new LiveModeController(this);
    }

    _waitUntilExit () {
        return new Promise(resolve => {
            this.stopInfiniteWaiting = resolve;
        });
    }

    _disposeBrowserSet () {
        return Promise.resolve();
    }
}

export default LiveModeRunner;
