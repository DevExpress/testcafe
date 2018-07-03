'use strict';

exports.__esModule = true;

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = createRequestMock;

var _hook = require('./hook');

var _hook2 = _interopRequireDefault(_hook);

var _testcafeHammerhead = require('testcafe-hammerhead');

var _index = require('../../errors/test-run/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RequestMock = function (_RequestHook) {
    (0, _inherits3.default)(RequestMock, _RequestHook);

    function RequestMock() {
        (0, _classCallCheck3.default)(this, RequestMock);

        var _this = (0, _possibleConstructorReturn3.default)(this, _RequestHook.call(this, []));

        _this.pendingRequestFilterRuleInit = null;
        _this.mocks = new _map2.default();
        return _this;
    }

    RequestMock.prototype.onRequest = function onRequest(event) {
        var mock = this.mocks.get(event._requestFilterRule);

        event.setMock(mock);
    };

    RequestMock.prototype.onResponse = function onResponse() {};

    // API


    RequestMock.prototype.onRequestTo = function onRequestTo(requestFilterRuleInit) {
        if (this.pendingRequestFilterRuleInit) throw new _index.RequestHookConfigureAPIError(RequestMock.name, "The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.");

        this.pendingRequestFilterRuleInit = requestFilterRuleInit;

        return this;
    };

    RequestMock.prototype.respond = function respond(body, statusCode, headers) {
        if (!this.pendingRequestFilterRuleInit) throw new _index.RequestHookConfigureAPIError(RequestMock.name, "The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.");

        var mock = new _testcafeHammerhead.ResponseMock(body, statusCode, headers);
        var rule = new _testcafeHammerhead.RequestFilterRule(this.pendingRequestFilterRuleInit);

        this.requestFilterRules.push(rule);
        this.mocks.set(rule, mock);
        this.pendingRequestFilterRuleInit = null;

        return this;
    };

    return RequestMock;
}(_hook2.default);

function createRequestMock() {
    return new RequestMock();
}
module.exports = exports['default'];