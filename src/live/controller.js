import EventEmitter from 'events';
import Logger from './logger';
import FileWatcher from './file-watcher';
import LiveModeKeyboardEventObserver from './keyboard-observer';

class LiveModeController extends EventEmitter {
    constructor (runner) {
        super();

        this.running        = false;
        this.restarting     = false;
        this.watchingPaused = false;
        this.stopping       = false;
        this.logger         = new Logger();
        this.runner         = runner;

        this.keyboardObserver = this._createKeyboardObserver();
        this.fileWatcher      = this._createFileWatcher();
    }

    init (files) {
        this.keyboardObserver.push(this);

        this._initFileWatching(files);

        this._setRunning();

        return Promise.resolve()
            .then(() => this.logger.writeIntroMessage(files));
    }

    dispose () {
        this.fileWatcher.stop();

        this.keyboardObserver.remove(this);
    }

    runTests (sourceChanged) {
        if (this.watchingPaused || this.running)
            return Promise.resolve();

        this._setRunning();

        this.logger.writeRunTestsMessage(sourceChanged);

        return this.runner.runTests();
    }

    onTestRunDone (err) {
        this.running = false;

        if (!this.restarting)
            this.logger.writeTestsFinishedMessage();

        if (err)
            this.logger.err(err);
    }

    _toggleWatching () {
        this.watchingPaused = !this.watchingPaused;

        this.logger.writeToggleWatchingMessage(!this.watchingPaused);
    }

    _stop () {
        if (!this.runner || !this.running) {
            this.logger.writeNothingToStopMessage();

            return Promise.resolve();
        }

        this.logger.writeStopRunningMessage();

        return this.runner.suspend()
            .then(() => {
                this.restarting = false;
                this.running    = false;
            });
    }

    _restart () {
        if (this.restarting || this.watchingPaused)
            return Promise.resolve();

        this.restarting = true;

        if (this.running) {
            return this._stop()
                .then(() => this.logger.writeTestsFinishedMessage())
                .then(() => this.runTests());
        }

        return this.runTests();
    }

    _exit () {
        if (this.stopping)
            return Promise.resolve();

        this.logger.writeExitMessage();

        this.stopping = true;

        return this.runner ? this.runner.exit() : Promise.resolve();
    }

    _createFileWatcher () {
        return new FileWatcher();
    }

    _createKeyboardObserver () {
        return new LiveModeKeyboardEventObserver();
    }

    addFileToWatches (filename) {
        this.fileWatcher.addFile(this, filename);
    }

    _initFileWatching (files) {
        files.forEach(file => this.addFileToWatches(file));
    }

    _setRunning () {
        this.running    = true;
        this.restarting = false;
        this.stopping   = false;
    }
}

export default LiveModeController;
