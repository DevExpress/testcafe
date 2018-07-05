'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = createRequestLogger;

var _testcafeHammerhead = require('testcafe-hammerhead');

var _hook = require('./hook');

var _hook2 = _interopRequireDefault(_hook);

var _useragent = require('useragent');

var _testRunTracker = require('../test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _reExecutablePromise = require('../../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _index = require('../../errors/test-run/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_OPTIONS = {
    logRequestHeaders: false,
    logRequestBody: false,
    stringifyRequestBody: false,
    logResponseHeaders: false,
    logResponseBody: false,
    stringifyResponseBody: false
};

var RequestLogger = function (_RequestHook) {
    (0, _inherits3.default)(RequestLogger, _RequestHook);

    function RequestLogger(requestFilterRuleInit, options) {
        (0, _classCallCheck3.default)(this, RequestLogger);

        options = (0, _assign2.default)({}, DEFAULT_OPTIONS, options);
        RequestLogger._assertLogOptions(options);

        var configureResponseEventOptions = new _testcafeHammerhead.ConfigureResponseEventOptions(options.logResponseHeaders, options.logResponseBody);

        var _this = (0, _possibleConstructorReturn3.default)(this, _RequestHook.call(this, requestFilterRuleInit, configureResponseEventOptions));

        _this.options = options;

        _this._internalRequests = {};
        return _this;
    }

    RequestLogger._assertLogOptions = function _assertLogOptions(logOptions) {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody) throw new _index.RequestHookConfigureAPIError(RequestLogger.name, 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');

        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody) throw new _index.RequestHookConfigureAPIError(RequestLogger.name, 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    };

    RequestLogger.prototype.onRequest = function onRequest(event) {
        var userAgent = (0, _useragent.parse)(event._requestInfo.userAgent).toString();

        var loggedReq = {
            id: event._requestInfo.requestId,
            testRunId: event._requestInfo.sessionId,
            userAgent: userAgent,
            request: {
                url: event._requestInfo.url,
                method: event._requestInfo.method
            }
        };

        if (this.options.logRequestHeaders) loggedReq.request.headers = (0, _assign2.default)({}, event._requestInfo.headers);

        if (this.options.logRequestBody) loggedReq.request.body = this.options.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;

        this._internalRequests[loggedReq.id] = loggedReq;
    };

    RequestLogger.prototype.onResponse = function onResponse(event) {
        var loggerReq = this._internalRequests[event.requestId];

        if (!loggerReq) throw new TypeError('Cannot find a recorded request with id=' + event.id + '. This is an internal TestCafe problem. Please contact the TestCafe team and provide an example to reproduce the problem.');

        loggerReq.response = {};
        loggerReq.response.statusCode = event.statusCode;

        if (this.options.logResponseHeaders) loggerReq.response.headers = (0, _assign2.default)({}, event.headers);

        if (this.options.logResponseBody) loggerReq.response.body = this.options.stringifyResponseBody ? event.body.toString() : event.body;
    };

    RequestLogger.prototype._prepareInternalRequestInfo = function _prepareInternalRequestInfo() {
        var testRun = _testRunTracker2.default.resolveContextTestRun();
        var preparedRequests = (0, _values2.default)(this._internalRequests);

        if (testRun) preparedRequests = preparedRequests.filter(function (r) {
            return r.testRunId === testRun.id;
        });

        return preparedRequests;
    };

    RequestLogger.prototype._getCompletedRequests = function _getCompletedRequests() {
        return this._prepareInternalRequestInfo().filter(function (r) {
            return r.response;
        });
    };

    // API


    RequestLogger.prototype.contains = function contains(predicate) {
        var _this2 = this;

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            return _context.abrupt('return', !!_this2._getCompletedRequests().find(predicate));

                        case 1:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this2);
        })));
    };

    RequestLogger.prototype.count = function count(predicate) {
        var _this3 = this;

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', _this3._getCompletedRequests().filter(predicate).length);

                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this3);
        })));
    };

    RequestLogger.prototype.clear = function clear() {
        var _this4 = this;

        var testRun = _testRunTracker2.default.resolveContextTestRun();

        if (testRun) {
            (0, _keys2.default)(this._internalRequests).forEach(function (id) {
                if (_this4._internalRequests[id].testRunId === testRun.id) delete _this4._internalRequests[id];
            });
        } else this._internalRequests = {};
    };

    (0, _createClass3.default)(RequestLogger, [{
        key: 'requests',
        get: function get() {
            return this._prepareInternalRequestInfo();
        }
    }]);
    return RequestLogger;
}(_hook2.default);

function createRequestLogger(requestFilterRuleInit, logOptions) {
    return new RequestLogger(requestFilterRuleInit, logOptions);
}
module.exports = exports['default'];