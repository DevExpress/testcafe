import EventEmitter from 'events';
import FileWatcher from './file-watcher';
import Logger from './logger';
import process from 'process';
import readline from 'readline';
import Promise from 'pinkie';

const REQUIRED_MODULE_FOUND_EVENT = 'require-module-found';
const LOCK_KEY_PRESS_TIMEOUT      = 1000;

class LiveModeController extends EventEmitter {
    constructor (runner) {
        super();

        this.src            = null;
        this.running        = false;
        this.restarting     = false;
        this.watchingPaused = false;
        this.stopping       = false;
        this.logger         = new Logger();
        this.runner         = runner;
        this.lockKeyPress   = false;
        this.fileWatcher    = null;
        this.rl             = null;
    }

    init (files) {
        this._listenKeyPress();
        this._initFileWatching(files);
        this._listenTestRunnerEvents();
        this._setRunning();

        return Promise.resolve()
            .then(() => this.logger.writeIntroMessage(files));
    }

    dispose () {
        this.fileWatcher.stop();
        process.stdin.setRawMode(false);
        this.rl.close();
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
                .then(() => this._runTests());
        }

        return this._runTests();
    }

    _exit () {
        if (this.stopping)
            return Promise.resolve();

        this.logger.writeExitMessage();

        this.stopping = true;

        return this.runner ? this.runner.exit() : Promise.resolve();
    }

    _createFileWatcher (src) {
        return new FileWatcher(src);
    }

    _listenKeyPress () {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);

        this.rl = readline.createInterface({
            input:  process.stdin,
            output: process.stdout
        });

        process.stdin.on('keypress', (ch, key) => {
            if (this.lockKeyPress)
                return null;

            this.lockKeyPress = true;

            setTimeout(() => {
                this.lockKeyPress = false;
            }, LOCK_KEY_PRESS_TIMEOUT);

            if (key && key.ctrl) {
                switch (key.name) {
                    case 's':
                        return this._stop();
                    case 'r':
                        return this._restart();
                    case 'c':
                        return this._exit();
                    case 'w':
                        return this._toggleWatching();
                }
            }

            return null;
        });
    }

    _listenTestRunnerEvents () {
        this.runner.on(this.runner.TEST_RUN_DONE_EVENT, e => {
            this.running = false;

            if (!this.restarting)
                this.logger.writeTestsFinishedMessage();

            if (e.err)
                this.logger.err(e.err);
        });

        this.runner.on(this.runner.REQUIRED_MODULE_FOUND_EVENT, e => {
            this.emit(REQUIRED_MODULE_FOUND_EVENT, e);
        });
    }

    _initFileWatching (src) {
        this.fileWatcher = this._createFileWatcher(src);

        this.on(REQUIRED_MODULE_FOUND_EVENT, e => this.fileWatcher.addFile(e.filename));

        this.fileWatcher.on(this.fileWatcher.FILE_CHANGED_EVENT, () => this._runTests(true));
    }

    _setRunning () {
        this.running    = true;
        this.restarting = false;
    }

    _runTests (sourceChanged) {
        if (this.watchingPaused || this.running)
            return Promise.resolve();

        this._setRunning();

        this.logger.writeRunTestsMessage(sourceChanged);

        return this.runner.runTests();
    }
}

export default LiveModeController;
