import { EventEmitter } from 'events';
import BrowserJob from './browser-job';
import remove from '../utils/array-remove';


export default class Task extends EventEmitter {
    constructor (tests, browserConnections, proxy, opts) {
        super();

        this.running            = false;
        this.browserConnections = browserConnections;
        this.tests              = tests;

        this.pendingBrowserJobs = this._createBrowserJobs(tests, proxy, opts);
    }

    _assignBrowserJobEventHandlers (job) {
        job.on('test-run-start', testRun => this.emit('test-run-start', testRun));
        job.on('test-run-done', testRun => this.emit('test-run-done', testRun));

        job.once('start', () => {
            if (!this.running) {
                this.running = true;
                this.emit('start');
            }
        });

        job.once('done', () => {
            remove(this.pendingBrowserJobs, job);
            this.emit('browser-job-done', job);

            if (!this.pendingBrowserJobs.length)
                this.emit('done');
        });
    }

    _createBrowserJobs (tests, proxy, opts) {
        return this.browserConnections.map(bc => {
            var job = new BrowserJob(tests, bc, proxy, opts);

            this._assignBrowserJobEventHandlers(job);
            bc.addJob(job);

            return job;
        });
    }

    // API
    abort () {
        this.pendingBrowserJobs.forEach(job => {
            job.removeAllListeners();
            job.browserConnection.removeJob(job);
        });
    }
}
