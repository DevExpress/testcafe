import { pull as remove, groupBy } from 'lodash';
import moment from 'moment';
import AsyncEventEmitter from '../utils/async-event-emitter';
import BrowserJob from './browser-job';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';
import FixtureHookController from './fixture-hook-controller';
import * as clientScriptsRouting from '../custom-client-scripts/routing';
import Videos from '../video-recorder/videos';
import TestRun from '../test-run';
import { Proxy } from 'testcafe-hammerhead';
import { Dictionary } from '../configuration/interfaces';
import { ActionEventArg, ReportedTestStructureItem } from './interfaces';
import BrowserConnection from '../browser/connection';
import Test from '../api/structure/test';
import { VideoOptions } from '../video-recorder/interfaces';

export default class Task extends AsyncEventEmitter {
    private readonly _timeStamp: moment.Moment;
    private _running: boolean;
    public browserConnectionGroups: BrowserConnection[][];
    public readonly tests: Test[];
    public readonly opts: Dictionary<OptionValue>;
    private readonly _proxy: Proxy;
    public readonly warningLog: WarningLog;
    public readonly screenshots: Screenshots;
    public readonly fixtureHookController: FixtureHookController;
    private readonly _pendingBrowserJobs: BrowserJob[];
    private readonly _clientScriptRoutes: string[];
    public readonly testStructure: ReportedTestStructureItem[];
    public readonly videos?: Videos;

    public constructor (tests: Test[], browserConnectionGroups: BrowserConnection[][], proxy: Proxy, opts: Dictionary<OptionValue>) {
        super({ captureRejections: true });

        this._timeStamp              = moment();
        this._running                = false;
        this.browserConnectionGroups = browserConnectionGroups;
        this.tests                   = tests;
        this.opts                    = opts;
        this._proxy                  = proxy;
        this.warningLog              = new WarningLog();

        const { path, pathPattern, fullPage } = this.opts.screenshots as ScreenshotOptionValue;

        this.screenshots = new Screenshots({
            enabled: !this.opts.disableScreenshots,
            path,
            pathPattern,
            fullPage
        });

        this.fixtureHookController = new FixtureHookController(tests, browserConnectionGroups.length);
        this._pendingBrowserJobs   = this._createBrowserJobs(proxy, this.opts);
        this._clientScriptRoutes   = clientScriptsRouting.register(proxy, tests);
        this.testStructure         = this._prepareTestStructure(tests);

        if (this.opts.videoPath) {
            const { videoPath, videoOptions, videoEncodingOptions } = this.opts;

            this.videos = new Videos(this._pendingBrowserJobs, { videoPath, videoOptions, videoEncodingOptions } as unknown as VideoOptions, this.warningLog, this._timeStamp);
        }
    }

    private _assignBrowserJobEventHandlers (job: BrowserJob): void {
        job.on('test-run-start', async (testRun: TestRun) => {
            await this.emit('test-run-start', testRun);
        });

        job.on('test-run-done', async (testRun: TestRun) => {
            await this.emit('test-run-done', testRun);

            if (this.opts.stopOnFirstFail && testRun.errs.length) {
                this.abort();

                await this.emit('done');
            }
        });

        job.once('start', async () => {
            if (!this._running) {
                this._running = true;
                await this.emit('start');
            }
        });

        job.once('done', async () => {
            await this.emit('browser-job-done', job);

            remove(this._pendingBrowserJobs, job);

            if (!this._pendingBrowserJobs.length)
                await this.emit('done');
        });

        job.on('test-action-start', async (args: ActionEventArg) => {
            await this.emit('test-action-start', args);
        });

        job.on('test-action-done', async (args: ActionEventArg) => {
            await this.emit('test-action-done', args);
        });

    }

    private _prepareTestStructure (tests: Test[]): ReportedTestStructureItem[] {
        const groups = groupBy(tests, 'fixture.id');

        return Object.keys(groups).map(fixtureId => {
            const testsByGroup = groups[fixtureId];
            const fixture      = testsByGroup[0].fixture;

            return {
                fixture: {
                    id:    fixture.id,
                    name:  fixture.name as string,
                    tests: testsByGroup.map(test => {
                        return {
                            id:   test.id,
                            name: test.name as string,
                            skip: test.skip
                        };
                    })
                }
            };
        });
    }

    private _createBrowserJobs (proxy: Proxy, opts: Dictionary<OptionValue>): BrowserJob[] {
        return this.browserConnectionGroups.map(browserConnectionGroup => {
            const job = new BrowserJob(this.tests, browserConnectionGroup, proxy, this.screenshots, this.warningLog, this.fixtureHookController, opts);

            this._assignBrowserJobEventHandlers(job);
            browserConnectionGroup.map(bc => bc.addJob(job));

            return job;
        });
    }

    public unRegisterClientScriptRouting (): void {
        clientScriptsRouting.unRegister(this._proxy, this._clientScriptRoutes);
    }

    // API
    public abort (): void {
        this._pendingBrowserJobs.forEach(job => job.abort());
    }
}
