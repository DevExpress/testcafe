import { EventEmitter } from 'events';
import { pull as remove } from 'lodash';
import BrowserJob from './browser-job';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';
import FixtureHookController from './fixture-hook-controller';

export default class Task extends EventEmitter {
    constructor (tests, browserConnectionGroups, proxy, opts) {
        super();

        this.running                 = false;
        this.browserConnectionGroups = browserConnectionGroups;
        this.tests                   = tests;
        this.screenshots             = new Screenshots(opts.screenshotPath);
        this.warningLog              = new WarningLog();

        this.fixtureHookController = new FixtureHookController(tests, browserConnectionGroups.length);
        this.pendingBrowserJobs    = this._createBrowserJobs(proxy, opts);
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

    _createBrowserJobs (proxy, opts) {
        return this.browserConnectionGroups.map(browserConnectionGroup => {
            var job = new BrowserJob(this.tests, browserConnectionGroup, proxy, this.screenshots, this.warningLog, this.fixtureHookController, opts);

            this._assignBrowserJobEventHandlers(job);
            browserConnectionGroup.map(bc => bc.addJob(job));

            return job;
        });
    }

    // API
    abort () {
        this.pendingBrowserJobs.forEach(job => job.abort());
    }
}
