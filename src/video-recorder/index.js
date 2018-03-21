import { join as joinPath, dirname } from 'path';
import { spawn } from 'child_process';
import sanitizeFilename from 'sanitize-filename';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { ensureDir } from '../utils/promisified-functions';


const MP4_EXTENSION_RE = /(\.mp4)$/;


process.on('unhandledRejection', e => console.log(e.stack));

export default class VideoRecorder {
    constructor (basePath, connection, options) {
        this.basePath      = basePath;
        this.connection    = connection;
        this.options       = options;
        this.ffmpegProcess = null;

        this.ffmpegClosingPromise = null;

        this.busy   = false;
        this.closed = false;

        this.userAgent = this._escapeUserAgent(`${this.connection.browserInfo.userAgent}-${this.connection.id}`);

        const fileName = this._getFileName();

        this.videoPath = this._correctFilePath(this._getScreenshotPath(fileName));
    }

    _correctFilePath (path) {
        const correctedPath = path
            .replace(/\\/g, '/')
            .split('/')
            .map(str => sanitizeFilename(str))
            .join('/');

        return MP4_EXTENSION_RE.test(correctedPath) ? correctedPath : `${correctedPath}.mp4`;
    }

    _getFileName () {
        var videoPostfix = this.options.mode === 'all-tests-at-once' ? '' : `-${this.options.videoIndex++}`;

        return `video${videoPostfix}.mp4`;
    }

    _getScreenshotPath (fileName) {
        return joinPath(this.basePath, this.userAgent, fileName);
    }

    _escapeUserAgent (userAgent) {
        return sanitizeFilename(userAgent.toString()).replace(/\s+/g, '_');
    }

    async startCapturing () {
        await ensureDir(dirname(this.videoPath));

        this.ffmpegProcess = spawn(ffmpegPath, ['-use_wallclock_as_timestamps', '1', '-i', 'pipe:0', '-c:v', 'libx264', '-preset', 'ultrafast', '-r','30', this.videoPath], { stdio: ['pipe', 'inherit', 'inherit' ]});

        this.ffmpegClosingPromise = new Promise(r => this.ffmpegProcess.on('exit', r));
    }

    async addFrame (frameData) {
        console.log(frameData.length);

        if (this.busy || this.closed || !this.ffmpegProcess)
            return false;

        this.busy = true;

        const writingFinished = this.ffmpegProcess.stdin.write(frameData);

        if (!writingFinished)
            await new Promise(r => this.ffmpegProcess.stdin.once('drain', r));

        this.busy = false;

        return true;
    }

    async finishCapturing () {
        if (this.closed || !this.ffmpegProcess)
            return this.videoPath;

        this.closed = true;

        this.ffmpegProcess.stdin.end();

        await this.ffmpegClosingPromise;

        return this.videoPath;
    }
}
