'use strict';

exports.__esModule = true;
exports.AssertionOptions = exports.ResizeToFitDeviceOptions = exports.DragToElementOptions = exports.TypeOptions = exports.MoveOptions = exports.ClickOptions = exports.MouseOptions = exports.ElementScreenshotOptions = exports.ScrollOptions = exports.OffsetOptions = exports.ActionOptions = exports.speedOption = exports.booleanOption = exports.positiveIntegerOption = exports.integerOption = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assignable = require('../../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

var _factories = require('./validations/factories');

var _testRun = require('../../errors/test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var integerOption = exports.integerOption = (0, _factories.createIntegerValidator)(_testRun.ActionIntegerOptionError); // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

var positiveIntegerOption = exports.positiveIntegerOption = (0, _factories.createPositiveIntegerValidator)(_testRun.ActionPositiveIntegerOptionError);
var booleanOption = exports.booleanOption = (0, _factories.createBooleanValidator)(_testRun.ActionBooleanOptionError);
var speedOption = exports.speedOption = (0, _factories.createSpeedValidator)(_testRun.ActionSpeedOptionError);

// Acitons

var ActionOptions = exports.ActionOptions = function (_Assignable) {
    (0, _inherits3.default)(ActionOptions, _Assignable);

    function ActionOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, ActionOptions);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this));

        _this.speed = null;

        _this._assignFrom(obj, validate);
        return _this;
    }

    ActionOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'speed', type: speedOption }];
    };

    return ActionOptions;
}(_assignable2.default);

// Offset


var OffsetOptions = exports.OffsetOptions = function (_ActionOptions) {
    (0, _inherits3.default)(OffsetOptions, _ActionOptions);

    function OffsetOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, OffsetOptions);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _ActionOptions.call(this));

        _this2.offsetX = null;
        _this2.offsetY = null;

        _this2._assignFrom(obj, validate);
        return _this2;
    }

    OffsetOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _ActionOptions.prototype._getAssignableProperties.call(this).concat([{ name: 'offsetX', type: integerOption }, { name: 'offsetY', type: integerOption }]);
    };

    return OffsetOptions;
}(ActionOptions);

var ScrollOptions = exports.ScrollOptions = function (_OffsetOptions) {
    (0, _inherits3.default)(ScrollOptions, _OffsetOptions);

    function ScrollOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, ScrollOptions);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, _OffsetOptions.call(this));

        _this3.scrollToCenter = false;
        _this3.skipParentFrames = false;

        _this3._assignFrom(obj, validate);
        return _this3;
    }

    ScrollOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _OffsetOptions.prototype._getAssignableProperties.call(this).concat([{ name: 'scrollToCenter', type: booleanOption }, { name: 'skipParentFrames', type: booleanOption }]);
    };

    return ScrollOptions;
}(OffsetOptions);

// Element Screenshot


var ElementScreenshotOptions = exports.ElementScreenshotOptions = function (_ActionOptions2) {
    (0, _inherits3.default)(ElementScreenshotOptions, _ActionOptions2);

    function ElementScreenshotOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, ElementScreenshotOptions);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, _ActionOptions2.call(this));

        _this4.scrollTargetX = null;
        _this4.scrollTargetY = null;
        _this4.includeMargins = false;
        _this4.includeBorders = true;
        _this4.includePaddings = true;

        _this4.crop = {
            left: null,
            right: null,
            top: null,
            bottom: null
        };

        _this4._assignFrom(obj, validate);
        return _this4;
    }

    ElementScreenshotOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _ActionOptions2.prototype._getAssignableProperties.call(this).concat([{ name: 'scrollTargetX', type: integerOption }, { name: 'scrollTargetY', type: integerOption }, { name: 'crop.left', type: integerOption }, { name: 'crop.right', type: integerOption }, { name: 'crop.top', type: integerOption }, { name: 'crop.bottom', type: integerOption }, { name: 'includeMargins', type: booleanOption }, { name: 'includeBorders', type: booleanOption }, { name: 'includePaddings', type: booleanOption }]);
    };

    return ElementScreenshotOptions;
}(ActionOptions);

// Mouse


var MouseOptions = exports.MouseOptions = function (_OffsetOptions2) {
    (0, _inherits3.default)(MouseOptions, _OffsetOptions2);

    function MouseOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, MouseOptions);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, _OffsetOptions2.call(this));

        _this5.modifiers = {
            ctrl: false,
            alt: false,
            shift: false,
            meta: false
        };

        _this5._assignFrom(obj, validate);
        return _this5;
    }

    MouseOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _OffsetOptions2.prototype._getAssignableProperties.call(this).concat([{ name: 'modifiers.ctrl', type: booleanOption }, { name: 'modifiers.alt', type: booleanOption }, { name: 'modifiers.shift', type: booleanOption }, { name: 'modifiers.meta', type: booleanOption }]);
    };

    return MouseOptions;
}(OffsetOptions);

// Click


var ClickOptions = exports.ClickOptions = function (_MouseOptions) {
    (0, _inherits3.default)(ClickOptions, _MouseOptions);

    function ClickOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, ClickOptions);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, _MouseOptions.call(this));

        _this6.caretPos = null;

        _this6._assignFrom(obj, validate);
        return _this6;
    }

    ClickOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _MouseOptions.prototype._getAssignableProperties.call(this).concat([{ name: 'caretPos', type: positiveIntegerOption }]);
    };

    return ClickOptions;
}(MouseOptions);

// Move


var MoveOptions = exports.MoveOptions = function (_MouseOptions2) {
    (0, _inherits3.default)(MoveOptions, _MouseOptions2);

    function MoveOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, MoveOptions);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, _MouseOptions2.call(this));

        _this7.speed = null;
        _this7.minMovingTime = null;
        _this7.holdLeftButton = false;
        _this7.skipScrolling = false;

        _this7._assignFrom(obj, validate);
        return _this7;
    }

    MoveOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _MouseOptions2.prototype._getAssignableProperties.call(this).concat([{ name: 'speed' }, { name: 'minMovingTime' }, { name: 'holdLeftButton' }, { name: 'skipScrolling', type: booleanOption }]);
    };

    return MoveOptions;
}(MouseOptions);

// Type


var TypeOptions = exports.TypeOptions = function (_ClickOptions) {
    (0, _inherits3.default)(TypeOptions, _ClickOptions);

    function TypeOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, TypeOptions);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, _ClickOptions.call(this));

        _this8.replace = false;
        _this8.paste = false;

        _this8._assignFrom(obj, validate);
        return _this8;
    }

    TypeOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _ClickOptions.prototype._getAssignableProperties.call(this).concat([{ name: 'replace', type: booleanOption }, { name: 'paste', type: booleanOption }]);
    };

    return TypeOptions;
}(ClickOptions);

// DragToElement


var DragToElementOptions = exports.DragToElementOptions = function (_MouseOptions3) {
    (0, _inherits3.default)(DragToElementOptions, _MouseOptions3);

    function DragToElementOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, DragToElementOptions);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, _MouseOptions3.call(this, obj, validate));

        _this9.destinationOffsetX = null;
        _this9.destinationOffsetY = null;

        _this9._assignFrom(obj, validate);
        return _this9;
    }

    DragToElementOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return _MouseOptions3.prototype._getAssignableProperties.call(this).concat([{ name: 'destinationOffsetX', type: integerOption }, { name: 'destinationOffsetY', type: integerOption }]);
    };

    return DragToElementOptions;
}(MouseOptions);

//ResizeToFitDevice


var ResizeToFitDeviceOptions = exports.ResizeToFitDeviceOptions = function (_Assignable2) {
    (0, _inherits3.default)(ResizeToFitDeviceOptions, _Assignable2);

    function ResizeToFitDeviceOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, ResizeToFitDeviceOptions);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, _Assignable2.call(this));

        _this10.portraitOrientation = false;

        _this10._assignFrom(obj, validate);
        return _this10;
    }

    ResizeToFitDeviceOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'portraitOrientation', type: booleanOption }];
    };

    return ResizeToFitDeviceOptions;
}(_assignable2.default);

//Assertion


var AssertionOptions = exports.AssertionOptions = function (_Assignable3) {
    (0, _inherits3.default)(AssertionOptions, _Assignable3);

    function AssertionOptions(obj, validate) {
        (0, _classCallCheck3.default)(this, AssertionOptions);

        var _this11 = (0, _possibleConstructorReturn3.default)(this, _Assignable3.call(this));

        _this11.timeout = void 0;
        _this11.allowUnawaitedPromise = false;

        _this11._assignFrom(obj, validate);
        return _this11;
    }

    AssertionOptions.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'timeout', type: positiveIntegerOption }, { name: 'allowUnawaitedPromise', type: booleanOption }];
    };

    return AssertionOptions;
}(_assignable2.default);