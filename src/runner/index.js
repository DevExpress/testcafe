import { resolve as resolvePath } from 'path';
import debug from 'debug';
import Promise from 'pinkie';
import promisifyEvent from 'promisify-event';
import mapReverse from 'map-reverse';
import { EventEmitter } from 'events';
import { flattenDeep as flatten, pull as remove } from 'lodash';
import Bootstrapper from './bootstrapper';
import Reporter from '../reporter';
import Task from './task';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { assertType, is } from '../errors/runtime/type-assertions';
import { renderForbiddenCharsList } from '../errors/test-run/utils';
import detectFFMPEG from '../utils/detect-ffmpeg';
import checkFilePath from '../utils/check-file-path';
import { addRunningTest, removeRunningTest, startHandlingTestErrors, stopHandlingTestErrors } from '../utils/handle-errors';
import OPTION_NAMES from '../configuration/option-names';
import FlagList from '../utils/flag-list';
import prepareReporters from '../utils/prepare-reporters';

const DEBUG_LOGGER = debug('testcafe:runner');

export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway, configuration) {
        super();

        this.proxy               = proxy;
        this.bootstrapper        = this._createBootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];
        this.configuration       = configuration;
        this.isCli               = false;

        // NOTE: This code is necessary only for displaying  marketing messages.
        this.reporterPlugings = [];

        this.apiMethodWasCalled = new FlagList({
            initialFlagValue: false,
            flags:            [OPTION_NAMES.src, OPTION_NAMES.browsers, OPTION_NAMES.reporter]
        });
    }

    _createBootstrapper (browserConnectionGateway) {
        return new Bootstrapper(browserConnectionGateway);
    }

    _disposeBrowserSet (browserSet) {
        return browserSet.dispose().catch(e => DEBUG_LOGGER(e));
    }

    _disposeReporters (reporters) {
        return Promise.all(reporters.map(reporter => reporter.dispose().catch(e => DEBUG_LOGGER(e))));
    }

    _disposeTestedApp (testedApp) {
        return testedApp ? testedApp.kill().catch(e => DEBUG_LOGGER(e)) : Promise.resolve();
    }

    async _disposeTaskAndRelatedAssets (task, browserSet, reporters, testedApp) {
        task.abort();
        task.clearListeners();

        await this._disposeAssets(browserSet, reporters, testedApp);
    }

    _disposeAssets (browserSet, reporters, testedApp) {
        return Promise.all([
            this._disposeBrowserSet(browserSet),
            this._disposeReporters(reporters),
            this._disposeTestedApp(testedApp)
        ]);
    }

    _prepareArrayParameter (array) {
        array = flatten(array);

        if (this.isCli)
            return array.length === 0 ? void 0 : array;

        return array;
    }

    _createCancelablePromise (taskPromise) {
        const promise           = taskPromise.then(({ completionPromise }) => completionPromise);
        const removeFromPending = () => remove(this.pendingTaskPromises, promise);

        promise
            .then(removeFromPending)
            .catch(removeFromPending);

        promise.cancel = () => taskPromise
            .then(({ cancelTask }) => cancelTask())
            .then(removeFromPending);

        this.pendingTaskPromises.push(promise);
        return promise;
    }

    // Run task
    _getFailedTestCount (task, reporter) {
        let failedTestCount = reporter.testCount - reporter.passed;

        if (task.opts.stopOnFirstFail && !!failedTestCount)
            failedTestCount = 1;

        return failedTestCount;
    }

    async _getTaskResult (task, browserSet, reporters, testedApp) {
        task.on('browser-job-done', job => browserSet.releaseConnection(job.browserConnection));

        const browserSetErrorPromise = promisifyEvent(browserSet, 'error');

        const taskDonePromise = task.once('done')
            .then(() => browserSetErrorPromise.cancel());


        const promises = [
            taskDonePromise,
            browserSetErrorPromise
        ];

        if (testedApp)
            promises.push(testedApp.errorPromise);

        try {
            await Promise.race(promises);
        }
        catch (err) {
            await this._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);

            throw err;
        }

        await this._disposeAssets(browserSet, reporters, testedApp);

        return this._getFailedTestCount(task, reporters[0]);
    }

    _createTask (tests, browserConnectionGroups, proxy, opts) {
        return new Task(tests, browserConnectionGroups, proxy, opts);
    }

    _runTask (reporterPlugins, browserSet, tests, testedApp) {
        let completed           = false;
        const task              = this._createTask(tests, browserSet.browserConnectionGroups, this.proxy, this.configuration.getOptions());
        const reporters         = reporterPlugins.map(reporter => new Reporter(reporter.plugin, task, reporter.outStream));
        const completionPromise = this._getTaskResult(task, browserSet, reporters, testedApp);

        task.on('start', startHandlingTestErrors);

        if (!this.configuration.getOption(OPTION_NAMES.skipUncaughtErrors)) {
            task.once('test-run-start', addRunningTest);
            task.once('test-run-done', removeRunningTest);
        }

        task.on('done', stopHandlingTestErrors);

        const setCompleted = () => {
            completed = true;
        };

        completionPromise
            .then(setCompleted)
            .catch(setCompleted);

        const cancelTask = async () => {
            if (!completed)
                await this._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);
        };

        return { completionPromise, cancelTask };
    }

    _registerAssets (assets) {
        assets.forEach(asset => this.proxy.GET(asset.path, asset.info));
    }

    _validateSpeedOption () {
        const speed = this.configuration.getOption(OPTION_NAMES.speed);

        if (speed === void 0)
            return;

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1)
            throw new GeneralError(RUNTIME_ERRORS.invalidSpeedValue);
    }

    _validateConcurrencyOption () {
        const concurrency = this.configuration.getOption(OPTION_NAMES.concurrency);

        if (concurrency === void 0)
            return;

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1)
            throw new GeneralError(RUNTIME_ERRORS.invalidConcurrencyFactor);
    }

    _validateProxyBypassOption () {
        let proxyBypass = this.configuration.getOption(OPTION_NAMES.proxyBypass);

        if (proxyBypass === void 0)
            return;

        assertType([ is.string, is.array ], null, '"proxyBypass" argument', proxyBypass);

        if (typeof proxyBypass === 'string')
            proxyBypass = [proxyBypass];

        proxyBypass = proxyBypass.reduce((arr, rules) => {
            assertType(is.string, null, '"proxyBypass" argument', rules);

            return arr.concat(rules.split(','));
        }, []);

        this.configuration.mergeOptions({ proxyBypass });
    }

    _validateScreenshotOptions () {
        const screenshotPath        = this.configuration.getOption(OPTION_NAMES.screenshotPath);
        const screenshotPathPattern = this.configuration.getOption(OPTION_NAMES.screenshotPathPattern);

        if (screenshotPath) {
            this._validateScreenshotPath(screenshotPath, 'screenshots base directory path');

            this.configuration.mergeOptions({ [OPTION_NAMES.screenshotPath]: resolvePath(screenshotPath) });
        }

        if (screenshotPathPattern)
            this._validateScreenshotPath(screenshotPathPattern, 'screenshots path pattern');

        if (!screenshotPath && screenshotPathPattern)
            throw new GeneralError(RUNTIME_ERRORS.cannotUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified);
    }

    async _validateVideoOptions () {
        const videoPath            = this.configuration.getOption(OPTION_NAMES.videoPath);
        const videoEncodingOptions = this.configuration.getOption(OPTION_NAMES.videoEncodingOptions);

        let videoOptions = this.configuration.getOption(OPTION_NAMES.videoOptions);

        if (!videoPath) {
            if (videoOptions || videoEncodingOptions)
                throw new GeneralError(RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified);

            return;
        }

        this.configuration.mergeOptions({ [OPTION_NAMES.videoPath]: resolvePath(videoPath) });

        if (!videoOptions) {
            videoOptions = {};

            this.configuration.mergeOptions({ [OPTION_NAMES.videoOptions]: videoOptions });
        }

        if (videoOptions.ffmpegPath)
            videoOptions.ffmpegPath = resolvePath(videoOptions.ffmpegPath);
        else
            videoOptions.ffmpegPath = await detectFFMPEG();

        if (!videoOptions.ffmpegPath)
            throw new GeneralError(RUNTIME_ERRORS.cannotFindFFMPEG);
    }

    async _validateRunOptions () {
        this._validateScreenshotOptions();
        await this._validateVideoOptions();
        this._validateSpeedOption();
        this._validateConcurrencyOption();
        this._validateProxyBypassOption();
    }

    _createRunnableConfiguration () {
        return this.bootstrapper
            .createRunnableConfiguration()
            .then(runnableConfiguration => {
                this.emit('done-bootstrapping');

                return runnableConfiguration;
            });
    }

    _validateScreenshotPath (screenshotPath, pathType) {
        const forbiddenCharsList = checkFilePath(screenshotPath);

        if (forbiddenCharsList.length)
            throw new GeneralError(RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath, screenshotPath, pathType, renderForbiddenCharsList(forbiddenCharsList));
    }

    _setBootstrapperOptions () {
        this.configuration.prepare();
        this.configuration.notifyAboutOverridenOptions();

        this.bootstrapper.sources      = this.configuration.getOption(OPTION_NAMES.src) || this.bootstrapper.sources;
        this.bootstrapper.browsers     = this.configuration.getOption(OPTION_NAMES.browsers) || this.bootstrapper.browsers;
        this.bootstrapper.concurrency  = this.configuration.getOption(OPTION_NAMES.concurrency);
        this.bootstrapper.appCommand   = this.configuration.getOption(OPTION_NAMES.appCommand) || this.bootstrapper.appCommand;
        this.bootstrapper.appInitDelay = this.configuration.getOption(OPTION_NAMES.appInitDelay);
        this.bootstrapper.filter       = this.configuration.getOption(OPTION_NAMES.filter) || this.bootstrapper.filter;
        this.bootstrapper.reporters    = this.configuration.getOption(OPTION_NAMES.reporter) || this.bootstrapper.reporters;
    }

    // API
    embeddingOptions (opts) {
        const { assets, TestRunCtor } = opts;

        this._registerAssets(assets);
        this.configuration.mergeOptions({ TestRunCtor });

        return this;
    }

    src (...sources) {
        if (this.apiMethodWasCalled.src)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.src);

        sources = this._prepareArrayParameter(sources);
        this.configuration.mergeOptions({ [OPTION_NAMES.src]: sources });

        this.apiMethodWasCalled.src = true;

        return this;
    }

    browsers (...browsers) {
        if (this.apiMethodWasCalled.browsers)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.browsers);

        browsers = this._prepareArrayParameter(browsers);
        this.configuration.mergeOptions({ browsers });

        this.apiMethodWasCalled.browsers = true;

        return this;
    }

    concurrency (concurrency) {
        this.configuration.mergeOptions({ concurrency });

        return this;
    }

    reporter (name, output) {
        if (this.apiMethodWasCalled.reporter)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.reporter);

        let reporters = prepareReporters(name, output);

        reporters = this._prepareArrayParameter(reporters);

        this.configuration.mergeOptions({ [OPTION_NAMES.reporter]: reporters });

        this.apiMethodWasCalled.reporter = true;

        return this;
    }

    filter (filter) {
        this.configuration.mergeOptions({ filter });

        return this;
    }

    useProxy (proxy, proxyBypass) {
        this.configuration.mergeOptions({ proxy, proxyBypass });

        return this;
    }

    screenshots (path, takeOnFails, pattern) {
        this.configuration.mergeOptions({
            [OPTION_NAMES.screenshotPath]:         path,
            [OPTION_NAMES.takeScreenshotsOnFails]: takeOnFails,
            [OPTION_NAMES.screenshotPathPattern]:  pattern
        });

        return this;
    }

    video (path, options, encodingOptions) {
        this.configuration.mergeOptions({
            [OPTION_NAMES.videoPath]:            path,
            [OPTION_NAMES.videoOptions]:         options,
            [OPTION_NAMES.videoEncodingOptions]: encodingOptions
        });

        return this;
    }

    startApp (command, initDelay) {
        this.configuration.mergeOptions({
            [OPTION_NAMES.appCommand]:   command,
            [OPTION_NAMES.appInitDelay]: initDelay
        });

        return this;
    }

    run (options = {}) {
        this.apiMethodWasCalled.reset();

        const {
            skipJsErrors,
            disablePageReloads,
            quarantineMode,
            debugMode,
            selectorTimeout,
            assertionTimeout,
            pageLoadTimeout,
            speed,
            debugOnFail,
            skipUncaughtErrors,
            stopOnFirstFail
        } = options;

        this.configuration.mergeOptions({
            skipJsErrors:       skipJsErrors,
            disablePageReloads: disablePageReloads,
            quarantineMode:     quarantineMode,
            debugMode:          debugMode,
            debugOnFail:        debugOnFail,
            selectorTimeout:    selectorTimeout,
            assertionTimeout:   assertionTimeout,
            pageLoadTimeout:    pageLoadTimeout,
            speed:              speed,
            skipUncaughtErrors: skipUncaughtErrors,
            stopOnFirstFail:    stopOnFirstFail
        });

        this._setBootstrapperOptions();

        const runTaskPromise = Promise.resolve()
            .then(() => this._validateRunOptions())
            .then(() => this._createRunnableConfiguration())
            .then(({ reporterPlugins, browserSet, tests, testedApp }) => {
                this.reporterPlugings = reporterPlugins;

                return this._runTask(reporterPlugins, browserSet, tests, testedApp);
            });

        return this._createCancelablePromise(runTaskPromise);
    }

    async stop () {
        // NOTE: When taskPromise is cancelled, it is removed from
        // the pendingTaskPromises array, which leads to shifting indexes
        // towards the beginning. So, we must copy the array in order to iterate it,
        // or we can perform iteration from the end to the beginning.
        const cancellationPromises = mapReverse(this.pendingTaskPromises, taskPromise => taskPromise.cancel());

        await Promise.all(cancellationPromises);
    }
}
