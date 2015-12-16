import chalk from 'chalk';
import indentString from 'indent-string';
import escapeHtml from 'escape-html';
import moment from 'moment';
import 'moment-duration-format';
import OS from 'os-family';
import wordWrap from '../utils/word-wrap';
import getViewportWidth from '../utils/get-viewport-width';
import format from './errors/format';
import mixin from 'mixin-object';

// NOTE: we should not expose internal state to
// the plugin, to avoid accidental rewrites.
// Therefore we use symbols to store them.
var stream          = Symbol();
var viewportWidth   = Symbol();
var wordWrapEnabled = Symbol();
var indent          = Symbol();
var errorDecorator  = Symbol();

export default class ReporterPluginHost {
    constructor (plugin, outStream) {
        this[stream]          = outStream || process.stdout;
        this[viewportWidth]   = getViewportWidth(this[stream]);
        this[wordWrapEnabled] = false;
        this[indent]          = 0;

        var useColors = this[stream] === process.stdout && chalk.enabled && !plugin.noColors;

        this.chalk  = new chalk.constructor({ enabled: useColors });
        this.moment = moment;

        this.symbols = OS.win ?
                       { ok: '√', err: '×' } :
                       { ok: '✓', err: '✖' };

        mixin(this, plugin);

        this[errorDecorator] = this.createErrorDecorator();
    }

    // Error decorator
    createErrorDecorator () {
        return {
            'span category':       () => '',
            'span step-name':      str => `"${str}"`,
            'span user-agent':     str => this.chalk.gray(str),
            'div screenshot-info': str => str,
            'a screenshot-path':   str => this.chalk.underline(str),
            'code':                str => this.chalk.yellow(str),
            'code step-source':    str => this.chalk.magenta(this.indentString(str, 4)),
            'span code-line':      str => `${str}\n`,
            'span last-code-line': str => str,
            'code api':            str => this.chalk.yellow(str),
            'strong':              str => this.chalk.cyan(str),
            'a':                   str => this.chalk.yellow(`"${str}"`)
        };
    }

    // String helpers
    indentString (str, indentVal) {
        return indentString(str, ' ', indentVal);
    }

    wordWrap (str, indentVal, width) {
        return wordWrap(str, indentVal, width);
    }

    escapeHtml (str) {
        return escapeHtml(str);
    }

    formatError (err, prefix = '') {
        var maxMsgLength = this[viewportWidth] - this[indent] - prefix.length;
        var msg          = format(err, this[errorDecorator], maxMsgLength);

        if (this[wordWrapEnabled])
            msg = wordWrap(msg, prefix.length, maxMsgLength);

        return prefix + msg.substr(prefix.length);
    }


    // Writing helpers
    newline () {
        this[stream].write('\n');

        return this;
    }

    write (text) {
        if (this[wordWrapEnabled])
            text = this.wordWrap(text, this[indent], this[viewportWidth]);
        else
            text = this.indentString(text, this[indent]);

        this[stream].write(text);

        return this;
    }

    useWordWrap (use) {
        this[wordWrapEnabled] = use;

        return this;
    }

    setIndent (val) {
        this[indent] = val;

        return this;
    }


    // Abstract methods implemented in plugin
    /* eslint-disable no-unused-vars */

    reportTaskStart (startTime, userAgents, testCount) {
        throw new Error('Not implemented');
    }

    reportFixtureStart (name, path) {
        throw new Error('Not implemented');
    }

    reportTestDone (name, errs, durationMs, unstable, screenshotPath) {
        throw new Error('Not implemented');
    }

    reportTaskDone (endTime, passed) {
        throw new Error('Not implemented');
    }

    /* eslint-enable no-unused-vars */
}
