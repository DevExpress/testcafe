'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

var _parse = require('parse5');

var _callsiteRecord = require('callsite-record');

var _templates = require('./templates');

var _templates2 = _interopRequireDefault(_templates);

var _createStackFilter = require('../create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parser = new _parse.Parser();

var TestRunErrorFormattableAdapter = function () {
    function TestRunErrorFormattableAdapter(err, metaInfo) {
        (0, _classCallCheck3.default)(this, TestRunErrorFormattableAdapter);

        this.TEMPLATES = _templates2.default;

        this.userAgent = metaInfo.userAgent;
        this.screenshotPath = metaInfo.screenshotPath;
        this.testRunPhase = metaInfo.testRunPhase;

        (0, _lodash.assignIn)(this, err);

        this.callsite = this.callsite || metaInfo.callsite;
    }

    TestRunErrorFormattableAdapter._getSelector = function _getSelector(node) {
        var classAttr = (0, _lodash.find)(node.attrs, { name: 'class' });
        var cls = classAttr && classAttr.value;

        return cls ? node.tagName + ' ' + cls : node.tagName;
    };

    TestRunErrorFormattableAdapter._decorateHtml = function _decorateHtml(node, decorator) {
        var msg = '';

        if (node.nodeName === '#text') msg = node.value;else {
            if (node.childNodes.length) {
                msg += node.childNodes.map(function (childNode) {
                    return TestRunErrorFormattableAdapter._decorateHtml(childNode, decorator);
                }).join('');
            }

            if (node.nodeName !== '#document-fragment') {
                var selector = TestRunErrorFormattableAdapter._getSelector(node);

                msg = decorator[selector](msg, node.attrs);
            }
        }

        return msg;
    };

    TestRunErrorFormattableAdapter.prototype.getErrorMarkup = function getErrorMarkup(viewportWidth) {
        return this.TEMPLATES[this.type](this, viewportWidth);
    };

    TestRunErrorFormattableAdapter.prototype.getCallsiteMarkup = function getCallsiteMarkup() {
        if (!this.callsite) return '';

        // NOTE: for raw API callsites
        if (typeof this.callsite === 'string') return this.callsite;

        try {
            return this.callsite.renderSync({
                renderer: _callsiteRecord.renderers.html,
                stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit)
            });
        } catch (err) {
            return '';
        }
    };

    TestRunErrorFormattableAdapter.prototype.formatMessage = function formatMessage(decorator, viewportWidth) {
        var msgHtml = this.getErrorMarkup(viewportWidth);
        var fragment = parser.parseFragment(msgHtml);

        return TestRunErrorFormattableAdapter._decorateHtml(fragment, decorator);
    };

    return TestRunErrorFormattableAdapter;
}();

exports.default = TestRunErrorFormattableAdapter;
module.exports = exports['default'];