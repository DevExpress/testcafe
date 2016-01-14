import Promise from 'pinkie';
import promisifyEvent from 'promisify-event';
import { resolve as resolvePath } from 'path';
import { EventEmitter } from 'events';
import flatten from 'flatten';
import Bootstrapper from './bootstrapper';
import Reporter from '../reporter';
import Task from './task';


export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway) {
        super();

        this.proxy        = proxy;
        this.bootstrapper = new Bootstrapper(browserConnectionGateway);

        this.opts = {
            screenshotPath:         null,
            takeScreenshotsOnFails: false,
            skipJsErrors:           false,
            quarantineMode:         false,
            reportOutStream:        void 0
        };
    }

    static async _disposeTaskAndBrowsers (task, browserSet) {
        task.abort();
        task.removeAllListeners();

        await browserSet.dispose();
    }

    static _createCancelablePromise (taskPromise) {
        var promise = taskPromise.then(({ completionPromise }) => completionPromise);

        promise.cancel = () => taskPromise.then(({ cancelTask }) => cancelTask());

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
        var completeTask      = () => completed = true;
        var completionPromise = this._getTaskResult(task, browserSet, reporter);

        var cancelTask = async () => {
            if (!completed)
                await Runner._disposeTaskAndBrowsers(task, browserSet);
        };

        completionPromise
            .then(completeTask)
            .catch(completeTask);

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

    run ({ skipJsErrors, quarantineMode } = {}) {
        this.opts.skipJsErrors   = !!skipJsErrors;
        this.opts.quarantineMode = !!quarantineMode;

        var runTaskPromise = this.bootstrapper.createRunnableConfiguration()
            .then(({ reporterPlugin, browserSet, tests }) => {
                this.emit('done-bootstrapping');

                return this._runTask(reporterPlugin, browserSet, tests);
            });

        return Runner._createCancelablePromise(runTaskPromise);
    }
}
