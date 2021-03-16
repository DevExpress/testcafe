import EventEmitter from 'events';
import Logger from './logger';
import FileWatcher from './file-watcher';
import LiveModeKeyboardEventObserver from './keyboard-observer';
import LiveModeRunner from './test-runner';
import { RUNTIME_ERRORS } from '../errors/types';
import { GeneralError } from '../errors/runtime';


class LiveModeController extends EventEmitter {
    private running: boolean;
    private restarting: boolean;
    private watchingPaused: boolean;
    private stopping: boolean;
    private logger: Logger;
    private readonly runner: LiveModeRunner;
    private keyboardObserver: LiveModeKeyboardEventObserver;
    private fileWatcher: FileWatcher;

    private _isTestFilesNotFoundError (err: Error): boolean {
        // @ts-ignore
        return GeneralError.isGeneralError(err) && err.code === RUNTIME_ERRORS.testFilesNotFound;
    }

    public constructor (runner: LiveModeRunner) {
        super();

        this.running = false;
        this.restarting = false;
        this.watchingPaused = false;
        this.stopping = false;
        this.logger = new Logger();
        this.runner = runner;

        this.keyboardObserver = this._createKeyboardObserver();
        this.fileWatcher = this._createFileWatcher();
    }

    public init (files: string[]): Promise<void> {
        this.keyboardObserver.push(this);

        this._initFileWatching(files);

        this._setRunning();

        return Promise.resolve()
            .then(() => this.logger.writeIntroMessage(files));
    }

    public dispose (): void {
        this.fileWatcher.stop();

        this.keyboardObserver.remove(this);
    }

    public runTests (sourceChanged?: boolean): Promise<void> {
        if (this.watchingPaused || this.running)
            return Promise.resolve();

        this._setRunning();

        this.logger.writeRunTestsMessage(sourceChanged);

        return this.runner.runTests();
    }

    public onTestRunDone (err: Error): void {
        this.running = false;

        if (this._isTestFilesNotFoundError(err))
            throw err;

        if (!this.restarting)
            this.logger.writeTestsFinishedMessage();

        if (err)
            this.logger.err(err);
    }

    public toggleWatching (): void {
        this.watchingPaused = !this.watchingPaused;

        this.logger.writeToggleWatchingMessage(!this.watchingPaused);
    }

    public stop (): Promise<void> {
        if (!this.runner || !this.running) {
            this.logger.writeNothingToStopMessage();

            return Promise.resolve();
        }

        this.logger.writeStopRunningMessage();

        return this.runner.suspend()
            .then(() => {
                this.restarting = false;
                this.running = false;
            });
    }

    public restart (): Promise<void> {
        if (this.restarting || this.watchingPaused)
            return Promise.resolve();

        this.restarting = true;

        if (this.running) {
            return this.stop()
                .then(() => this.logger.writeTestsFinishedMessage())
                .then(() => this.runTests());
        }

        return this.runTests();
    }

    public exit (): Promise<void> {
        if (this.stopping)
            return Promise.resolve();

        this.logger.writeExitMessage();

        this.stopping = true;

        return this.runner ? this.runner.exit() : Promise.resolve();
    }

    public addFileToWatches (filename: string): void {
        this.fileWatcher.addFile(this, filename);
    }

    protected _createFileWatcher (): FileWatcher {
        return new FileWatcher();
    }

    protected _createKeyboardObserver (): LiveModeKeyboardEventObserver {
        return new LiveModeKeyboardEventObserver();
    }

    private _initFileWatching (files: string[]): void {
        files.forEach(file => this.addFileToWatches(file));
    }

    private _setRunning (): void {
        this.running = true;
        this.restarting = false;
        this.stopping = false;
    }
}

export default LiveModeController;
