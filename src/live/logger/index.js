import log from '../../cli/log';

export default class Logger {
    constructor () {
        this.watching = true;

        this.MESSAGES = {
            intro: `Live mode is enabled.
TestCafe now watches source files and reruns
the tests once the changes are saved.
                    
You can use the following keys in the terminal:
'Ctrl+S' - stops the test run;
'Ctrl+R' - restarts the test run;
'Ctrl+W' - enables/disables watching files;
'Ctrl+C' - quits live mode and closes the browsers.
`,

            sourceChanged:              'The sources have changed. A test run is starting...',
            testRunStarting:            'A test run is starting...',
            testRunStopping:            'The test run is stopping...',
            testRunFinishedWatching:    'Make changes to the source files or press Ctrl+R to restart the test run.',
            testRunFinishedNotWatching: 'Press Ctrl+R to restart the test run.',
            fileWatchingEnabled:        'TestCafe is watching the source files. Save the changes to run tests.',
            fileWatchingDisabled:       'TestCafe is not watching the source files.',
            nothingToStop:              'There are no tests running at the moment.',
            testCafeStopping:           'Stopping TestCafe live mode...',
            watchingFiles:              'Watching the following files:',
        };
    }

    _write (msg, prefix = '\n') {
        log.write(`${prefix}${msg}`);
    }

    writeIntroMessage (files) {
        this._write(this.MESSAGES.intro);

        if (!Array.isArray(files))
            return;

        this._write(this.MESSAGES.watchingFiles);

        files.forEach(file => {
            this._write(file, '  ');
        });
    }

    writeRunTestsMessage (sourcesChanged) {
        const statusMessage = sourcesChanged ? this.MESSAGES.sourceChanged : this.MESSAGES.testRunStarting;

        this._write(statusMessage);
    }

    writeTestsFinishedMessage () {
        const statusMessage = this.watching ? this.MESSAGES.testRunFinishedWatching : this.MESSAGES.testRunFinishedNotWatching;

        this._write(statusMessage);
    }

    writeStopRunningMessage () {
        this._write(this.MESSAGES.testRunStopping);
    }

    writeNothingToStopMessage () {
        this._write(this.MESSAGES.nothingToStop);
    }

    writeToggleWatchingMessage (enable) {
        this.watching = enable;

        const statusMessage = enable ? this.MESSAGES.fileWatchingEnabled : this.MESSAGES.fileWatchingDisabled;

        this._write(statusMessage);
    }

    writeExitMessage () {
        this._write(this.MESSAGES.testCafeStopping);
    }

    err (err) {
        /* eslint-disable no-console */
        console.log(err);
        /* eslint-enable no-console */
    }


}
