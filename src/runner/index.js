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


const DEFAULT_SELECTOR_TIMEOUT  = 10000;
const DEFAULT_ASSERTION_TIMEOUT = 3000;
const DEFAULT_PAGE_LOAD_TIMEOUT = 3000;

const DEBUG_LOGGER = debug('testcafe:runner');

export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway, options = {}) {
        super();

        this.proxy               = proxy;
        this.bootstrapper        = new Bootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];

        this.opts = {
            externalProxyHost:      null,
            proxyBypass:            null,
            screenshotPath:         null,
            takeScreenshotsOnFails: false,
            screenshotPathPattern:  null,
            skipJsErrors:           false,
            quarantineMode:         false,
            debugMode:              false,
            retryTestPages:         options.retryTestPages,
            selectorTimeout:        DEFAULT_SELECTOR_TIMEOUT,
            pageLoadTimeout:        DEFAULT_PAGE_LOAD_TIMEOUT
        };
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
        task.removeAllListeners();

        await Runner._disposeAssets(browserSet, reporters, testedApp);
    }

    static _disposeAssets (browserSet, reporters, testedApp) {
        return Promise.all([
            Runner._disposeBrowserSet(browserSet),
            Runner._disposeReporters(reporters),
            Runner._disposeTestedApp(testedApp)
        ]);
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
            promisifyEvent(task, 'done'),
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
        const task              = new Task(tests, browserSet.browserConnectionGroups, this.proxy, this.opts);
        const reporters         = reporterPlugins.map(reporter => new Reporter(reporter.plugin, task, reporter.outStream));
        const completionPromise = this._getTaskResult(task, browserSet, reporters, testedApp);

        task.once('start', startHandlingTestErrors);

        if (!this.opts.skipUncaughtErrors) {
            task.on('test-run-start', addRunningTest);
            task.on('test-run-done', removeRunningTest);
        }

        task.once('done', stopHandlingTestErrors);

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

    _validateRunOptions () {
        const concurrency           = this.bootstrapper.concurrency;
        const speed                 = this.opts.speed;
        const screenshotPath        = this.opts.screenshotPath;
        const screenshotPathPattern = this.opts.screenshotPathPattern;
        let proxyBypass             = this.opts.proxyBypass;

        if (screenshotPath) {
            this._validateScreenshotPath(screenshotPath, 'screenshots base directory path');

            this.opts.screenshotPath = resolvePath(screenshotPath);
        }

        if (screenshotPathPattern)
            this._validateScreenshotPath(screenshotPathPattern, 'screenshots path pattern');

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1)
            throw new GeneralError(MESSAGE.invalidSpeedValue);

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1)
            throw new GeneralError(MESSAGE.invalidConcurrencyFactor);

        if (proxyBypass) {
            assertType([ is.string, is.array ], null, '"proxyBypass" argument', proxyBypass);

            if (typeof proxyBypass === 'string')
                proxyBypass = [proxyBypass];

            proxyBypass = proxyBypass.reduce((arr, rules) => {
                assertType(is.string, null, '"proxyBypass" argument', rules);

                return arr.concat(rules.split(','));
            }, []);

            this.opts.proxyBypass = proxyBypass;
        }
    }

    _validateScreenshotPath (screenshotPath, pathType) {
        const forbiddenCharsList = checkFilePath(screenshotPath);

        if (forbiddenCharsList.length)
            throw new GeneralError(MESSAGE.forbiddenCharatersInScreenshotPath, screenshotPath, pathType, renderForbiddenCharsList(forbiddenCharsList));
    }

    // API
    embeddingOptions (opts) {
        this._registerAssets(opts.assets);
        this.opts.TestRunCtor = opts.TestRunCtor;

        return this;
    }

    src (...sources) {
        this.bootstrapper.sources = this.bootstrapper.sources.concat(flatten(sources));

        return this;
    }

    browsers (...browsers) {
        this.bootstrapper.browsers = this.bootstrapper.browsers.concat(flatten(browsers));

        return this;
    }

    concurrency (concurrency) {
        this.bootstrapper.concurrency = concurrency;

        return this;
    }

    reporter (name, outStream) {
        this.bootstrapper.reporters.push({
            name,
            outStream
        });

        return this;
    }

    filter (filter) {
        this.bootstrapper.filter = filter;

        return this;
    }

    useProxy (externalProxyHost, proxyBypass) {
        this.opts.externalProxyHost = externalProxyHost;
        this.opts.proxyBypass       = proxyBypass;

        return this;
    }

    screenshots (path, takeOnFails = false, pattern = null) {
        this.opts.takeScreenshotsOnFails = takeOnFails;
        this.opts.screenshotPath         = path;
        this.opts.screenshotPathPattern  = pattern;

        return this;
    }

    startApp (command, initDelay) {
        this.bootstrapper.appCommand   = command;
        this.bootstrapper.appInitDelay = initDelay;

        return this;
    }

    run ({ skipJsErrors, disablePageReloads, quarantineMode, debugMode, selectorTimeout, assertionTimeout, pageLoadTimeout, speed = 1, debugOnFail, skipUncaughtErrors, stopOnFirstFail, disableTestSyntaxValidation } = {}) {
        this.opts.skipJsErrors       = !!skipJsErrors;
        this.opts.disablePageReloads = !!disablePageReloads;
        this.opts.quarantineMode     = !!quarantineMode;
        this.opts.debugMode          = !!debugMode;
        this.opts.debugOnFail        = !!debugOnFail;
        this.opts.selectorTimeout    = selectorTimeout === void 0 ? DEFAULT_SELECTOR_TIMEOUT : selectorTimeout;
        this.opts.assertionTimeout   = assertionTimeout === void 0 ? DEFAULT_ASSERTION_TIMEOUT : assertionTimeout;
        this.opts.pageLoadTimeout    = pageLoadTimeout === void 0 ? DEFAULT_PAGE_LOAD_TIMEOUT : pageLoadTimeout;
        this.opts.speed              = speed;
        this.opts.skipUncaughtErrors = !!skipUncaughtErrors;
        this.opts.stopOnFirstFail    = !!stopOnFirstFail;

        this.bootstrapper.disableTestSyntaxValidation = disableTestSyntaxValidation;

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
