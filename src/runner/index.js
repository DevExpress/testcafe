import Promise from 'pinkie';
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

    // Run task
    _runTask (reporterPlugin, browserSet, tests) {
        return new Promise((resolve, reject) => {
            var task     = new Task(tests, browserSet.connections, this.proxy, this.opts);
            var reporter = new Reporter(reporterPlugin, task, this.opts.reportOutStream);

            browserSet.once('error', async msg => {
                task.abort();
                task.removeAllListeners();

                await browserSet.dispose();

                reject(new Error(msg));
            });

            task.on('browser-job-done', job => browserSet.freeConnection(job.browserConnection));

            task.once('done', async () => {
                await browserSet.dispose();

                resolve(reporter.testCount - reporter.passed);
            });
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

    async run ({ skipJsErrors, quarantineMode } = {}) {
        this.opts.skipJsErrors   = !!skipJsErrors;
        this.opts.quarantineMode = !!quarantineMode;

        var { reporterPlugin, browserSet, tests } = await this.bootstrapper.createRunnableConfiguration();

        this.emit('done-bootstrapping');

        return await this._runTask(reporterPlugin, browserSet, tests);
    }
}
