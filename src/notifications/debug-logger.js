import chalk from 'chalk';
import { findIndex } from 'lodash';
import logUpdate from 'log-update';
import createStackFilter from '../errors/create-stack-filter';

export default {
    messages: [],

    debugLogging: false,

    streamsOverridden: false,

    _overrideStream (stream) {
        var initialWrite = stream.write;
        var that         = this;

        // NOTE: we cannot use arrow function here because 'this' should
        // be a 'stream' object otherwise stream.write will raise error
        stream.write = function () {
            if (that.debugLogging) {
                initialWrite.apply(stream, arguments);
                return;
            }

            that.debugLogging = true;

            logUpdate.clear();
            logUpdate.done();

            initialWrite.apply(stream, arguments);

            that._showAllBreakpoints();

            that.debugLogging = false;
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

    showBreakpoint (testRunId, userAgent, callsite) {
        if (!this.streamsOverridden)
            this._overrideStreams();

        var callsiteStr = callsite.renderSync({
            frameSize:   1,
            stackFilter: createStackFilter(Error.stackTraceLimit),
            stack:       false
        });

        var frame = `\n` +
                    `----\n` +
                    `${userAgent}\n` +
                    chalk.yellow('DEBUGGER PAUSE:') + `\n` +
                    `${callsiteStr}\n` +
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
