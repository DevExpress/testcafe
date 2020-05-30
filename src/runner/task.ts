import { pull as remove, groupBy } from 'lodash';
import moment from 'moment';
import AsyncEventEmitter from '../utils/async-event-emitter';
import BrowserJob from './browser-job';
import * as clientScriptsRouting from '../custom-client-scripts/routing';
import Videos from '../video-recorder/videos';
import TestRun from '../test-run';
import { Proxy } from 'testcafe-hammerhead';
import {
    ActionEventArg,
    ReportedTestStructureItem,
    RuntimeResources
} from './interfaces';
import Test from '../api/structure/test';
import { VideoOptions } from '../video-recorder/interfaces';
import TestCafeConfiguration from '../configuration/testcafe-configuration';
import BrowserSet from './browser-set';
import Screenshots from '../screenshots';
import WarningLog from '../notifications/warning-log';

export default class Task extends AsyncEventEmitter {
    private readonly _timeStamp: moment.Moment;
    private _running: boolean;
    private readonly _runnableConfiguration: RuntimeResources;
    public readonly configuration: TestCafeConfiguration;
    private readonly _proxy: Proxy;
    private readonly _pendingBrowserJobs: BrowserJob[];
    private readonly _clientScriptRoutes: string[];
    public readonly testStructure: ReportedTestStructureItem[];
    public readonly videos?: Videos;

    public constructor (runnableConfiguration: RuntimeResources, proxy: Proxy, configuration: TestCafeConfiguration) {
        super();

        this._timeStamp             = moment();
        this._running               = false;
        this._runnableConfiguration = runnableConfiguration;
        this.configuration          = configuration;
        this._proxy                 = proxy;
        this._pendingBrowserJobs    = runnableConfiguration.browserJobs.map(job => this._assignBrowserJobEventHandlers(job));
        this._clientScriptRoutes    = clientScriptsRouting.register(proxy, this.tests);
        this.testStructure          = this._prepareTestStructure(this.tests);
        this.videos                 = this._initializeVideos();

    }

    private _initializeVideos (): Videos | undefined {
        const videoPath = this.configuration.getVideoPathOption();

        if (!videoPath)
            return void 0;

        const videoOptions         = this.configuration.getVideoOption();
        const videoEncodingOptions = this.configuration.getVideoEncodingOption();

        return new Videos(this._pendingBrowserJobs, { videoPath, videoOptions, videoEncodingOptions } as unknown as VideoOptions, this.warningLog, this._timeStamp);
    }

    private _assignBrowserJobEventHandlers (job: BrowserJob): BrowserJob {
        job.on('test-run-start', async (testRun: TestRun) => {
            await this.emit('test-run-start', testRun);
        });

        job.on('test-run-done', async (testRun: TestRun) => {
            await this.emit('test-run-done', testRun);

            if (this.configuration.getStopOnFirstFailOption() && testRun.errs.length) {
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

        return job;
    }

    private _prepareTestStructure (tests: Test[]): ReportedTestStructureItem[] {
        const groups = groupBy(tests, 'fixture.id');

        return Object.keys(groups).map(fixtureId => {
            const testsByGroup = groups[fixtureId];
            const fixture      = testsByGroup[0].fixture;

            return {
                fixture: {
                    id:    fixture.id,
                    name:  fixture.name,
                    tests: testsByGroup.map(test => {
                        return {
                            id:   test.id,
                            name: test.name,
                            skip: test.skip
                        };
                    })
                }
            };
        });
    }

    public unRegisterClientScriptRouting (): void {
        clientScriptsRouting.unRegister(this._proxy, this._clientScriptRoutes);
    }

    public get browserSet (): BrowserSet {
        return this._runnableConfiguration.browserSet;
    }

    public get tests (): Test[] {
        return this._runnableConfiguration.tests;
    }

    public get screenshots (): Screenshots {
        return this._runnableConfiguration.screenshots;
    }

    public get warningLog (): WarningLog {
        return this._runnableConfiguration.warningLog;
    }

    // API
    public abort (): void {
        this._pendingBrowserJobs.forEach(job => job.abort());
    }
}
