import chalk from 'chalk';
import logUpdate from 'log-update';
import createStackFilter from '../errors/create-stack-filter';

export default {
    messages: [],

    inLogging: false,

    streamsOverridden: false,

    _overrideStream (stream) {
        var initialWrite = stream.write;

        stream.write = function () {
            if (!this.inLogging) {
                this.inLogging = true;

                logUpdate.clear();
                logUpdate.done();

                initialWrite.apply(stream, arguments);

                this.inLogging = false;
            }
            else
                initialWrite.apply(stream, arguments);
        };
    },

    _overrideStreams () {
        this._overrideStream(process.stdout);
        this._overrideStream(process.stderr);

        this.streamsOverridden = true;
    },

    _getMessageIndex (testRunId) {
        for (var i = 0; i < this.messages.length; i++) {
            if (this.messages[i].testRunId === testRunId)
                return i;
        }

        return -1;
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

        this.inLogging = true;
        logUpdate(this._getMessageAsString());
        this.inLogging = false;
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
        var index   = this._getMessageIndex(testRunId);

        if (index === -1)
            this.messages.push(message);
        else
            this.messages[index] = message;

        this._showAllBreakpoints();
    },

    hideBreakpoint (testRunId) {
        var index = this._getMessageIndex(testRunId);

        if (index !== -1)
            this.messages.splice(index, 1);

        this._showAllBreakpoints();
    }
};
