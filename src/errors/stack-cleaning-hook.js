import errorStackParser from 'error-stack-parser';
import createStackFilter from './create-stack-filter';


const ORIGINAL_STACK_TRACE_LIMIT = Error.stackTraceLimit;
const STACK_TRACE_LIMIT          = 200;
const STACK_TRACE_LINE_RE        = /^\s+at\s+.*$/;


export default {
    isEnabled: false,

    _isStackTraceLine (stackLine) {
        return STACK_TRACE_LINE_RE.test(stackLine);
    },

    _removeStackTraceLines (error) {
        if (!error.stack) {
            error.stack = '';
            return;
        }

        const stackLines = error.stack.split('\n');

        let stackLinesCount = 0;

        while (stackLinesCount < stackLines.length && this._isStackTraceLine(stackLines[stackLines.length - 1 - stackLinesCount]))
            stackLinesCount++;

        error.stack = stackLines.slice(0, stackLines.length - stackLinesCount).join('\n');

        if (stackLinesCount > 0)
            error.stack += '\n';
    },

    _getFrames (error) {
        try {
            return errorStackParser.parse(error);
        }
        catch (e) {
            return [];
        }
    },

    _renderFrameInfo (frames) {
        return frames.map(frame => frame.getSource()).join('\n');
    },

    get enabled () {
        return this.isEnabled;
    },

    set enabled (val) {
        if (this.isEnabled === val)
            return;

        this.isEnabled = val;

        // NOTE: Babel errors may have really deep stacks,
        // so we increase stack trace capacity
        if (this.isEnabled)
            Error.stackTraceLimit = STACK_TRACE_LIMIT;
        else
            Error.stackTraceLimit = ORIGINAL_STACK_TRACE_LIMIT;
    },

    cleanError (error) {
        let frames = this._getFrames(error);

        if (!frames.length)
            return error;

        this._removeStackTraceLines(error);

        const stackFilterFn = createStackFilter(ORIGINAL_STACK_TRACE_LIMIT);

        frames = frames.filter(stackFilterFn);

        error.stack += this._renderFrameInfo(frames);

        return error;
    }
};
