'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _indentString2 = require('indent-string');

var _indentString3 = _interopRequireDefault(_indentString2);

var _lodash = require('lodash');

var _momentLoader = require('../utils/moment-loader');

var _momentLoader2 = _interopRequireDefault(_momentLoader);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _string = require('../utils/string');

var _getViewportWidth = require('../utils/get-viewport-width');

var _getViewportWidth2 = _interopRequireDefault(_getViewportWidth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: we should not expose internal state to
// the plugin, to avoid accidental rewrites.
// Therefore we use symbols to store them.

/*global Symbol*/
var stream = (0, _symbol2.default)();
var wordWrapEnabled = (0, _symbol2.default)();
var indent = (0, _symbol2.default)();
var errorDecorator = (0, _symbol2.default)();

var ReporterPluginHost = function () {
    function ReporterPluginHost(plugin, outStream) {
        (0, _classCallCheck3.default)(this, ReporterPluginHost);

        this[stream] = outStream || process.stdout;
        this[wordWrapEnabled] = false;
        this[indent] = 0;

        var useColors = this[stream] === process.stdout && _chalk2.default.enabled && !plugin.noColors;

        this.chalk = new _chalk2.default.constructor({ enabled: useColors });
        this.moment = _momentLoader2.default;
        this.viewportWidth = (0, _getViewportWidth2.default)(this[stream]);

        this.symbols = _osFamily2.default.win ? { ok: '√', err: '×' } : { ok: '✓', err: '✖' };

        (0, _lodash.assignIn)(this, plugin);

        this[errorDecorator] = this.createErrorDecorator();
    }

    // Error decorator


    ReporterPluginHost.prototype.createErrorDecorator = function createErrorDecorator() {
        var _this = this;

        return {
            'span user-agent': function spanUserAgent(str) {
                return _this.chalk.grey(str);
            },

            'span subtitle': function spanSubtitle(str) {
                return '- ' + _this.chalk.bold.red(str) + ' -';
            },
            'div message': function divMessage(str) {
                return _this.chalk.bold.red(str);
            },

            'div screenshot-info': _lodash.identity,
            'a screenshot-path': function aScreenshotPath(str) {
                return _this.chalk.grey.underline(str);
            },

            'code': _lodash.identity,

            'span syntax-string': function spanSyntaxString(str) {
                return _this.chalk.green(str);
            },
            'span syntax-punctuator': function spanSyntaxPunctuator(str) {
                return _this.chalk.grey(str);
            },
            'span syntax-keyword': function spanSyntaxKeyword(str) {
                return _this.chalk.cyan(str);
            },
            'span syntax-number': function spanSyntaxNumber(str) {
                return _this.chalk.magenta(str);
            },
            'span syntax-regex': function spanSyntaxRegex(str) {
                return _this.chalk.magenta(str);
            },
            'span syntax-comment': function spanSyntaxComment(str) {
                return _this.chalk.grey.bold(str);
            },
            'span syntax-invalid': function spanSyntaxInvalid(str) {
                return _this.chalk.inverse(str);
            },

            'div code-frame': _lodash.identity,
            'div code-line': function divCodeLine(str) {
                return str + '\n';
            },
            'div code-line-last': _lodash.identity,
            'div code-line-num': function divCodeLineNum(str) {
                return '   ' + str + ' |';
            },
            'div code-line-num-base': function divCodeLineNumBase(str) {
                return _this.chalk.bgRed(' > ' + str + ' ') + '|';
            },
            'div code-line-src': _lodash.identity,

            'div stack': function divStack(str) {
                return '\n\n' + str;
            },
            'div stack-line': function divStackLine(str) {
                return str + '\n';
            },
            'div stack-line-last': _lodash.identity,
            'div stack-line-name': function divStackLineName(str) {
                return '   at ' + _this.chalk.bold(str);
            },
            'div stack-line-location': function divStackLineLocation(str) {
                return ' (' + _this.chalk.grey.underline(str) + ')';
            },

            'strong': function strong(str) {
                return _this.chalk.bold(str);
            },
            'a': function a(str) {
                return '"' + _this.chalk.underline(str) + '"';
            }
        };
    };

    // String helpers


    ReporterPluginHost.prototype.indentString = function indentString(str, indentVal) {
        return (0, _indentString3.default)(str, ' ', indentVal);
    };

    ReporterPluginHost.prototype.wordWrap = function wordWrap(str, indentVal, width) {
        return (0, _string.wordWrap)(str, indentVal, width);
    };

    ReporterPluginHost.prototype.escapeHtml = function escapeHtml(str) {
        return (0, _lodash.escape)(str);
    };

    ReporterPluginHost.prototype.formatError = function formatError(err) {
        var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        var prefixLengthWithoutColors = (0, _string.removeTTYColors)(prefix).length;
        var maxMsgLength = this.viewportWidth - this[indent] - prefixLengthWithoutColors;
        var msg = err.formatMessage(this[errorDecorator], maxMsgLength);

        if (this[wordWrapEnabled]) msg = this.wordWrap(msg, prefixLengthWithoutColors, maxMsgLength);else msg = this.indentString(msg, prefixLengthWithoutColors);

        return prefix + msg.substr(prefixLengthWithoutColors);
    };

    // Writing helpers


    ReporterPluginHost.prototype.newline = function newline() {
        this[stream].write('\n');

        return this;
    };

    ReporterPluginHost.prototype.write = function write(text) {
        if (this[wordWrapEnabled]) text = this.wordWrap(text, this[indent], this.viewportWidth);else text = this.indentString(text, this[indent]);

        this[stream].write(text);

        return this;
    };

    ReporterPluginHost.prototype.useWordWrap = function useWordWrap(use) {
        this[wordWrapEnabled] = use;

        return this;
    };

    ReporterPluginHost.prototype.setIndent = function setIndent(val) {
        this[indent] = val;

        return this;
    };

    // Abstract methods implemented in plugin


    ReporterPluginHost.prototype.reportTaskStart = function reportTaskStart() /* startTime, userAgents, testCount */{
        throw new Error('Not implemented');
    };

    ReporterPluginHost.prototype.reportFixtureStart = function reportFixtureStart() /* name, path */{
        throw new Error('Not implemented');
    };

    ReporterPluginHost.prototype.reportTestDone = function reportTestDone() /* name, testRunInfo */{
        throw new Error('Not implemented');
    };

    ReporterPluginHost.prototype.reportTaskDone = function reportTaskDone() /* endTime, passed, warnings */{
        throw new Error('Not implemented');
    };

    return ReporterPluginHost;
}();

exports.default = ReporterPluginHost;
module.exports = exports['default'];