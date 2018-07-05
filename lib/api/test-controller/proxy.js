'use strict';

exports.__esModule = true;

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _delegatedApi = require('../../utils/delegated-api');

var _testRunTracker = require('../test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _runtime = require('../../errors/runtime');

var _message = require('../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var testControllerProxy = (0, _create2.default)(null);

(0, _delegatedApi.delegateAPI)(testControllerProxy, _2.default.API_LIST, {
    getHandler: function getHandler(propName, accessor) {
        var testRun = _testRunTracker2.default.resolveContextTestRun();

        if (!testRun) {
            var callsiteName = null;

            if (accessor === 'getter') callsiteName = 'get';else if (accessor === 'setter') callsiteName = 'set';else callsiteName = propName;

            throw new _runtime.APIError(callsiteName, _message2.default.testControllerProxyCantResolveTestRun);
        }

        return testRun.controller;
    }
});

exports.default = testControllerProxy;
module.exports = exports['default'];