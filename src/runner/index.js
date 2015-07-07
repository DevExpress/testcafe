import Promise from 'promise';
import Bootstrapper from './bootstrapper';
import Task from './task';
import LocalBrowserConnection from '../browser/local-connection';
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

    _runTask (reporter, browserConnections, tests) {
        return new Promise((resolve, reject) => {
            var task   = new Task(tests, browserConnections, this.proxy, this.opts);
            var passed = true;

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
                task.terminate();
                task.removeAllListeners();
                freeBrowserConnections();
                reject(new Error(msg));
            }

            browserConnections.forEach(bc => bc.once('error', bcErrorHandler));

            task.once('start', () => reporter.onTaskStart(task));

            task.on('test-run-done', testRun => {
                passed &= !testRun.errs.length;
                reporter.onTestRunDone(testRun);
            });

            task.once('done', () => {
                reporter.onTaskDone(task);
                freeBrowserConnections();
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
        this.bootstrapper.reporter    = reporter;
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
