'use strict';

exports.__esModule = true;
exports.default = assertRequestHookType;

var _typeAssertions = require('../../errors/runtime/type-assertions');

function assertRequestHookType(hooks) {
    hooks.forEach(function (hook) {
        return (0, _typeAssertions.assertType)(_typeAssertions.is.requestHookSubclass, 'requestHooks', 'Hook', hook);
    });
}
module.exports = exports['default'];