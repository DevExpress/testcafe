'use strict';

exports.__esModule = true;
exports.DebugCommand = exports.ExecuteSelectorCommand = exports.ExecuteClientFunctionCommand = exports.WaitCommand = undefined;

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

var _argument = require('./validations/argument');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Commands
var WaitCommand = exports.WaitCommand = function (_Assignable) {
    (0, _inherits3.default)(WaitCommand, _Assignable);

    function WaitCommand(obj) {
        (0, _classCallCheck3.default)(this, WaitCommand);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this, obj));

        _this.type = _type2.default.wait;
        _this.timeout = null;
        _this._assignFrom(obj, true);
        return _this;
    }

    WaitCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'timeout', type: _argument.positiveIntegerArgument, required: true }];
    };

    return WaitCommand;
}(_assignable2.default);

var ExecuteClientFunctionCommandBase = function (_Assignable2) {
    (0, _inherits3.default)(ExecuteClientFunctionCommandBase, _Assignable2);

    function ExecuteClientFunctionCommandBase(type, obj) {
        (0, _classCallCheck3.default)(this, ExecuteClientFunctionCommandBase);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _Assignable2.call(this));

        _this2.type = type;

        _this2.instantiationCallsiteName = '';
        _this2.fnCode = '';
        _this2.args = [];
        _this2.dependencies = [];

        _this2._assignFrom(obj, false);
        return _this2;
    }

    ExecuteClientFunctionCommandBase.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'instantiationCallsiteName' }, { name: 'fnCode' }, { name: 'args' }, { name: 'dependencies' }];
    };

    return ExecuteClientFunctionCommandBase;
}(_assignable2.default);

var ExecuteClientFunctionCommand = exports.ExecuteClientFunctionCommand = function (_ExecuteClientFunctio) {
    (0, _inherits3.default)(ExecuteClientFunctionCommand, _ExecuteClientFunctio);

    function ExecuteClientFunctionCommand(obj) {
        (0, _classCallCheck3.default)(this, ExecuteClientFunctionCommand);
        return (0, _possibleConstructorReturn3.default)(this, _ExecuteClientFunctio.call(this, _type2.default.executeClientFunction, obj));
    }

    return ExecuteClientFunctionCommand;
}(ExecuteClientFunctionCommandBase);

var ExecuteSelectorCommand = exports.ExecuteSelectorCommand = function (_ExecuteClientFunctio2) {
    (0, _inherits3.default)(ExecuteSelectorCommand, _ExecuteClientFunctio2);

    function ExecuteSelectorCommand(obj) {
        (0, _classCallCheck3.default)(this, ExecuteSelectorCommand);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, _ExecuteClientFunctio2.call(this, _type2.default.executeSelector));

        _this4.visibilityCheck = false;
        _this4.timeout = null;
        _this4.index = 0;

        _this4._assignFrom(obj, false);
        return _this4;
    }

    ExecuteSelectorCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _ExecuteClientFunctio2.prototype._getAssignableProperties.call(this).concat([{ name: 'visibilityCheck' }, { name: 'timeout' }, { name: 'index' }]);
    };

    return ExecuteSelectorCommand;
}(ExecuteClientFunctionCommandBase);

var DebugCommand = exports.DebugCommand = function DebugCommand() {
    (0, _classCallCheck3.default)(this, DebugCommand);

    this.type = _type2.default.debug;
};