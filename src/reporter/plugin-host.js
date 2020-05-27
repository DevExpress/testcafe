import chalk from 'chalk';
import indentString from 'indent-string';
import { identity, escape as escapeHtml, assignIn } from 'lodash';
import moment from '../utils/moment-loader';
import OS from 'os-family';
import { wordWrap, removeTTYColors } from '../utils/string';
import getViewportWidth from '../utils/get-viewport-width';

// NOTE: we should not expose internal state to
// the plugin, to avoid accidental rewrites.
// Therefore we use symbols to store them.

/*global Symbol*/
const stream          = Symbol();
const wordWrapEnabled = Symbol();
const indent          = Symbol();
const errorDecorator  = Symbol();

export default class ReporterPluginHost {
    constructor (plugin, outStream, name) {
        this.name             = name;
        this.streamController = null;

        this[stream]          = outStream || process.stdout;
        this[wordWrapEnabled] = false;
        this[indent]          = 0;

        const useColors = this[stream] === process.stdout && chalk.enabled && !plugin.noColors;

        this.chalk         = new chalk.constructor({ enabled: useColors });
        this.moment        = moment;
        this.viewportWidth = getViewportWidth(this[stream]);

        this.symbols = OS.win ?
            { ok: '√', err: '×' } :
            { ok: '✓', err: '✖' };

        assignIn(this, plugin);

        this[errorDecorator] = this.createErrorDecorator();
    }

    // Error decorator
    createErrorDecorator () {
        return {
            'span user-agent': str => this.chalk.grey(str),

            'span subtitle': str => `- ${this.chalk.bold.red(str)} -`,
            'div message':   str => this.chalk.bold.red(str),

            'div screenshot-info': identity,
            'a screenshot-path':   str => this.chalk.grey.underline(str),

            'code': identity,

            'span syntax-string':     str => this.chalk.green(str),
            'span syntax-punctuator': str => this.chalk.grey(str),
            'span syntax-keyword':    str => this.chalk.cyan(str),
            'span syntax-number':     str => this.chalk.magenta(str),
            'span syntax-regex':      str => this.chalk.magenta(str),
            'span syntax-comment':    str => this.chalk.grey.bold(str),
            'span syntax-invalid':    str => this.chalk.inverse(str),

            'div code-frame':         identity,
            'div code-line':          str => str + '\n',
            'div code-line-last':     identity,
            'div code-line-num':      str => `   ${str} |`,
            'div code-line-num-base': str => this.chalk.bgRed(` > ${str} `) + '|',
            'div code-line-src':      identity,

            'div stack':               str => '\n\n' + str,
            'div stack-line':          str => str + '\n',
            'div stack-line-last':     identity,
            'div stack-line-name':     str => `   at ${this.chalk.bold(str)}`,
            'div stack-line-location': str => ` (${this.chalk.grey.underline(str)})`,

            'strong': str => this.chalk.bold(str),
            'a':      str => `"${this.chalk.underline(str)}"`
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
        const prefixLengthWithoutColors = removeTTYColors(prefix).length;
        const maxMsgLength              = this.viewportWidth - this[indent] - prefixLengthWithoutColors;
        let msg                         = err.formatMessage(this[errorDecorator], maxMsgLength);

        if (this[wordWrapEnabled])
            msg = this.wordWrap(msg, prefixLengthWithoutColors, maxMsgLength);
        else
            msg = this.indentString(msg, prefixLengthWithoutColors);

        return prefix + msg.substr(prefixLengthWithoutColors);
    }


    // Writing helpers
    newline () {
        this._writeToUniqueStream('\n');

        return this;
    }

    write (text) {
        if (this[wordWrapEnabled])
            text = this.wordWrap(text, this[indent], this.viewportWidth);
        else
            text = this.indentString(text, this[indent]);

        this._writeToUniqueStream(text);

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

    _writeToUniqueStream (text) {
        if (!this.streamController || this.streamController.ensureUniqueStream(this[stream], this))
            this[stream].write(text);
    }


    // Abstract methods implemented in plugin
    async reportTaskStart (/* startTime, userAgents, testCount, testStructure, taskProperties */) {
        throw new Error('Not implemented');
    }

    async reportFixtureStart (/* name, path */) {
        throw new Error('Not implemented');
    }

    // NOTE: It's an optional method
    // async reportTestStart (/* name, testMeta */) {
    //     throw new Error('Not implemented');
    // }

    async reportTestDone (/* name, testRunInfo */) {
        throw new Error('Not implemented');
    }

    async reportTaskDone (/* endTime, passed, warnings */) {
        throw new Error('Not implemented');
    }
}
