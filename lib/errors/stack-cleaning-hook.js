'use strict';

exports.__esModule = true;

var _errorStackParser = require('error-stack-parser');

var _errorStackParser2 = _interopRequireDefault(_errorStackParser);

var _createStackFilter = require('./create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ORIGINAL_STACK_TRACE_LIMIT = Error.stackTraceLimit;
var STACK_TRACE_LIMIT = 200;
var TOP_ANONYMOUS_FRAME_RE = /\s+at\s<anonymous>$/;

exports.default = {
    isEnabled: false,

    _getFrames: function _getFrames(error) {
        try {
            return _errorStackParser2.default.parse(error);
        } catch (e) {
            return [];
        }
    },
    _renderFrameInfo: function _renderFrameInfo(frames) {
        return frames.map(function (frame) {
            return frame.getSource();
        }).join('\n');
    },


    get enabled() {
        return this.isEnabled;
    },

    set enabled(val) {
        if (this.isEnabled === val) return;

        this.isEnabled = val;

        // NOTE: Babel errors may have really deep stacks,
        // so we increase stack trace capacity
        if (this.isEnabled) Error.stackTraceLimit = STACK_TRACE_LIMIT;else Error.stackTraceLimit = ORIGINAL_STACK_TRACE_LIMIT;
    },

    cleanError: function cleanError(error) {
        error.stack = error.stack.replace(TOP_ANONYMOUS_FRAME_RE, '');

        var frames = this._getFrames(error);

        if (!frames.length) return error;

        error.stack = error.stack.replace(this._renderFrameInfo(frames), '');

        frames = frames.filter((0, _createStackFilter2.default)(ORIGINAL_STACK_TRACE_LIMIT));

        error.stack += this._renderFrameInfo(frames);

        return error;
    }
};
module.exports = exports['default'];