'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _testcafeHammerhead = require('testcafe-hammerhead');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RequestHook = function () {
    function RequestHook(requestFilterRules, responseEventConfigureOpts) {
        (0, _classCallCheck3.default)(this, RequestHook);

        this.requestFilterRules = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this.responseEventConfigureOpts = responseEventConfigureOpts;
    }

    RequestHook.prototype._prepareRequestFilterRules = function _prepareRequestFilterRules(rules) {
        if (rules) return (0, _lodash.castArray)(rules);

        return [_testcafeHammerhead.RequestFilterRule.ANY];
    };

    RequestHook.prototype._instantiateRequestFilterRules = function _instantiateRequestFilterRules() {
        var _this = this;

        this.requestFilterRules.forEach(function (rule) {
            if (rule instanceof _testcafeHammerhead.RequestFilterRule) _this._instantiatedRequestFilterRules.push(rule);else _this._instantiatedRequestFilterRules.push(new _testcafeHammerhead.RequestFilterRule(rule));
        });
    };

    RequestHook.prototype.onRequest = function onRequest() /*RequestEvent event*/{
        throw new Error('Not implemented');
    };

    RequestHook.prototype._onConfigureResponse = function _onConfigureResponse(event) {
        if (!this.responseEventConfigureOpts) return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody = this.responseEventConfigureOpts.includeBody;
    };

    RequestHook.prototype.onResponse = function onResponse() /*ResponseEvent event*/{
        throw new Error('Not implemented');
    };

    return RequestHook;
}();

exports.default = RequestHook;
module.exports = exports['default'];