'use strict';

exports.__esModule = true;

var _callsite = require('callsite');

var _callsite2 = _interopRequireDefault(_callsite);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TRACKING_MARK_RE = /^\$\$testcafe_test_run\$\$(\S+)\$\$$/;
var STACK_CAPACITY = 5000;

// Tracker
exports.default = {
    enabled: false,

    activeTestRuns: {},

    _createContextSwitchingFunctionHook: function _createContextSwitchingFunctionHook(ctxSwitchingFn, patchedArgsCount) {
        var tracker = this;

        return function () {
            var testRunId = tracker.getContextTestRunId();

            if (testRunId) {
                for (var i = 0; i < patchedArgsCount; i++) {
                    if (typeof arguments[i] === 'function') arguments[i] = tracker.addTrackingMarkerToFunction(testRunId, arguments[i]);
                }
            }

            return ctxSwitchingFn.apply(this, arguments);
        };
    },
    _getStackFrames: function _getStackFrames() {
        // NOTE: increase stack capacity to seek deep stack entries
        var savedLimit = Error.stackTraceLimit;

        Error.stackTraceLimit = STACK_CAPACITY;

        var frames = (0, _callsite2.default)();

        Error.stackTraceLimit = savedLimit;

        return frames;
    },
    ensureEnabled: function ensureEnabled() {
        if (!this.enabled) {
            global.setTimeout = this._createContextSwitchingFunctionHook(global.setTimeout, 1);
            global.setInterval = this._createContextSwitchingFunctionHook(global.setInterval, 1);
            global.setImmediate = this._createContextSwitchingFunctionHook(global.setImmediate, 1);
            process.nextTick = this._createContextSwitchingFunctionHook(process.nextTick, 1);

            _promise2.default.prototype.then = this._createContextSwitchingFunctionHook(_promise2.default.prototype.then, 2);
            _promise2.default.prototype.catch = this._createContextSwitchingFunctionHook(_promise2.default.prototype.catch, 1);

            if (global.Promise) {
                global.Promise.prototype.then = this._createContextSwitchingFunctionHook(global.Promise.prototype.then, 2);
                global.Promise.prototype.catch = this._createContextSwitchingFunctionHook(global.Promise.prototype.catch, 1);
            }

            this.enabled = true;
        }
    },
    addTrackingMarkerToFunction: function addTrackingMarkerToFunction(testRunId, fn) {
        var markerFactoryBody = '\n            return function $$testcafe_test_run$$' + testRunId + '$$ () {\n                switch (arguments.length) {\n                    case 0: return fn.call(this);\n                    case 1: return fn.call(this, arguments[0]);\n                    case 2: return fn.call(this, arguments[0], arguments[1]);\n                    case 3: return fn.call(this, arguments[0], arguments[1], arguments[2]);\n                    case 4: return fn.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);\n                    default: return fn.apply(this, arguments);\n                }\n            };\n        ';

        return new Function('fn', markerFactoryBody)(fn);
    },
    getContextTestRunId: function getContextTestRunId() {
        var frames = this._getStackFrames();

        // OPTIMIZATION: we start traversing from the bottom of the stack,
        // because we'll more likely encounter a marker there.
        // Async/await and Promise machinery executes lots of intrinsics
        // on timers (where we have a marker). And, since a timer initiates a new
        // stack, the marker will be at the very bottom of it.
        for (var i = frames.length - 1; i >= 0; i--) {
            var fnName = frames[i].getFunctionName();
            var match = fnName && fnName.match(TRACKING_MARK_RE);

            if (match) return match[1];
        }

        return null;
    },
    resolveContextTestRun: function resolveContextTestRun() {
        var testRunId = this.getContextTestRunId();

        return this.activeTestRuns[testRunId];
    }
};
module.exports = exports['default'];