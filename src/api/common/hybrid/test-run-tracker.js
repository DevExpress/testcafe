import getStackFrames from 'callsite';
import BabelPromise from 'babel-runtime/core-js/promise';

const TRACKING_MARK_RE = /^\$\$testcafe_test_run\$\$(\S+)\$\$$/;
const STACK_CAPACITY   = 5000;

// Utils
// NOTE: testRunId may contain '-' which is not allowed in function names.
// But it's guaranteed that it will never contain '$'
// (see: https://github.com/dylang/shortid#charactersstring)
// So we use '$' to encode '-'.
function encodeTestRunId (testRunId) {
    return testRunId.replace(/-/g, '$');
}

function decodeTestRunId (testRunId) {
    return testRunId.replace(/\$/g, '-');
}

// Tracker
export default {
    enabled: false,

    _createContextSwitchingFunctionHook (ctxSwitchingFn, patchedArgsCount) {
        var tracker = this;

        return function () {
            var testRunId = tracker.getOwnerTestRunId();

            if (testRunId) {
                for (var i = 0; i < patchedArgsCount; i++) {
                    if (typeof arguments[i] === 'function')
                        arguments[i] = tracker.addTrackingMarkerToFunction(testRunId, arguments[i]);
                }
            }

            return ctxSwitchingFn.apply(this, arguments);
        };
    },

    _getStackFrames () {
        // NOTE: increase stack capacity to seek deep stack entries
        var savedLimit = Error.stackTraceLimit;

        Error.stackTraceLimit = STACK_CAPACITY;

        var frames = getStackFrames();

        Error.stackTraceLimit = savedLimit;

        return frames;
    },

    ensureEnabled () {
        if (!this.enabled) {
            global.setTimeout   = this._createContextSwitchingFunctionHook(global.setTimeout, 1);
            global.setInterval  = this._createContextSwitchingFunctionHook(global.setInterval, 1);
            global.setImmediate = this._createContextSwitchingFunctionHook(global.setImmediate, 1);
            process.nextTick    = this._createContextSwitchingFunctionHook(process.nextTick, 1);

            BabelPromise.prototype.then  = this._createContextSwitchingFunctionHook(BabelPromise.prototype.then, 2);
            BabelPromise.prototype.catch = this._createContextSwitchingFunctionHook(BabelPromise.prototype.catch, 1);

            if (global.Promise) {
                global.Promise.prototype.then  = this._createContextSwitchingFunctionHook(global.Promise.prototype.then, 2);
                global.Promise.prototype.catch = this._createContextSwitchingFunctionHook(global.Promise.prototype.catch, 1);
            }

            this.enabled = true;
        }
    },

    addTrackingMarkerToFunction (testRunId, fn) {
        var markerFactoryBody = `
            return function $$testcafe_test_run$$${encodeTestRunId(testRunId)}$$ () {
                return fn.apply(this, arguments);
            };
        `;

        return new Function('fn', markerFactoryBody)(fn);
    },

    getOwnerTestRunId () {
        var frames = this._getStackFrames();

        // OPTIMIZATION: we start traversing from the bottom of the stack,
        // because we'll more likely encounter marker there.
        // Async/await and Promise machinery executes lots of intrinsics
        // on timeouts (where we have mark). And, since timeout initiates new
        // stack, marker will be at the very bottom of the stack.
        for (var i = frames.length - 1; i >= 0; i--) {
            var fnName = frames[i].getFunctionName();
            var match  = fnName && fnName.match(TRACKING_MARK_RE);

            if (match)
                return decodeTestRunId(match[1]);
        }

        return null;
    }
};

