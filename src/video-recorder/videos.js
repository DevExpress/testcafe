import VideoRecorder from './index';

export default class Videos {
    constructor (browserJobs, { videoPath, videoOptions, videoEncodingOptions }, warningLog, timeStamp) {
        const options = { timeStamp: timeStamp, ...videoOptions };

        this.recordings = {};

        browserJobs.forEach(browserJob => {
            const recorder = this._createVideoRecorder(browserJob, videoPath, options, videoEncodingOptions, warningLog);

            recorder.on('test-run-video-saved', args => this._addTestRunVideoInfo(args));
        });
    }

    getTestVideos (test) {
        const rec = this.recordings[test.id];

        return rec ? rec.runs : [];
    }

    _createVideoRecorder (browserJob, videoPath, options, videoEncodingOptions, warningLog) {
        return new VideoRecorder(browserJob, videoPath, options, videoEncodingOptions, warningLog);
    }

    _addTestRunVideoInfo ({ testRun, videoPath, singleFile }) {
        const testId = testRun.test.id;
        let rec      = this.recordings[testId];

        if (!rec) {
            rec = { runs: [] };

            this.recordings[testId] = rec;
        }

        rec.runs.push({
            testRunId: testRun.id,
            videoPath,
            singleFile
        });
    }
}
