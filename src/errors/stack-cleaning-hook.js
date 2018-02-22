import createStackFilter from './create-stack-filter';

const ORIGINAL_STACK_TRACE_LIMIT = Error.stackTraceLimit;
const STACK_TRACE_LIMIT          = 200;

// NOTE: 'stack-chain' can't be imported directly, because only one version of it can be imported in a process.
// It causes the process to crash, when older globally installed TestCafe version loads newer locally installed version.
// See the 'stack-chain' code at https://github.com/AndreasMadsen/stack-chain/blob/001f69e35ecd070c68209d13c4325fe5d23fc136/index.js#L10
let stackTrace = null;

export default {
    isEnabled: false,

    _hook (err, frames) {
        return frames.filter(createStackFilter(ORIGINAL_STACK_TRACE_LIMIT));
    },

    get enabled () {
        return this.isEnabled;
    },

    set enabled (val) {
        if (this.isEnabled === val)
            return;

        this.isEnabled = val;

        if (!stackTrace)
            stackTrace = require('stack-chain');

        if (this.isEnabled) {
            // NOTE: Babel errors may have really deep stacks,
            // so we increase stack trace capacity
            Error.stackTraceLimit = STACK_TRACE_LIMIT;
            stackTrace.filter.attach(this._hook);
        }
        else {
            Error.stackTraceLimit = ORIGINAL_STACK_TRACE_LIMIT;
            stackTrace.filter.deattach(this._hook);
        }
    }
};
