'use strict';

exports.__esModule = true;
exports.MaximizeWindowCommand = exports.ResizeWindowToFitDeviceCommand = exports.ResizeWindowCommand = exports.TakeScreenshotOnFailCommand = exports.TakeElementScreenshotCommand = exports.TakeScreenshotCommand = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _initializers = require('./validations/initializers');

var _argument = require('./validations/argument');

var _generateMark = require('../../screenshots/generate-mark');

var _generateMark2 = _interopRequireDefault(_generateMark);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initResizeToFitDeviceOptions(name, val) {
    return new _options.ResizeToFitDeviceOptions(val, true);
}

function initElementScreenshotOptions(name, val) {
    return new _options.ElementScreenshotOptions(val, true);
}

// Commands

var TakeScreenshotBaseCommand = function (_Assignable) {
    (0, _inherits3.default)(TakeScreenshotBaseCommand, _Assignable);

    function TakeScreenshotBaseCommand(obj) {
        (0, _classCallCheck3.default)(this, TakeScreenshotBaseCommand);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this, obj));

        _this.markSeed = null;
        _this.markData = '';

        _this._assignFrom(obj, true);
        return _this;
    }

    TakeScreenshotBaseCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [];
    };

    TakeScreenshotBaseCommand.prototype.generateScreenshotMark = function generateScreenshotMark() {
        (0, _assign2.default)(this, (0, _generateMark2.default)());
    };

    return TakeScreenshotBaseCommand;
}(_assignable2.default);

var TakeScreenshotCommand = exports.TakeScreenshotCommand = function (_TakeScreenshotBaseCo) {
    (0, _inherits3.default)(TakeScreenshotCommand, _TakeScreenshotBaseCo);

    function TakeScreenshotCommand(obj) {
        (0, _classCallCheck3.default)(this, TakeScreenshotCommand);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _TakeScreenshotBaseCo.call(this, obj));

        _this2.type = _type2.default.takeScreenshot;
        _this2.path = '';

        _this2._assignFrom(obj, true);
        return _this2;
    }

    TakeScreenshotCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _TakeScreenshotBaseCo.prototype._getAssignableProperties.call(this).concat([{ name: 'path', type: _argument.nonEmptyStringArgument }]);
    };

    return TakeScreenshotCommand;
}(TakeScreenshotBaseCommand);

var TakeElementScreenshotCommand = exports.TakeElementScreenshotCommand = function (_TakeScreenshotComman) {
    (0, _inherits3.default)(TakeElementScreenshotCommand, _TakeScreenshotComman);

    function TakeElementScreenshotCommand(obj) {
        (0, _classCallCheck3.default)(this, TakeElementScreenshotCommand);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, _TakeScreenshotComman.call(this, obj));

        _this3.type = _type2.default.takeElementScreenshot;
        _this3.selector = null;
        _this3.options = null;

        _this3._assignFrom(obj, true);
        return _this3;
    }

    TakeElementScreenshotCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _TakeScreenshotComman.prototype._getAssignableProperties.call(this).concat([{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'options', init: initElementScreenshotOptions, required: true }]);
    };

    return TakeElementScreenshotCommand;
}(TakeScreenshotCommand);

var TakeScreenshotOnFailCommand = exports.TakeScreenshotOnFailCommand = function (_TakeScreenshotBaseCo2) {
    (0, _inherits3.default)(TakeScreenshotOnFailCommand, _TakeScreenshotBaseCo2);

    function TakeScreenshotOnFailCommand() {
        (0, _classCallCheck3.default)(this, TakeScreenshotOnFailCommand);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, _TakeScreenshotBaseCo2.call(this));

        _this4.type = _type2.default.takeScreenshotOnFail;
        return _this4;
    }

    return TakeScreenshotOnFailCommand;
}(TakeScreenshotBaseCommand);

var ResizeWindowCommand = exports.ResizeWindowCommand = function (_Assignable2) {
    (0, _inherits3.default)(ResizeWindowCommand, _Assignable2);

    function ResizeWindowCommand(obj) {
        (0, _classCallCheck3.default)(this, ResizeWindowCommand);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, _Assignable2.call(this, obj));

        _this5.type = _type2.default.resizeWindow;
        _this5.width = 0;
        _this5.height = 0;

        _this5._assignFrom(obj, true);
        return _this5;
    }

    ResizeWindowCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'width', type: _argument.positiveIntegerArgument, required: true }, { name: 'height', type: _argument.positiveIntegerArgument, required: true }];
    };

    return ResizeWindowCommand;
}(_assignable2.default);

var ResizeWindowToFitDeviceCommand = exports.ResizeWindowToFitDeviceCommand = function (_Assignable3) {
    (0, _inherits3.default)(ResizeWindowToFitDeviceCommand, _Assignable3);

    function ResizeWindowToFitDeviceCommand(obj) {
        (0, _classCallCheck3.default)(this, ResizeWindowToFitDeviceCommand);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, _Assignable3.call(this, obj));

        _this6.type = _type2.default.resizeWindowToFitDevice;
        _this6.device = null;
        _this6.options = null;

        _this6._assignFrom(obj, true);
        return _this6;
    }

    ResizeWindowToFitDeviceCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'device', type: _argument.resizeWindowDeviceArgument, required: true }, { name: 'options', type: _argument.actionOptions, init: initResizeToFitDeviceOptions, required: true }];
    };

    return ResizeWindowToFitDeviceCommand;
}(_assignable2.default);

var MaximizeWindowCommand = exports.MaximizeWindowCommand = function MaximizeWindowCommand() {
    (0, _classCallCheck3.default)(this, MaximizeWindowCommand);

    this.type = _type2.default.maximizeWindow;
};