'use strict';

exports.__esModule = true;
exports.ClientFunctionAPIError = exports.APIError = exports.TestCompilationError = exports.GeneralError = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _callsiteRecord = require('callsite-record');

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _createStackFilter = require('../create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

var _getCallsite = require('../get-callsite');

var _renderTemplate = require('../../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Errors
var GeneralError = exports.GeneralError = function (_Error) {
    (0, _inherits3.default)(GeneralError, _Error);

    function GeneralError() {
        (0, _classCallCheck3.default)(this, GeneralError);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Error.call(this, _renderTemplate2.default.apply(null, arguments)));

        Error.captureStackTrace(_this, GeneralError);

        // HACK: workaround for the `instanceof` problem
        // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
        _this.constructor = GeneralError;
        return _this;
    }

    return GeneralError;
}(Error);

var TestCompilationError = exports.TestCompilationError = function (_Error2) {
    (0, _inherits3.default)(TestCompilationError, _Error2);

    function TestCompilationError(originalError) {
        (0, _classCallCheck3.default)(this, TestCompilationError);

        // NOTE: stack includes message as well.
        var _this2 = (0, _possibleConstructorReturn3.default)(this, _Error2.call(this, (0, _renderTemplate2.default)(_message2.default.cannotPrepareTestsDueToError, originalError.toString())));

        _this2.stack = (0, _renderTemplate2.default)(_message2.default.cannotPrepareTestsDueToError, originalError.stack);
        _this2.constructor = TestCompilationError;
        return _this2;
    }

    return TestCompilationError;
}(Error);

var APIError = exports.APIError = function (_Error3) {
    (0, _inherits3.default)(APIError, _Error3);

    function APIError(methodName, template) {
        (0, _classCallCheck3.default)(this, APIError);

        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
        }

        var rawMessage = _renderTemplate2.default.apply(undefined, [template].concat(args));

        // NOTE: `rawMessage` is used in error substitution if it occurs in test run.
        var _this3 = (0, _possibleConstructorReturn3.default)(this, _Error3.call(this, (0, _renderTemplate2.default)(_message2.default.cannotPrepareTestsDueToError, rawMessage)));

        _this3.rawMessage = rawMessage;
        _this3.callsite = (0, _getCallsite.getCallsiteForMethod)(methodName);
        _this3.constructor = APIError;

        // HACK: prototype properties don't work with built-in subclasses
        // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
        Object.defineProperty(_this3, 'stack', {
            get: function get() {
                return APIError._createStack(_this3.message, _this3.callsite, _callsiteRecord.renderers.noColor);
            }
        });

        Object.defineProperty(_this3, 'coloredStack', {
            get: function get() {
                return APIError._createStack(_this3.message, _this3.callsite, _callsiteRecord.renderers.default);
            }
        });
        return _this3;
    }

    APIError._createStack = function _createStack(message, callsiteRecord, renderer) {
        return message + '\n\n' + callsiteRecord.renderSync({
            renderer: renderer,
            stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit)
        });
    };

    return APIError;
}(Error);

var ClientFunctionAPIError = exports.ClientFunctionAPIError = function (_APIError) {
    (0, _inherits3.default)(ClientFunctionAPIError, _APIError);

    function ClientFunctionAPIError(methodName, instantiationCallsiteName, template) {
        (0, _classCallCheck3.default)(this, ClientFunctionAPIError);

        template = template.replace(/\{#instantiationCallsiteName\}/g, instantiationCallsiteName);

        for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
            args[_key2 - 3] = arguments[_key2];
        }

        return (0, _possibleConstructorReturn3.default)(this, _APIError.call.apply(_APIError, [this, methodName, template].concat(args)));
    }

    return ClientFunctionAPIError;
}(APIError);