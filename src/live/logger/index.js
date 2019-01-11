export default class Logger {
    constructor () {
        this.watching = true;

        this.MESSAGES = {
            intro: `
TestCafe Live watches the files and reruns
the tests once you've saved your changes.
                    
You can use the following keys in the terminal:
'ctrl+s' - stop current test run;
'ctrl+r' - restart current test run;
'ctrl+w' - turn off/on watching;
'ctrl+c' - close browsers and terminate the process.

`,

            sourceChanged:              'Sources have been changed. Test run is starting...',
            testRunStarting:            'Test run is starting...',
            testRunStopping:            'Current test run is stopping...',
            testRunFinishedWatching:    'Make changes in the source files or press ctrl+r to restart test run.',
            testRunFinishedNotWatching: 'Press ctrl+r to restart test run.',
            fileWatchingEnabled:        'File watching enabled. Save changes in your files to run tests.',
            fileWatchingDisabled:       'File watching disabled.',
            nothingToStop:              'There are no tests running at the moment.',
            testCafeStopping:           'Stopping TestCafe Live...',
            watchingFiles:              'Watching files:',
        };
    }

    _write (msg) {
        process.stdout.write(msg);
    }

    _status (msg) {
        this._write('\n' + msg + '\n');
    }

    writeIntroMessage (files) {
        this._write(this.MESSAGES.intro);

        if (!Array.isArray(files))
            return;

        this._status(this.MESSAGES.watchingFiles);

        files.forEach(file => {
            this._write('  ' + file + '\n');
        });

        this._write('\n');
    }

    writeRunTestsMessage (sourcesChanged) {
        const statusMessage = sourcesChanged ? this.MESSAGES.sourceChanged : this.MESSAGES.testRunStarting;

        this._status(statusMessage);
    }

    writeTestsFinishedMessage () {
        const statusMessage = this.watching ? this.MESSAGES.testRunFinishedWatching : this.MESSAGES.testRunFinishedNotWatching;

        this._status(statusMessage);
    }

    writeStopRunningMessage () {
        this._status(this.MESSAGES.testRunStopping);
    }

    writeNothingToStopMessage () {
        this._status(this.MESSAGES.nothingToStop);
    }

    writeToggleWatchingMessage (enable) {
        this.watching = enable;

        const statusMessage = enable ? this.MESSAGES.fileWatchingEnabled : this.MESSAGES.fileWatchingDisabled;

        this._status(statusMessage);
    }

    writeExitMessage () {
        this._status(this.MESSAGES.testCafeStopping);
    }

    err (err) {
        /* eslint-disable no-console */
        console.log(err);
        /* eslint-enable no-console */
    }


}
