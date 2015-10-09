import { Promise } from 'es6-promise';
import { resolve as resolvePath } from 'path';
import flatten from 'flatten';
import Bootstrapper from './bootstrapper';
import Task from './task';
import LocalBrowserConnection from '../browser-connection/local';


export default class Runner {
    constructor (proxy, browserConnectionGateway) {
        this.proxy        = proxy;
        this.bootstrapper = new Bootstrapper(browserConnectionGateway);

        this.opts = {
            screenshotPath:        null,
            takeScreenshotOnFails: false,
            skipJsErrors:          false,
            quarantineMode:        false,
            reportOutStream:       void 0,
            errorDecorator:        void 0
        };
    }

    // Static
    static _freeBrowserConnection (bc, errorHandler) {
        bc.removeListener('error', errorHandler);

        // NOTE: we should close local connections and
        // related browsers once we've done
        if (bc instanceof LocalBrowserConnection)
            bc.close();
    }

    // Run task
    _runTask (Reporter, browserConnections, tests) {
        return new Promise((resolve, reject) => {
            var task     = new Task(tests, browserConnections, this.proxy, this.opts);
            var reporter = new Reporter(task, this.opts.reportOutStream, this.opts.errorDecorator);

            var bcErrorHandler = msg => {
                task.abort();
                task.removeAllListeners();
                browserConnections.forEach(bc => Runner._freeBrowserConnection(bc, bcErrorHandler));
                reject(new Error(msg));
            };

            browserConnections.forEach(bc => bc.once('error', bcErrorHandler));

            task.on('browser-job-done', job => Runner._freeBrowserConnection(job.browserConnection, bcErrorHandler));

            task.once('done', () => resolve(reporter.total - reporter.passed));
        });
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

    reporter (reporter, outStream, errorDecorator) {
        this.bootstrapper.reporter = reporter;
        this.opts.reportOutStream  = outStream;
        this.opts.errorDecorator   = errorDecorator;

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

    async run ({ skipJsErrors, quarantineMode } = {}) {
        this.opts.skipJsErrors   = !!skipJsErrors;
        this.opts.quarantineMode = !!quarantineMode;

        var { Reporter, browserConnections, tests } = await this.bootstrapper.createRunnableConfiguration();

        return await this._runTask(Reporter, browserConnections, tests);
    }
}
