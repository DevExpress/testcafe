'use strict';

exports.__esModule = true;

var _tty = require('tty');

var _tty2 = _interopRequireDefault(_tty);

var _elegantSpinner = require('elegant-spinner');

var _elegantSpinner2 = _interopRequireDefault(_elegantSpinner);

var _logUpdateAsyncHook = require('log-update-async-hook');

var _logUpdateAsyncHook2 = _interopRequireDefault(_logUpdateAsyncHook);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _isCi = require('is-ci');

var _isCi2 = _interopRequireDefault(_isCi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: To support piping, we use stderr as the log output
// stream, while stdout is used for the report output.
exports.default = {
    animation: null,
    isAnimated: _tty2.default.isatty(1) && !_isCi2.default,

    showSpinner: function showSpinner() {
        // NOTE: we can use the spinner only if stderr is a TTY and we are not in CI environment (e.g. TravisCI),
        // otherwise we can't repaint animation frames. Thanks https://github.com/sindresorhus/ora for insight.
        if (this.isAnimated) {
            var spinnerFrame = (0, _elegantSpinner2.default)();

            this.animation = setInterval(function () {
                var frame = _chalk2.default.cyan(spinnerFrame());

                _logUpdateAsyncHook2.default.stderr(frame);
            }, 50);
        }
    },
    hideSpinner: function hideSpinner(isExit) {
        if (this.animation) {
            clearInterval(this.animation);
            _logUpdateAsyncHook2.default.stderr.clear();

            if (isExit) _logUpdateAsyncHook2.default.stderr.done();

            this.animation = null;
        }
    },
    write: function write(text) {
        console.error(text);
    }
};
module.exports = exports['default'];