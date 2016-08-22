import tty from 'tty';
import elegantSpinner from 'elegant-spinner';
import logUpdate from 'log-update';
import chalk from 'chalk';

// NOTE: To support piping, we use stderr as the log output
// stream, while stdout is used for the report output.
export default {
    animation:  null,
    isAnimated: tty.isatty(1) && !process.env.CI,

    showSpinner () {
        // NOTE: we can use the spinner only if stderr is a TTY and we are not in CI environment (e.g. TravisCI),
        // otherwise we can't repaint animation frames. Thanks https://github.com/sindresorhus/ora for insight.
        if (this.isAnimated) {
            var spinnerFrame = elegantSpinner();

            this.animation = setInterval(() => {
                var frame = chalk.cyan(spinnerFrame());

                logUpdate.stderr(frame);
            }, 50);
        }
    },

    hideSpinner () {
        if (this.animation) {
            clearInterval(this.animation);
            logUpdate.stderr.clear();

            this.animation = null;
        }
    },

    write (text) {
        console.error(text);
    }
};

