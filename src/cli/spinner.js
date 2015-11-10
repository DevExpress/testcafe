import tty from 'tty';
import elegantSpinner from 'elegant-spinner';
import logUpdate from 'log-update';
import chalk from 'chalk';

var isTTY = tty.isatty(1);

export default {
    shown:     false,
    animation: null,

    _show (color, fallbackText) {
        // NOTE: we can use spinner only if stdout is a TTY,
        // otherwise we can't delete previous animation frames
        if (isTTY) {
            var spinnerFrame = elegantSpinner();

            this.animation = setInterval(() => {
                var frame = chalk[color](spinnerFrame());

                logUpdate(frame);
            }, 50);
        }
        // NOTE: in non-TTY mode we should show text only once
        else if (!this.shown)
            console.log(fallbackText);

        this.shown = true;
    },

    showBootstrapIndicator () {
        this._show('cyan', 'Bootstrapping...');
    },

    showRunIndicator () {
        this._show('green', 'Running...');
    },

    hide () {
        if (this.animation) {
            clearInterval(this.animation);
            logUpdate();

            this.animation = null;
        }
    }
};

