import { pull as remove } from 'lodash';
import moment from 'moment';
import AsyncEventEmitter from '../utils/async-event-emitter';
import BrowserJob from './browser-job';
import Screenshots from '../screenshots';
import VideoRecorder from '../video-recorder';
import WarningLog from '../notifications/warning-log';
import FixtureHookController from './fixture-hook-controller';
import * as clientScriptsRouting from '../custom-client-scripts/routing';

export default class Task extends AsyncEventEmitter {
    constructor (tests, browserConnectionGroups, proxy, opts) {
        super();

        this.timeStamp               = moment();
        this.running                 = false;
        this.browserConnectionGroups = browserConnectionGroups;
        this.tests                   = tests;
        this.opts                    = opts;
        this.proxy                   = proxy;
        this.warningLog              = new WarningLog();

        this.screenshots = new Screenshots({
            enabled: !this.opts.disableScreenshots,

            ...this.opts.screenshots
        });

        this.fixtureHookController = new FixtureHookController(tests, browserConnectionGroups.length);
        this.pendingBrowserJobs    = this._createBrowserJobs(proxy, this.opts);
        this.clientScriptRoutes    = clientScriptsRouting.register(proxy, tests);

        if (this.opts.videoPath)
            this.videoRecorders = this._createVideoRecorders(this.pendingBrowserJobs);
    }

    _assignBrowserJobEventHandlers (job) {
        job.on('test-run-start', async testRun => {
            await this.emit('test-run-start', testRun);
        });

        job.on('test-run-done', async testRun => {
            await this.emit('test-run-done', testRun);

            if (this.opts.stopOnFirstFail && testRun.errs.length) {
                this.abort();
                await this.emit('done');
            }
        });

        job.once('start', async () => {
            if (!this.running) {
                this.running = true;
                await this.emit('start');
            }
        });

        job.once('done', async () => {
            await this.emit('browser-job-done', job);

            remove(this.pendingBrowserJobs, job);

            if (!this.pendingBrowserJobs.length)
                await this.emit('done');
        });

        job.on('test-action-start', async args => {
            await this.emit('test-action-start', args);
        });

        job.on('test-action-done', async args => {
            await this.emit('test-action-done', args);
        });

    }

    _createBrowserJobs (proxy, opts) {
        return this.browserConnectionGroups.map(browserConnectionGroup => {
            const job = new BrowserJob(this.tests, browserConnectionGroup, proxy, this.screenshots, this.warningLog, this.fixtureHookController, opts);

            this._assignBrowserJobEventHandlers(job);
            browserConnectionGroup.map(bc => bc.addJob(job));

            return job;
        });
    }

    _createVideoRecorders (browserJobs) {
        const videoOptions = { timeStamp: this.timeStamp, ...this.opts.videoOptions };

        return browserJobs.map(browserJob => new VideoRecorder(browserJob, this.opts.videoPath, videoOptions, this.opts.videoEncodingOptions, this.warningLog));
    }

    unRegisterClientScriptRouting () {
        clientScriptsRouting.unRegister(this.proxy, this.clientScriptRoutes);
    }

    // API
    abort () {
        this.pendingBrowserJobs.forEach(job => job.abort());
    }
}
