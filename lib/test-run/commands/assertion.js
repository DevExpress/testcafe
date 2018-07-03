'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _assignable = require('../../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

var _options = require('./options');

var _runtime = require('../../errors/runtime');

var _testRun = require('../../errors/test-run');

var _executeJsExpression = require('../execute-js-expression');

var _utils = require('./utils');

var _argument = require('./validations/argument');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Initializers
function initAssertionOptions(name, val) {
    return new _options.AssertionOptions(val, true);
}

//Initializers
function initAssertionParameter(name, val, skipVisibilityCheck) {
    try {
        if ((0, _utils.isJSExpression)(val)) val = (0, _executeJsExpression.executeJsExpression)(val.value, skipVisibilityCheck);

        return val;
    } catch (err) {
        var msg = err.constructor === _runtime.APIError ? err.rawMessage : err.message;

        throw new _testRun.AssertionExecutableArgumentError(name, val.value, msg);
    }
}

// Commands

var AssertionCommand = function (_Assignable) {
    (0, _inherits3.default)(AssertionCommand, _Assignable);

    function AssertionCommand(obj) {
        (0, _classCallCheck3.default)(this, AssertionCommand);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this, obj));

        _this.type = _type2.default.assertion;

        _this.assertionType = null;
        _this.actual = void 0;
        _this.expected = void 0;
        _this.expected2 = void 0;
        _this.message = null;
        _this.options = null;

        _this._assignFrom(obj, true);
        return _this;
    }

    AssertionCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'assertionType', type: _argument.nonEmptyStringArgument, required: true }, { name: 'actual', init: initAssertionParameter }, { name: 'expected', init: initAssertionParameter }, { name: 'expected2', init: initAssertionParameter }, { name: 'message', type: _argument.stringArgument }, { name: 'options', type: _argument.actionOptions, init: initAssertionOptions, required: true }];
    };

    return AssertionCommand;
}(_assignable2.default);

exports.default = AssertionCommand;
module.exports = exports['default'];