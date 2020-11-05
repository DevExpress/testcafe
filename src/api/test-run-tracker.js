import getStackFrames from 'callsite';

const TRACKING_MARK_RE = /^\$\$testcafe_test_run\$\$(\S+)\$\$$/;
const STACK_CAPACITY   = 5000;

// Tracker
export default {
    enabled: false,

    activeTestRuns: {},

    _createContextSwitchingFunctionHook (ctxSwitchingFn, patchedArgsCount) {
        const tracker = this;

        return function () {
            const testRunId = tracker.getContextTestRunId();

            if (testRunId) {
                for (let i = 0; i < patchedArgsCount; i++) {
                    if (typeof arguments[i] === 'function')
                        arguments[i] = tracker.addTrackingMarkerToFunction(testRunId, arguments[i]);
                }
            }

            return ctxSwitchingFn.apply(this, arguments);
        };
    },

    _getStackFrames () {
        // NOTE: increase stack capacity to seek deep stack entries
        const savedLimit = Error.stackTraceLimit;

        Error.stackTraceLimit = STACK_CAPACITY;

        const frames = getStackFrames();

        Error.stackTraceLimit = savedLimit;

        return frames;
    },

    ensureEnabled () {
        if (!this.enabled) {
            global.setTimeout   = this._createContextSwitchingFunctionHook(global.setTimeout, 1);
            global.setInterval  = this._createContextSwitchingFunctionHook(global.setInterval, 1);
            global.setImmediate = this._createContextSwitchingFunctionHook(global.setImmediate, 1);
            process.nextTick    = this._createContextSwitchingFunctionHook(process.nextTick, 1);

            global.Promise.prototype.then  = this._createContextSwitchingFunctionHook(global.Promise.prototype.then, 2);
            global.Promise.prototype.catch = this._createContextSwitchingFunctionHook(global.Promise.prototype.catch, 1);

            this.enabled = true;
        }
    },

    addTrackingMarkerToFunction (testRunId, fn) {
        const markerFactoryBody = `
            return function $$testcafe_test_run$$${testRunId}$$ () {
                switch (arguments.length) {
                    case 0: return fn.call(this);
                    case 1: return fn.call(this, arguments[0]);
                    case 2: return fn.call(this, arguments[0], arguments[1]);
                    case 3: return fn.call(this, arguments[0], arguments[1], arguments[2]);
                    case 4: return fn.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
                    default: return fn.apply(this, arguments);
                }
            };
        `;

        return new Function('fn', markerFactoryBody)(fn);
    },

    getContextTestRunId () {
        const frames = this._getStackFrames();

        // OPTIMIZATION: we start traversing from the bottom of the stack,
        // because we'll more likely encounter a marker there.
        // Async/await and Promise machinery executes lots of intrinsics
        // on timers (where we have a marker). And, since a timer initiates a new
        // stack, the marker will be at the very bottom of it.
        for (let i = frames.length - 1; i >= 0; i--) {
            const fnName = frames[i].getFunctionName();
            const match  = fnName && fnName.match(TRACKING_MARK_RE);

            if (match)
                return match[1];
        }

        return null;
    },

    resolveContextTestRun () {
        const testRunId = this.getContextTestRunId();

        return this.activeTestRuns[testRunId];
    }
};
