import chalk from 'chalk';
import { findIndex } from 'lodash';
import logUpdate from 'log-update-async-hook';
import createStackFilter from '../errors/create-stack-filter';

export default {
    messages: [],

    debugLogging: false,

    streamsOverridden: false,

    _overrideStream (stream) {
        var initialWrite = stream.write;

        stream.write = (chunk, encoding, cb) => {
            if (this.debugLogging)
                initialWrite.call(stream, chunk, encoding, cb);
            else {
                this.debugLogging = true;

                logUpdate.clear();
                logUpdate.done();

                initialWrite.call(stream, chunk, encoding, cb);

                setTimeout(() => this._showAllBreakpoints(), 0);

                this.debugLogging = false;
            }
        };
    },

    _overrideStreams () {
        this._overrideStream(process.stdout);
        this._overrideStream(process.stderr);

        this.streamsOverridden = true;
    },

    _getMessageAsString () {
        var string = '';

        for (var message of this.messages)
            string += message.frame;

        return string;
    },

    _showAllBreakpoints () {
        if (!this.messages.length)
            return;

        this.debugLogging = true;
        logUpdate(this._getMessageAsString());
        this.debugLogging = false;
    },

    showBreakpoint (testRunId, userAgent, callsite, testError) {
        if (!this.streamsOverridden)
            this._overrideStreams();

        // NOTE: Raw API does not have callsite.
        var hasCallsite = callsite && callsite.renderSync;

        var callsiteStr = hasCallsite ? callsite.renderSync({
            frameSize:   1,
            stackFilter: createStackFilter(Error.stackTraceLimit),
            stack:       false
        }) : '';

        var frame = `\n` +
                    `----\n` +
                    `${userAgent}\n` +
                    chalk.yellow(testError ? 'DEBUGGER PAUSE ON FAILED TEST:' : 'DEBUGGER PAUSE:') + `\n` +
                    `${testError ? testError : callsiteStr}\n` +
                    `----\n`;

        var message = { testRunId, frame };
        var index   = findIndex(this.messages, { testRunId });

        if (index === -1)
            this.messages.push(message);
        else
            this.messages[index] = message;

        this._showAllBreakpoints();
    },

    hideBreakpoint (testRunId) {
        var index = findIndex(this.messages, { testRunId });

        if (index !== -1)
            this.messages.splice(index, 1);

        this._showAllBreakpoints();
    }
};
