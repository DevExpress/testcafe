import VideoRecorder from './recorder';
import BrowserJob from '../runner/browser-job';
import { Dictionary } from '../configuration/interfaces';
import WarningLog from '../notifications/warning-log';
import {
    VideoOptions,
    TestVideoInfo,
    TestRunVideoInfo,
    TestRunVideoSavedEventArgs
} from './interfaces';

import moment from 'moment';

export default class Videos {
    public testVideoInfos: Dictionary<TestVideoInfo>;

    public constructor (
        browserJobs: BrowserJob[], { videoPath, videoOptions, videoEncodingOptions }: VideoOptions, warningLog: WarningLog, timeStamp: moment.Moment) {
        const options = { timeStamp: timeStamp, ...videoOptions };

        this.testVideoInfos = {};

        browserJobs.forEach(browserJob => {
            const recorder = this._createVideoRecorder(browserJob, videoPath, options, videoEncodingOptions, warningLog);

            recorder.on('test-run-video-saved', args => this._addTestRunVideoInfo(args));
        });
    }

    public getTestVideos (testId: string): TestRunVideoInfo[] {
        const testVideoInfo = this.testVideoInfos[testId];

        return testVideoInfo ? testVideoInfo.recordings : [];
    }

    private _createVideoRecorder (browserJob: unknown, videoPath: string, options: unknown, videoEncodingOptions: unknown, warningLog: WarningLog): VideoRecorder {
        return new VideoRecorder(browserJob, videoPath, options, videoEncodingOptions, warningLog);
    }

    private _addTestRunVideoInfo ({ testRun, videoPath, singleFile }: TestRunVideoSavedEventArgs): void {
        const testId: string         = testRun.test.id;
        let testVideo: TestVideoInfo = this.testVideoInfos[testId];

        if (!testVideo) {
            testVideo = { recordings: [] };

            this.testVideoInfos[testId] = testVideo;
        }

        testVideo.recordings.push({
            testRunId: testRun.id,
            videoPath,
            singleFile
        });
    }
}
