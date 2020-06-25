import { noop } from 'lodash';
import LiveModeTestRunController from './test-run-controller';
import LiveModeController from './controller';
import Runner from '../runner';
import LiveModeBootstrapper from './bootstrapper';
import parseFileList from '../utils/parse-file-list';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

class LiveModeRunner extends Runner {
    constructor (proxy, browserConnectionGateway, configuration) {
        super(proxy, browserConnectionGateway, configuration);

        this.stopping              = false;
        this.runnerTaskPromise     = null;
        this.stopInfiniteWaiting   = noop;
        this.rejectInfiniteWaiting = noop;

        this.assets = null;

        this.testRunController = new LiveModeTestRunController();
        this.controller        = this._createController();


        this.embeddingOptions({
            TestRunCtor: this.testRunController.TestRunCtor,
            assets:      []
        });
        this.controller                 = this._createController();
        this.runnableConfigurationCache = null;
    }

    runTests (isFirstRun = false) {
        let runError = null;

        return this._finishPreviousTestRuns()
            .then(() => {
                return this._validateRunnableConfiguration(isFirstRun);
            })
            .then(() => {
                const executedTestCount = this.runnableConfigurationCache.tests.filter(t => !t.skip).length;

                this.testRunController.setExpectedTestCount(executedTestCount);
            })
            .then(() => {
                this.runnerTaskPromise = super.run(this.opts);

                return this.runnerTaskPromise;
            })
            .catch(err => {
                this.setBootstrappingError(null);

                runError = err;
            })
            .then(() => {
                this.runnerTaskPromise = null;

                this.controller.onTestRunDone(runError);
            });
    }

    _validateRunOptions () {
        return super._validateRunOptions()
            .catch(err => {
                this.rejectInfiniteWaiting(err);
            });
    }

    _createRunnableConfiguration () {
        if (this.runnableConfigurationCache)
            return Promise.resolve(this.runnableConfigurationCache);

        this.configuration.prepare(this.opts);

        return super._createRunnableConfiguration()
            .then(runnableConfiguration => {
                this.runnableConfigurationCache = runnableConfiguration;

                return runnableConfiguration;
            })
            .catch(err => {
                this.rejectInfiniteWaiting(err);
            });
    }

    setBootstrappingError (err) {
        this.bootstrappingError = err;
    }

    run (options) {
        this.runnableConfigurationCache = null;

        if (this._running)
            throw new GeneralError(RUNTIME_ERRORS.cannotRunLiveModeRunnerMultipleTimes);

        this._running = this._waitUntilExit()
            .then(() => {
                return this._dispose();
            })
            .then(() => {
                delete this._running;
            });

        this.opts = Object.assign({}, this.opts, options);

        const fileListPromise = parseFileList(this.configuration.getSrcOption(), process.cwd());

        fileListPromise
            .then(files => {
                return this.controller.init(files);
            })
            .then(() => this._createRunnableConfiguration())
            .then(() => this.runTests(true));

        return this._running;
    }

    suspend () {
        if (!this.runnerTaskPromise)
            return Promise.resolve();

        this.stopping = true;
        this.testRunController.stop();
        this.runnerTaskPromise.cancel();

        return this.testRunController.allTestsCompletePromise
            .then(() => {
                this.stopping = false;

                this.controller.onTestRunDone();
            });
    }

    stop () {
        return super.stop()
            .then(() => {
                return this.controller.exit();
            });
    }

    exit () {
        if (this.runnerTaskPromise)
            this.runnerTaskPromise.cancel();

        return Promise.resolve()
            .then(() => this.stopInfiniteWaiting())
            .then(() => this._running);
    }

    async _finishPreviousTestRuns () {
        if (!this.runnableConfigurationCache.tests) return;

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
                this.runnableConfigurationCache.tests = tests;

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
        return new Promise((resolve, reject) => {
            this.stopInfiniteWaiting   = resolve;
            this.rejectInfiniteWaiting = reject;
        });
    }

    _disposeAssets (browserSet, reporters, testedApp) {
        this.assets = { browserSet, reporters, testedApp };

        return Promise.resolve();
    }

    _dispose () {
        this.controller.dispose();

        if (!this.assets)
            return Promise.resolve();

        const { browserSet, reporters, testedApp } = this.assets;

        return super._disposeAssets(browserSet, reporters, testedApp);
    }
}

export default LiveModeRunner;
