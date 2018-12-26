import EventEmitter from 'events';
import FileWatcher from './file-watcher';
import Logger from './logger';
import process from 'process';
import keypress from 'keypress';
import Promise from 'pinkie';

const REQUIRED_MODULE_FOUND_EVENT = 'require-module-found';
const LOCK_KEY_PRESS_TIMEOUT      = 1000;

class Controller extends EventEmitter {
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
    }

    init (files) {
        this._prepareProcessStdin();
        this._listenKeyPress();
        this._initFileWatching(files);
        this._listenTestRunnerEvents();

        return Promise.resolve()
            .then(() => this.logger.writeIntroMessage(files));
    }

    toggleWatching () {
        this.watchingPaused = !this.watchingPaused;

        this.logger.writeToggleWatchingMessage(!this.watchingPaused);
    }

    stop () {
        if (!this.runner || !this.running) {
            this.logger.writeNothingToStopMessage();

            return Promise.resolve();
        }

        this.logger.writeStopRunningMessage();

        return this.runner.stop()
            .then(() => {
                this.restarting = false;
                this.running    = false;
            });
    }

    restart () {
        if (this.restarting || this.watchingPaused)
            return Promise.resolve();

        this.restarting = true;

        if (this.running) {
            return this.stop()
                .then(() => this.logger.writeTestsFinishedMessage())
                .then(() => this._runTests());
        }

        return this._runTests();
    }

    exit () {
        if (this.stopping)
            return Promise.resolve();

        this.logger.writeExitMessage();

        this.stopping = true;

        return this.runner ? this.runner.exit() : Promise.resolve();
    }

    _createFileWatcher (src) {
        return new FileWatcher(src);
    }

    _prepareProcessStdin () {
        if (process.stdout.isTTY)
            process.stdin.setRawMode(true);
    }

    _listenKeyPress () {
        // Listen commands
        keypress(process.stdin);

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
                        return this.stop();
                    case 'r':
                        return this.restart();
                    case 'c':
                        return this.exit();
                    case 'w':
                        return this.toggleWatching();
                }
            }

            return null;
        });
    }

    _listenTestRunnerEvents () {
        this.runner.on(this.runner.TEST_RUN_STARTED, () => this.logger.writeTestsStartedMessage());

        this.runner.on(this.runner.TEST_RUN_DONE_EVENT, e => {
            this.running = false;

            if (!this.restarting)
                this.logger.writeTestsFinishedMessage();

            if (e.err)
                this.logger.err(`ERROR: ${e.err}`);
        });

        this.runner.on(this.runner.REQUIRED_MODULE_FOUND_EVENT, e => {
            this.emit(REQUIRED_MODULE_FOUND_EVENT, e);
        });
    }

    _initFileWatching (src) {
        const fileWatcher = this._createFileWatcher(src);

        this.on(REQUIRED_MODULE_FOUND_EVENT, e => fileWatcher.addFile(e.filename));

        fileWatcher.on(fileWatcher.FILE_CHANGED_EVENT, () => this._runTests(true));
    }

    _runTests (sourceChanged) {
        if (this.watchingPaused || this.running)
            return Promise.resolve();

        this.running    = true;
        this.restarting = false;

        this.logger.writeRunTestsMessage(sourceChanged);

        return this.runner.runTests();
    }
}

export default Controller;
