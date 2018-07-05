'use strict';

exports.__esModule = true;

exports.default = function (outStream) {
    if (outStream === process.stdout && _tty2.default.isatty(1)) {
        var detectedViewportWidth = process.stdout.getWindowSize ? process.stdout.getWindowSize(1)[0] : _tty2.default.getWindowSize()[1];

        return Math.max(detectedViewportWidth, DEFAULT_VIEWPORT_WIDTH);
    }

    return DEFAULT_VIEWPORT_WIDTH;
};

var _tty = require('tty');

var _tty2 = _interopRequireDefault(_tty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_VIEWPORT_WIDTH = 78;

module.exports = exports['default'];