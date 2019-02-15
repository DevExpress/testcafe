import debug from 'debug';
import { spawn } from 'child_process';
import { flatten } from 'lodash';
import Promise from 'pinkie';
import AsyncEmitter from '../utils/async-event-emitter';
import delay from '../utils/delay';


const DEBUG_LOGGER_PREFIX = 'testcafe:video-recorder:process:';

const DEFAULT_OPTIONS = {
    // NOTE: don't ask confirmation for rewriting the output file
    'y': true,

    // NOTE: use the time when a frame is read from the source as its timestamp
    // IMPORTANT: must be specified before configuring the source
    'use_wallclock_as_timestamps': 1,

    // NOTE: use stdin as a source
    'i': 'pipe:0',

    // NOTE: use the H.264 video codec
    'c:v': 'libx264',

    // NOTE: use the 'ultrafast' compression preset
    'preset': 'ultrafast',

    // NOTE: use the yuv420p pixel format (the most widely supported)
    'pix_fmt': 'yuv420p',

    // NOTE: scale input frames to make the frame height divisible by 2 (yuv420p's requirement)
    'vf': 'scale=trunc(iw/2)*2:trunc(ih/2)*2',

    // NOTE: set the frame rate to 30 in the output video (the most widely supported)
    'r': 30
};

const FFMPEG_START_DELAY = 500;

export default class VideoRecorder extends AsyncEmitter {
    constructor (basePath, ffmpegPath, connection, customOptions) {
        super();

        this.debugLogger = debug(DEBUG_LOGGER_PREFIX + connection.id);

        this.customOptions = customOptions;
        this.videoPath     = basePath;
        this.connection    = connection;
        this.ffmpegPath    = ffmpegPath;
        this.ffmpegProcess = null;

        this.ffmpegStdoutBuf = '';
        this.ffmpegStderrBuf = '';

        this.ffmpegClosingPromise = null;

        this.closed = false;

        this.optionsList = this._getOptionsList();

        this.capturingPromise = null;
    }

    static _filterOption ([key, value]) {
        if (value === true)
            return ['-' + key];

        return ['-' + key, value];
    }

    _setupFFMPEGBuffers () {
        this.ffmpegProcess.stdout.on('data', data => {
            this.ffmpegStdoutBuf += String(data);
        });

        this.ffmpegProcess.stderr.on('data', data => {
            this.ffmpegStderrBuf += String(data);
        });
    }

    _getChildProcessPromise () {
        return new Promise((resolve, reject) => {
            this.ffmpegProcess.on('exit', resolve);
            this.ffmpegProcess.on('error', reject);
        });
    }

    _getOptionsList () {
        const optionsObject = Object.assign({}, DEFAULT_OPTIONS, this.customOptions);

        const optionsList = flatten(Object.entries(optionsObject).map(VideoRecorder._filterOption));

        optionsList.push(this.videoPath);

        return optionsList;
    }

    async _addFrame (frameData) {
        const writingFinished = this.ffmpegProcess.stdin.write(frameData);

        if (!writingFinished)
            await new Promise(r => this.ffmpegProcess.stdin.once('drain', r));
    }

    async _capture () {
        while (!this.closed) {
            try {
                const frame = await this.connection.provider.getVideoFrameData(this.connection.id);

                if (frame) {
                    await this.emit('frame');
                    await this._addFrame(frame);
                }
            }
            catch (error) {
                this.debugLogger(error);
            }
        }
    }

    async init () {
        this.ffmpegProcess = spawn(this.ffmpegPath, this.optionsList, { stdio: 'pipe' });

        this._setupFFMPEGBuffers();

        this.ffmpegClosingPromise = this
            ._getChildProcessPromise()
            .then(code => {
                this.closed = true;

                if (code) {
                    this.debugLogger(code);
                    this.debugLogger(this.ffmpegStdoutBuf);
                    this.debugLogger(this.ffmpegStderrBuf);
                }
            })
            .catch(error => {
                this.closed = true;

                this.debugLogger(error);
                this.debugLogger(this.ffmpegStdoutBuf);
                this.debugLogger(this.ffmpegStderrBuf);
            });

        await delay(FFMPEG_START_DELAY);
    }

    async startCapturing () {
        this.capturingPromise = this._capture();

        await this.once('frame');
    }

    async finishCapturing () {
        if (this.closed)
            return;

        this.closed = true;

        await this.capturingPromise;

        this.ffmpegProcess.stdin.end();

        await this.ffmpegClosingPromise;
    }
}
