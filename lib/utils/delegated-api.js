'use strict';

exports.__esModule = true;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.getDelegatedAPIList = getDelegatedAPIList;
exports.delegateAPI = delegateAPI;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_IMPLEMENTATION_METHOD_RE = /^_(\S+)\$(getter|setter)?$/;

function getDelegatedAPIList(src) {
    return (0, _keys2.default)(src).map(function (prop) {
        var match = prop.match(API_IMPLEMENTATION_METHOD_RE);

        if (match) {
            return {
                srcProp: prop,
                apiProp: match[1],
                accessor: match[2]
            };
        }

        return null;
    }).filter(function (item) {
        return !!item;
    });
}

function delegateAPI(dest, apiList, opts) {
    apiList.forEach(function (_ref) {
        var srcProp = _ref.srcProp,
            apiProp = _ref.apiProp,
            accessor = _ref.accessor;

        var fn = function fn() {
            var _handler;

            if (opts.proxyMethod) opts.proxyMethod();

            var handler = null;

            if (opts.useCurrentCtxAsHandler) handler = this;else if (opts.getHandler) handler = opts.getHandler(apiProp, accessor);else handler = opts.handler;

            return (_handler = handler)[srcProp].apply(_handler, arguments);
        };

        if (accessor === 'getter') (0, _defineProperty2.default)(dest, apiProp, { get: fn, configurable: true });else if (accessor === 'setter') (0, _defineProperty2.default)(dest, apiProp, { set: fn, configurable: true });else dest[apiProp] = fn;
    });
}