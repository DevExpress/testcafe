import { Promise } from 'es6-promise';
import { resolve as resolvePath } from 'path';
import { EventEmitter } from 'events';
import flatten from 'flatten';
import Bootstrapper from './bootstrapper';
import Task from './task';
import LocalBrowserConnection from '../browser-connection/local';


export default class Runner extends EventEmitter {
    constructor (proxy, browserConnectionGateway) {
        super();

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
    static _waitForLocalBrowserClose (bc) {
        return new Promise(resolve => {
            if (bc.disconnected) {
                resolve();
                return;
            }

            bc.close();
            bc.once('closed', resolve);
        });
    }

    static async _freeBrowserConnection (bc, errorHandler) {
        bc.removeListener('error', errorHandler);

        // NOTE: we should close local connections and
        // related browsers once we've done
        if (bc instanceof LocalBrowserConnection)
            await Runner._waitForLocalBrowserClose(bc);
    }

    // Run task
    _runTask (Reporter, browserConnections, tests) {
        return new Promise((resolve, reject) => {
            var task     = new Task(tests, browserConnections, this.proxy, this.opts);
            var reporter = new Reporter(task, this.opts.reportOutStream, this.opts.errorDecorator);

            var bcErrorHandler = async msg => {
                await Promise.all(browserConnections.map(bc => Runner._freeBrowserConnection(bc, bcErrorHandler)));

                task.abort();
                task.removeAllListeners();

                reject(new Error(msg));
            };

            browserConnections.forEach(bc => bc.once('error', bcErrorHandler));

            var promisedCloses = [];

            task.on('browser-job-done', job => {
                promisedCloses.push(Runner._freeBrowserConnection(job.browserConnection, bcErrorHandler));
            });

            task.once('done', async () => {
                await Promise.all(promisedCloses);

                resolve(reporter.total - reporter.passed);
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

        this.emit('done-bootstrapping');

        return await this._runTask(Reporter, browserConnections, tests);
    }
}
