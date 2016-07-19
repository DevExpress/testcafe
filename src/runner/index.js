import Promise from 'pinkie';
import promisifyEvent from 'promisify-event';
import onceDone from 'once-done';
import mapReverse from 'map-reverse';
import { resolve as resolvePath } from 'path';
import { EventEmitter } from 'events';
import { flattenDeep as flatten, pull as remove } from 'lodash';
import Bootstrapper from './bootstrapper';
import Reporter from '../reporter';
import Task from './task';


const DEFAULT_SELECTOR_TIMEOUT = 10000;


export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway) {
        super();

        this.proxy               = proxy;
        this.bootstrapper        = new Bootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];

        this.opts = {
            screenshotPath:         null,
            takeScreenshotsOnFails: false,
            skipJsErrors:           false,
            quarantineMode:         false,
            reportOutStream:        void 0,
            selectorTimeout:        DEFAULT_SELECTOR_TIMEOUT
        };
    }

    static async _disposeTaskAndBrowsers (task, browserSet) {
        task.abort();
        task.removeAllListeners();

        await browserSet.dispose();
    }

    _createCancelablePromise (taskPromise) {
        var promise           = taskPromise.then(({ completionPromise }) => completionPromise);
        var removeFromPending = () => remove(this.pendingTaskPromises, promise);

        onceDone(promise, removeFromPending);

        promise.cancel = () => taskPromise
            .then(({ cancelTask }) => cancelTask())
            .then(removeFromPending);

        this.pendingTaskPromises.push(promise);
        return promise;
    }

    // Run task
    async _getTaskResult (task, browserSet, reporter) {
        task.on('browser-job-done', job => browserSet.releaseConnection(job.browserConnection));

        try {
            await Promise.race([
                promisifyEvent(task, 'done'),
                promisifyEvent(browserSet, 'error')
            ]);
        }
        catch (err) {
            await Runner._disposeTaskAndBrowsers(task, browserSet);

            throw err;
        }

        await browserSet.dispose();

        return reporter.testCount - reporter.passed;
    }

    _runTask (reporterPlugin, browserSet, tests) {
        var completed         = false;
        var task              = new Task(tests, browserSet.connections, this.proxy, this.opts);
        var reporter          = new Reporter(reporterPlugin, task, this.opts.reportOutStream);
        var completionPromise = this._getTaskResult(task, browserSet, reporter);

        onceDone(completionPromise, () => {
            completed = true;
        });

        var cancelTask = async () => {
            if (!completed)
                await Runner._disposeTaskAndBrowsers(task, browserSet);
        };

        return { completionPromise, cancelTask };
    }


    // API
    src (...sources) {
        sources = flatten(sources).map(path => resolvePath(path));

        this.bootstrapper.sources = this.bootstrapper.sources.concat(sources);

        return this;
    }

    browsers (...browsers) {
        this.bootstrapper.browsers = this.bootstrapper.browsers.concat(flatten(browsers));

        return this;
    }

    reporter (reporter, outStream) {
        this.bootstrapper.reporter = reporter;
        this.opts.reportOutStream  = outStream;

        return this;
    }

    filter (filter) {
        this.bootstrapper.filter = filter;

        return this;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.takeScreenshotsOnFails = takeOnFails;
        this.opts.screenshotPath         = path;

        return this;
    }

    run ({ skipJsErrors, quarantineMode, selectorTimeout } = {}) {
        this.opts.skipJsErrors    = !!skipJsErrors;
        this.opts.quarantineMode  = !!quarantineMode;
        this.opts.selectorTimeout = selectorTimeout === void 0 ? DEFAULT_SELECTOR_TIMEOUT : selectorTimeout;

        var runTaskPromise = this.bootstrapper.createRunnableConfiguration()
            .then(({ reporterPlugin, browserSet, tests }) => {
                this.emit('done-bootstrapping');

                return this._runTask(reporterPlugin, browserSet, tests);
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
