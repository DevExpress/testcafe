'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('lodash');

var _logUpdateAsyncHook = require('log-update-async-hook');

var _logUpdateAsyncHook2 = _interopRequireDefault(_logUpdateAsyncHook);

var _createStackFilter = require('../errors/create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    messages: [],

    debugLogging: false,

    streamsOverridden: false,

    _overrideStream: function _overrideStream(stream) {
        var _this = this;

        var initialWrite = stream.write;

        stream.write = function (chunk, encoding, cb) {
            if (_this.debugLogging) initialWrite.call(stream, chunk, encoding, cb);else {
                _this.debugLogging = true;

                _logUpdateAsyncHook2.default.clear();
                _logUpdateAsyncHook2.default.done();

                initialWrite.call(stream, chunk, encoding, cb);

                setTimeout(function () {
                    return _this._showAllBreakpoints();
                }, 0);

                _this.debugLogging = false;
            }
        };
    },
    _overrideStreams: function _overrideStreams() {
        this._overrideStream(process.stdout);
        this._overrideStream(process.stderr);

        this.streamsOverridden = true;
    },
    _getMessageAsString: function _getMessageAsString() {
        var string = '';

        for (var _iterator = this.messages, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var message = _ref;

            string += message.frame;
        }return string;
    },
    _showAllBreakpoints: function _showAllBreakpoints() {
        if (!this.messages.length) return;

        this.debugLogging = true;
        (0, _logUpdateAsyncHook2.default)(this._getMessageAsString());
        this.debugLogging = false;
    },
    showBreakpoint: function showBreakpoint(testRunId, userAgent, callsite, testError) {
        if (!this.streamsOverridden) this._overrideStreams();

        // NOTE: Raw API does not have callsite.
        var hasCallsite = callsite && callsite.renderSync;

        var callsiteStr = hasCallsite ? callsite.renderSync({
            frameSize: 1,
            stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit),
            stack: false
        }) : '';

        var frame = '\n' + '----\n' + (userAgent + '\n') + _chalk2.default.yellow(testError ? 'DEBUGGER PAUSE ON FAILED TEST:' : 'DEBUGGER PAUSE:') + '\n' + ((testError ? testError : callsiteStr) + '\n') + '----\n';

        var message = { testRunId: testRunId, frame: frame };
        var index = (0, _lodash.findIndex)(this.messages, { testRunId: testRunId });

        if (index === -1) this.messages.push(message);else this.messages[index] = message;

        this._showAllBreakpoints();
    },
    hideBreakpoint: function hideBreakpoint(testRunId) {
        var index = (0, _lodash.findIndex)(this.messages, { testRunId: testRunId });

        if (index !== -1) this.messages.splice(index, 1);

        this._showAllBreakpoints();
    }
};
module.exports = exports['default'];