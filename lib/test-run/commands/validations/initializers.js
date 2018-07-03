'use strict';

exports.__esModule = true;
exports.initSelector = initSelector;

var _selectorBuilder = require('../../../client-functions/selectors/selector-builder');

var _selectorBuilder2 = _interopRequireDefault(_selectorBuilder);

var _testRun = require('../../../errors/test-run');

var _runtime = require('../../../errors/runtime');

var _observation = require('../observation');

var _executeJsExpression = require('../../execute-js-expression');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initSelector(name, val, skipVisibilityCheck) {
    if (val instanceof _observation.ExecuteSelectorCommand) return val;

    try {
        if ((0, _utils.isJSExpression)(val)) val = (0, _executeJsExpression.executeJsExpression)(val.value, skipVisibilityCheck);

        var builder = new _selectorBuilder2.default(val, { visibilityCheck: !skipVisibilityCheck }, { instantiation: 'Selector' });

        return builder.getCommand([]);
    } catch (err) {
        var msg = err.constructor === _runtime.APIError ? err.rawMessage : err.message;

        throw new _testRun.ActionSelectorError(name, msg);
    }
}