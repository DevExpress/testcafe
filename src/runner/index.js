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
import MESSAGE from '../errors/runtime/message';
import { assertType, is } from '../errors/runtime/type-assertions';
import renderForbiddenCharsList from '../errors/render-forbidden-chars-list';
import checkFilePath from '../utils/check-file-path';
import { addRunningTest, removeRunningTest, startHandlingTestErrors, stopHandlingTestErrors } from '../utils/handle-errors';
import OPTION_NAMES from '../configuration/option-names';
import FlagList from '../utils/flag-list';
import prepareReporters from '../utils/prepare-reporters';

const DEBUG_LOGGER = debug('testcafe:runner');

const DEFAULT_TIMEOUT = {
    selector:  10000,
    assertion: 3000,
    pageLoad:  3000
};

export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway, configuration) {
        super();

        this.proxy               = proxy;
        this.bootstrapper        = new Bootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];
        this.configuration       = configuration;
        this.isCli               = false;

        this.apiMethodWasCalled = new FlagList({
            initialFlagValue: false,
            flags:            [OPTION_NAMES.src, OPTION_NAMES.browsers, OPTION_NAMES.reporter]
        });
    }

    static _disposeBrowserSet (browserSet) {
        return browserSet.dispose().catch(e => DEBUG_LOGGER(e));
    }

    static _disposeReporters (reporters) {
        return Promise.all(reporters.map(reporter => reporter.dispose().catch(e => DEBUG_LOGGER(e))));
    }

    static _disposeTestedApp (testedApp) {
        return testedApp ? testedApp.kill().catch(e => DEBUG_LOGGER(e)) : Promise.resolve();
    }

    static async _disposeTaskAndRelatedAssets (task, browserSet, reporters, testedApp) {
        task.abort();
        task.clearListeners();

        await Runner._disposeAssets(browserSet, reporters, testedApp);
    }

    static _disposeAssets (browserSet, reporters, testedApp) {
        return Promise.all([
            Runner._disposeBrowserSet(browserSet),
            Runner._disposeReporters(reporters),
            Runner._disposeTestedApp(testedApp)
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

        const promises = [
            task.once('done'),
            promisifyEvent(browserSet, 'error')
        ];

        if (testedApp)
            promises.push(testedApp.errorPromise);

        try {
            await Promise.race(promises);
        }
        catch (err) {
            await Runner._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);

            throw err;
        }

        await Runner._disposeAssets(browserSet, reporters, testedApp);

        return this._getFailedTestCount(task, reporters[0]);
    }

    _runTask (reporterPlugins, browserSet, tests, testedApp) {
        let completed           = false;
        const task              = new Task(tests, browserSet.browserConnectionGroups, this.proxy, this.configuration.getOptions());
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
                await Runner._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);
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
            throw new GeneralError(MESSAGE.invalidSpeedValue);
    }

    _validateConcurrencyOption () {
        const concurrency = this.configuration.getOption(OPTION_NAMES.concurrency);

        if (concurrency === void 0)
            return;

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1)
            throw new GeneralError(MESSAGE.invalidConcurrencyFactor);
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
            throw new GeneralError(MESSAGE.cantUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified);
    }

    _validateRunOptions () {
        this._validateScreenshotOptions();
        this._validateSpeedOption();
        this._validateConcurrencyOption();
        this._validateProxyBypassOption();
    }

    _validateScreenshotPath (screenshotPath, pathType) {
        const forbiddenCharsList = checkFilePath(screenshotPath);

        if (forbiddenCharsList.length)
            throw new GeneralError(MESSAGE.forbiddenCharatersInScreenshotPath, screenshotPath, pathType, renderForbiddenCharsList(forbiddenCharsList));
    }

    _setBootstrapperOptions () {
        this.bootstrapper.sources                     = this.configuration.getOption(OPTION_NAMES.src) || this.bootstrapper.sources;
        this.bootstrapper.browsers                    = this.configuration.getOption(OPTION_NAMES.browsers) || this.bootstrapper.browsers;
        this.bootstrapper.concurrency                 = this.configuration.getOption(OPTION_NAMES.concurrency) || this.bootstrapper.concurrency;
        this.bootstrapper.appCommand                  = this.configuration.getOption(OPTION_NAMES.appCommand) || this.bootstrapper.appCommand;
        this.bootstrapper.appInitDelay                = this.configuration.getOption(OPTION_NAMES.appInitDelay) || this.bootstrapper.appInitDelay;
        this.bootstrapper.disableTestSyntaxValidation = this.configuration.getOption(OPTION_NAMES.disableTestSyntaxValidation);
        this.bootstrapper.filter                      = this.configuration.getOption(OPTION_NAMES.filter) || this.bootstrapper.filter;
        this.bootstrapper.reporters                   = this.configuration.getOption(OPTION_NAMES.reporter) || this.bootstrapper.reporters;
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
            throw new GeneralError(MESSAGE.multipleAPIMethodCallForbidden, OPTION_NAMES.src);

        sources = this._prepareArrayParameter(sources);
        this.configuration.mergeOptions({ [OPTION_NAMES.src]: sources });

        this.apiMethodWasCalled.src = true;

        return this;
    }

    browsers (...browsers) {
        if (this.apiMethodWasCalled.browsers)
            throw new GeneralError(MESSAGE.multipleAPIMethodCallForbidden, OPTION_NAMES.browsers);

        browsers = this._prepareArrayParameter(browsers);
        this.configuration.mergeOptions({ browsers });

        this.apiMethodWasCalled.browsers = true;

        return this;
    }

    concurrency (concurrency) {
        this.configuration.mergeOptions({ concurrency });

        return this;
    }

    reporter (name, fileNameOrStream) {
        if (this.apiMethodWasCalled.reporter)
            throw new GeneralError(MESSAGE.multipleAPIMethodCallForbidden, OPTION_NAMES.reporter);

        let reporters = prepareReporters(name, fileNameOrStream);

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

    screenshots (path, takeOnFails = false, pattern = null) {
        this.configuration.mergeOptions({
            [OPTION_NAMES.screenshotPath]:         path,
            [OPTION_NAMES.takeScreenshotsOnFails]: takeOnFails,
            [OPTION_NAMES.screenshotPathPattern]:  pattern
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

    run ({ skipJsErrors, disablePageReloads, quarantineMode, debugMode, selectorTimeout, assertionTimeout, pageLoadTimeout, speed = 1, debugOnFail, skipUncaughtErrors, stopOnFirstFail, disableTestSyntaxValidation } = {}) {
        this.apiMethodWasCalled.reset();

        this.configuration.mergeOptions({
            skipJsErrors:                !!skipJsErrors,
            disablePageReloads:          !!disablePageReloads,
            quarantineMode:              !!quarantineMode,
            debugMode:                   !!debugMode,
            debugOnFail:                 !!debugOnFail,
            selectorTimeout:             selectorTimeout === void 0 ? DEFAULT_TIMEOUT.selector : selectorTimeout,
            assertionTimeout:            assertionTimeout === void 0 ? DEFAULT_TIMEOUT.assertion : assertionTimeout,
            pageLoadTimeout:             pageLoadTimeout === void 0 ? DEFAULT_TIMEOUT.pageLoad : pageLoadTimeout,
            speed:                       speed,
            skipUncaughtErrors:          !!skipUncaughtErrors,
            stopOnFirstFail:             !!stopOnFirstFail,
            disableTestSyntaxValidation: !!disableTestSyntaxValidation
        });

        this._setBootstrapperOptions();

        const runTaskPromise = Promise.resolve()
            .then(() => {
                this._validateRunOptions();

                return this.bootstrapper.createRunnableConfiguration();
            })
            .then(({ reporterPlugins, browserSet, tests, testedApp }) => {
                this.emit('done-bootstrapping');

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
