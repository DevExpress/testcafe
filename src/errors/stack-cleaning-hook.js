import errorStackParser from 'error-stack-parser';
import createStackFilter from './create-stack-filter';


const ORIGINAL_STACK_TRACE_LIMIT = Error.stackTraceLimit;
const STACK_TRACE_LIMIT          = 200;
const TOP_ANONYMOUS_FRAME_RE     = /\s+at\s<anonymous>$/;


export default {
    isEnabled: false,

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
        error.stack = error.stack.replace(TOP_ANONYMOUS_FRAME_RE, '');

        let frames = this._getFrames(error);

        if (!frames.length)
            return error;

        error.stack = error.stack.replace(this._renderFrameInfo(frames), '');

        frames = frames.filter(createStackFilter(ORIGINAL_STACK_TRACE_LIMIT));

        error.stack += this._renderFrameInfo(frames);

        return error;
    }
};
