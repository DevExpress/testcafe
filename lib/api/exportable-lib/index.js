'use strict';

exports.__esModule = true;

var _clientFunctionBuilder = require('../../client-functions/client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _selectorBuilder = require('../../client-functions/selectors/selector-builder');

var _selectorBuilder2 = _interopRequireDefault(_selectorBuilder);

var _role = require('../../role');

var _proxy = require('../test-controller/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _requestLogger = require('../request-hooks/request-logger');

var _requestLogger2 = _interopRequireDefault(_requestLogger);

var _requestMock = require('../request-hooks/request-mock');

var _requestMock2 = _interopRequireDefault(_requestMock);

var _hook = require('../request-hooks/hook');

var _hook2 = _interopRequireDefault(_hook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Role(loginPage, initFn, options) {
    return (0, _role.createRole)(loginPage, initFn, options);
}

function RequestMock() {
    return (0, _requestMock2.default)();
}

function RequestLogger(requestFilterRuleInit, logOptions) {
    return (0, _requestLogger2.default)(requestFilterRuleInit, logOptions);
}

Role.anonymous = _role.createAnonymousRole;

exports.default = {
    Role: Role,

    ClientFunction: function ClientFunction(fn, options) {
        var builder = new _clientFunctionBuilder2.default(fn, options, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    },
    Selector: function Selector(fn, options) {
        var builder = new _selectorBuilder2.default(fn, options, { instantiation: 'Selector' });

        return builder.getFunction();
    },


    RequestLogger: RequestLogger,

    RequestMock: RequestMock,

    RequestHook: _hook2.default,

    t: _proxy2.default
};
module.exports = exports['default'];