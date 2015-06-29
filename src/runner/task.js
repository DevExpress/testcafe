import { EventEmitter } from 'events';
import BrowserJob from './browser-job';

export default class Task extends EventEmitter {
    constructor (tests, browserConnections, proxy, opts) {
        super();

        this.startTime    = null;
        this.endTime      = null;
        this.testRunCount = tests.length * browserConnections.length;

        this.browserJobs = browserConnections.map(bc => this._createBrowserJob(tests, bc, proxy, opts));
    }

    _assignBrowserJobEventListeners (job) {
        job.on('test-run-done', testRun => this.emit('test-run-done', testRun));

        job.once('start', () => {
            if (!this.startTime) {
                this.startTime = new Date();
                this.emit('start');
            }
        });

        job.once('done', () => {
            var idx = this.browserJobs.indexOf(job);

            this.browserJobs.splice(idx, 1);

            if (!this.browserJobs.length) {
                this.endTime = new Date();
                this.emit('done');
            }
        });
    }

    _createBrowserJob (tests, browserConnection, proxy, opts) {
        var job = new BrowserJob(tests, browserConnection, proxy, opts);

        this._assignBrowserJobEventListeners(job);
        browserConnection.addJob(job);

        return job;
    }

    // API
    terminate () {
        this.browserJobs.forEach(job => job.terminate());
    }
}
