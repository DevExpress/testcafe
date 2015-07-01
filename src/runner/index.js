import Promise from 'promise';
import Bootstrapper from './bootstrapper';
import Task from './task';
import concatFlattened from '../utils/array-concat-flattened';

export default class Runner {
    constructor (proxy, browserConnectionGateway) {
        this.proxy        = proxy;
        this.bootstrapper = new Bootstrapper(browserConnectionGateway);

        this.opts = {
            screenshotPath:        null,
            takeScreenshotOnFails: false,
            failOnJsErrors:        true,
            quarantineMode:        false
        };
    }

    static _watchBrowserConnectionError (browserConnections, task) {
        var onError = msg => {
            task.terminate();
            task.removeAllListeners();
            Bootstrapper.freeBrowserConnections(browserConnections, onError);
            throw new Error(msg);
        };

        browserConnections.forEach(bc => bc.once('error', onError));

        return onError;
    }

    _runTask (reporter, browserConnections, tests) {
        var task           = new Task(tests, browserConnections, this.proxy, this.opts);
        var passed         = true;
        var bcErrorHandler = Runner._watchBrowserConnectionError(browserConnections, task);

        task.once('start', () => reporter.onTaskStart(task));

        task.on('test-run-done', testRun => {
            passed &= !testRun.errs.length;
            reporter.onTestRunDone(testRun);
        });

        return new Promise((resolve) => {
            task.once('done', () => {
                reporter.onTaskDone(task);
                Bootstrapper.freeBrowserConnections(browserConnections, bcErrorHandler);
                resolve(passed);
            });
        });
    }


    // API
    src (...src) {
        this.bootstrapper.src = concatFlattened(this.bootstrapper.src, src);

        return this;
    }

    browsers (...browsers) {
        this.bootstrapper.browsers = concatFlattened(this.bootstrapper.browsers, browsers);

        return this;
    }

    reporter (reporter, outStream = null) {
        this.bootstrapper.reporter        = reporter;
        this.bootstrapper.reportOutStream = outStream;

        return this;
    }

    filter (filter) {
        this.bootstrapper.filter = filter;

        return this;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.takeScreenshotOnFails  = takeOnFails;
        this.bootstrapper.screenshotPath = path;

        return this;
    }

    async run ({ failOnJsErrors = true, quarantineMode = false }) {
        this.opts.failOnJsErrors = failOnJsErrors;
        this.opts.quarantineMode = quarantineMode;

        var { reporter, browserConnections, tests } = await this.bootstrapper.createRunnableConfiguration();

        return await this._runTask(reporter, browserConnections, tests);
    }
}
