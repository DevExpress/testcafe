import Promise from 'promise';
import Bootstrapper from './bootstrapper';
import Task from './task';
import LocalBrowserConnection from '../browser/local-connection';
import { concatFlattened } from '../utils/array';
import fallbackDefault from '../utils/fallback-default';

export default class Runner {
    constructor (proxy, browserConnectionGateway) {
        this.proxy        = proxy;
        this.bootstrapper = new Bootstrapper(browserConnectionGateway);

        this.opts = {
            screenshotPath:        null,
            takeScreenshotOnFails: false,
            failOnJsErrors:        true,
            quarantineMode:        false,
            reportOutStream:       null,
            formatter:             null
        };
    }

    _runTask (Reporter, browserConnections, tests) {
        return new Promise((resolve, reject) => {
            var task     = new Task(tests, browserConnections, this.proxy, this.opts);
            var reporter = new Reporter(task, this.opts.reportOutStream, this.opts.form);

            function freeBrowserConnections () {
                browserConnections.forEach(bc => {
                    bc.removeListener('error', bcErrorHandler);
                    // NOTE: we should close local connections and
                    // related browsers once we've done
                    if (bc instanceof LocalBrowserConnection)
                        bc.close();
                });
            }

            function bcErrorHandler (msg) {
                task.abort();
                task.removeAllListeners();
                freeBrowserConnections();
                reject(new Error(msg));
            }

            browserConnections.forEach(bc => bc.once('error', bcErrorHandler));

            task.once('done', () => {
                freeBrowserConnections();
                resolve(reporter.passed === reporter.total);
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

    reporter (reporter, outStream = null, formatter = null) {
        this.bootstrapper.reporter = reporter;
        this.opts.reportOutStream  = outStream;
        this.opts.formatter        = formatter;

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

    async run ({ failOnJsErrors, quarantineMode } = {}) {
        this.opts.failOnJsErrors = fallbackDefault(failOnJsErrors, true);
        this.opts.quarantineMode = fallbackDefault(quarantineMode, false);

        var { Reporter, browserConnections, tests } = await this.bootstrapper.createRunnableConfiguration();

        return await this._runTask(Reporter, browserConnections, tests);
    }
}
