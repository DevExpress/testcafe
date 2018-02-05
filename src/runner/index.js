import Promise from 'pinkie';
import promisifyEvent from 'promisify-event';
import mapReverse from 'map-reverse';
import { resolve as resolvePath } from 'path';
import { EventEmitter } from 'events';
import { flattenDeep as flatten, pull as remove } from 'lodash';
import Bootstrapper from './bootstrapper';
import Reporter from '../reporter';
import Task from './task';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';


const DEFAULT_SELECTOR_TIMEOUT  = 10000;
const DEFAULT_ASSERTION_TIMEOUT = 3000;
const DEFAULT_PAGE_LOAD_TIMEOUT = 3000;


export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway) {
        super();

        this.proxy               = proxy;
        this.bootstrapper        = new Bootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];

        this.opts = {
            externalProxyHost:      null,
            screenshotPath:         null,
            takeScreenshotsOnFails: false,
            skipJsErrors:           false,
            quarantineMode:         false,
            debugMode:              false,
            selectorTimeout:        DEFAULT_SELECTOR_TIMEOUT,
            pageLoadTimeout:        DEFAULT_PAGE_LOAD_TIMEOUT
        };
    }

    static async _disposeTaskAndRelatedAssets (task, browserSet, testedApp) {
        console.log("--------------------_disposeTaskAndRelatedAssets");
        task.abort();
        task.removeAllListeners();

        await Runner._disposeBrowserSetAndTestedApp(browserSet, testedApp);
    }

    static async _disposeBrowserSetAndTestedApp (browserSet, testedApp) {
        console.log('_disposeBrowserSetAndTestedApp');
        await browserSet.dispose();

        if (testedApp)
            await testedApp.kill();
    }

    _createCancelablePromise (taskPromise) {
        var promise           = taskPromise.then(({ completionPromise }) => completionPromise);
        var removeFromPending = () => remove(this.pendingTaskPromises, promise);

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
    async _getTaskResult (task, browserSet, reporter, testedApp) {
        console.log("----------_getTaskResult");
        task.on('browser-job-done', job => browserSet.releaseConnection(job.browserConnection));
        browserSet.on('error', () => console.log('---------------------browserSet OnError'));

        var promises = [
            promisifyEvent(task, 'done'),
            promisifyEvent(browserSet, 'error')
        ];

        if (testedApp)
            promises.push(testedApp.errorPromise);

        try {
            console.log("------Promise.race");
            await Promise.race(promises).then(() => console.log("-------------done won race"));
        }
        catch (err) {
            console.log("------catch Promise.race");
            await Runner._disposeTaskAndRelatedAssets(task, browserSet, testedApp);

            throw err;
        }

        await Runner._disposeBrowserSetAndTestedApp(browserSet, testedApp);

        return reporter.testCount - reporter.passed;
    }

    _runTask (reporterPlugins, browserSet, tests, testedApp) {

        console.log("---runTask");

        var completed         = false;
        var task              = new Task(tests, browserSet.browserConnectionGroups, this.proxy, this.opts);
        var reporters         = reporterPlugins.map(reporter => new Reporter(reporter.plugin, task, reporter.outStream));
        var completionPromise = this._getTaskResult(task, browserSet, reporters[0], testedApp);

        var setCompleted = () => {
            completed = true;
        };

        completionPromise
            .then(setCompleted)
            .catch(setCompleted);

        var cancelTask = async () => {
            if (!completed)
                await Runner._disposeTaskAndRelatedAssets(task, browserSet, testedApp);
        };

        return { completionPromise, cancelTask };
    }

    _registerAssets (assets) {
        assets.forEach(asset => this.proxy.GET(asset.path, asset.info));
    }


    // API
    embeddingOptions (opts) {
        this._registerAssets(opts.assets);
        this.opts.TestRunCtor = opts.TestRunCtor;

        return this;
    }

    src (...sources) {
        sources = flatten(sources).map(path => resolvePath(path));

        this.bootstrapper.sources = this.bootstrapper.sources.concat(sources);

        return this;
    }

    browsers (...browsers) {
        this.bootstrapper.browsers = this.bootstrapper.browsers.concat(flatten(browsers));

        return this;
    }

    concurrency (concurrency) {
        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1)
            throw new GeneralError(MESSAGE.invalidConcurrencyFactor);

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

    useProxy (externalProxyHost) {
        this.opts.externalProxyHost = externalProxyHost;

        return this;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.takeScreenshotsOnFails = takeOnFails;
        this.opts.screenshotPath         = path;

        return this;
    }

    startApp (command, initDelay) {
        this.bootstrapper.appCommand   = command;
        this.bootstrapper.appInitDelay = initDelay;

        return this;
    }

    run ({ skipJsErrors, quarantineMode, debugMode, selectorTimeout, assertionTimeout, pageLoadTimeout, speed = 1, debugOnFail } = {}) {
        console.log("-----------run");
        this.opts.skipJsErrors     = !!skipJsErrors;
        this.opts.quarantineMode   = !!quarantineMode;
        this.opts.debugMode        = !!debugMode;
        this.opts.debugOnFail      = !!debugOnFail;
        this.opts.selectorTimeout  = selectorTimeout === void 0 ? DEFAULT_SELECTOR_TIMEOUT : selectorTimeout;
        this.opts.assertionTimeout = assertionTimeout === void 0 ? DEFAULT_ASSERTION_TIMEOUT : assertionTimeout;
        this.opts.pageLoadTimeout  = pageLoadTimeout === void 0 ? DEFAULT_PAGE_LOAD_TIMEOUT : pageLoadTimeout;

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1)
            throw new GeneralError(MESSAGE.invalidSpeedValue);

        this.opts.speed = speed;

        var runTaskPromise = this.bootstrapper.createRunnableConfiguration()
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
        var cancellationPromises = mapReverse(this.pendingTaskPromises, taskPromise => taskPromise.cancel());

        await Promise.all(cancellationPromises);
    }
}
