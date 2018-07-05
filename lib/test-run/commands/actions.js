'use strict';

exports.__esModule = true;
exports.UseRoleCommand = exports.SetPageLoadTimeoutCommand = exports.SetTestSpeedCommand = exports.GetBrowserConsoleMessagesCommand = exports.GetNativeDialogHistoryCommand = exports.SetNativeDialogHandlerCommand = exports.SwitchToMainWindowCommand = exports.SwitchToIframeCommand = exports.ClearUploadCommand = exports.SetFilesToUploadCommand = exports.NavigateToCommand = exports.PressKeyCommand = exports.SelectTextAreaContentCommand = exports.SelectEditableContentCommand = exports.SelectTextCommand = exports.DragToElementCommand = exports.DragCommand = exports.TypeTextCommand = exports.HoverCommand = exports.DoubleClickCommand = exports.RightClickCommand = exports.ClickCommand = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _selectorBuilder = require('../../client-functions/selectors/selector-builder');

var _selectorBuilder2 = _interopRequireDefault(_selectorBuilder);

var _clientFunctionBuilder = require('../../client-functions/client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _builderSymbol = require('../../client-functions/builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _assignable = require('../../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

var _options = require('./options');

var _initializers = require('./validations/initializers');

var _argument = require('./validations/argument');

var _testRun = require('../../errors/test-run');

var _observation = require('./observation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Initializers
function initActionOptions(name, val) {
    return new _options.ActionOptions(val, true);
}

function initClickOptions(name, val) {
    return new _options.ClickOptions(val, true);
}

function initMouseOptions(name, val) {
    return new _options.MouseOptions(val, true);
}

function initTypeOptions(name, val) {
    return new _options.TypeOptions(val, true);
}

function initDragToElementOptions(name, val) {
    return new _options.DragToElementOptions(val, true);
}

function initDialogHandler(name, val) {
    var fn = val.fn;

    if (fn === null || fn instanceof _observation.ExecuteClientFunctionCommand) return fn;

    var options = val.options;
    var methodName = 'setNativeDialogHandler';
    var builder = fn && fn[_builderSymbol2.default];
    var isSelector = builder instanceof _selectorBuilder2.default;
    var functionType = typeof fn === 'undefined' ? 'undefined' : (0, _typeof3.default)(fn);

    if (functionType !== 'function' || isSelector) throw new _testRun.SetNativeDialogHandlerCodeWrongTypeError(isSelector ? 'Selector' : functionType);

    builder = builder instanceof _clientFunctionBuilder2.default ? fn.with(options)[_builderSymbol2.default] : new _clientFunctionBuilder2.default(fn, options, { instantiation: methodName, execution: methodName });

    return builder.getCommand([]);
}

// Commands

var ClickCommand = exports.ClickCommand = function (_Assignable) {
    (0, _inherits3.default)(ClickCommand, _Assignable);

    function ClickCommand(obj) {
        (0, _classCallCheck3.default)(this, ClickCommand);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this, obj));

        _this.type = _type2.default.click;
        _this.selector = null;
        _this.options = null;

        _this._assignFrom(obj, true);
        return _this;
    }

    ClickCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'options', type: _argument.actionOptions, init: initClickOptions, required: true }];
    };

    return ClickCommand;
}(_assignable2.default);

var RightClickCommand = exports.RightClickCommand = function (_Assignable2) {
    (0, _inherits3.default)(RightClickCommand, _Assignable2);

    function RightClickCommand(obj) {
        (0, _classCallCheck3.default)(this, RightClickCommand);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _Assignable2.call(this, obj));

        _this2.type = _type2.default.rightClick;
        _this2.selector = null;
        _this2.options = null;

        _this2._assignFrom(obj, true);
        return _this2;
    }

    RightClickCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'options', type: _argument.actionOptions, init: initClickOptions, required: true }];
    };

    return RightClickCommand;
}(_assignable2.default);

var DoubleClickCommand = exports.DoubleClickCommand = function (_Assignable3) {
    (0, _inherits3.default)(DoubleClickCommand, _Assignable3);

    function DoubleClickCommand(obj) {
        (0, _classCallCheck3.default)(this, DoubleClickCommand);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, _Assignable3.call(this, obj));

        _this3.type = _type2.default.doubleClick;
        _this3.selector = null;
        _this3.options = null;

        _this3._assignFrom(obj, true);
        return _this3;
    }

    DoubleClickCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'options', type: _argument.actionOptions, init: initClickOptions, required: true }];
    };

    return DoubleClickCommand;
}(_assignable2.default);

var HoverCommand = exports.HoverCommand = function (_Assignable4) {
    (0, _inherits3.default)(HoverCommand, _Assignable4);

    function HoverCommand(obj) {
        (0, _classCallCheck3.default)(this, HoverCommand);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, _Assignable4.call(this, obj));

        _this4.type = _type2.default.hover;
        _this4.selector = null;
        _this4.options = null;

        _this4._assignFrom(obj, true);
        return _this4;
    }

    HoverCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'options', type: _argument.actionOptions, init: initMouseOptions, required: true }];
    };

    return HoverCommand;
}(_assignable2.default);

var TypeTextCommand = exports.TypeTextCommand = function (_Assignable5) {
    (0, _inherits3.default)(TypeTextCommand, _Assignable5);

    function TypeTextCommand(obj) {
        (0, _classCallCheck3.default)(this, TypeTextCommand);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, _Assignable5.call(this, obj));

        _this5.type = _type2.default.typeText;
        _this5.selector = null;
        _this5.text = null;
        _this5.options = null;

        _this5._assignFrom(obj, true);
        return _this5;
    }

    TypeTextCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'text', type: _argument.nonEmptyStringArgument, required: true }, { name: 'options', type: _argument.actionOptions, init: initTypeOptions, required: true }];
    };

    return TypeTextCommand;
}(_assignable2.default);

var DragCommand = exports.DragCommand = function (_Assignable6) {
    (0, _inherits3.default)(DragCommand, _Assignable6);

    function DragCommand(obj) {
        (0, _classCallCheck3.default)(this, DragCommand);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, _Assignable6.call(this, obj));

        _this6.type = _type2.default.drag;
        _this6.selector = null;
        _this6.dragOffsetX = null;
        _this6.dragOffsetY = null;
        _this6.options = null;

        _this6._assignFrom(obj, true);
        return _this6;
    }

    DragCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'dragOffsetX', type: _argument.integerArgument, required: true }, { name: 'dragOffsetY', type: _argument.integerArgument, required: true }, { name: 'options', type: _argument.actionOptions, init: initMouseOptions, required: true }];
    };

    return DragCommand;
}(_assignable2.default);

var DragToElementCommand = exports.DragToElementCommand = function (_Assignable7) {
    (0, _inherits3.default)(DragToElementCommand, _Assignable7);

    function DragToElementCommand(obj) {
        (0, _classCallCheck3.default)(this, DragToElementCommand);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, _Assignable7.call(this, obj));

        _this7.type = _type2.default.dragToElement;

        _this7.selector = null;
        _this7.destinationSelector = null;
        _this7.options = null;

        _this7._assignFrom(obj, true);
        return _this7;
    }

    DragToElementCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'destinationSelector', init: _initializers.initSelector, required: true }, { name: 'options', type: _argument.actionOptions, init: initDragToElementOptions, required: true }];
    };

    return DragToElementCommand;
}(_assignable2.default);

var SelectTextCommand = exports.SelectTextCommand = function (_Assignable8) {
    (0, _inherits3.default)(SelectTextCommand, _Assignable8);

    function SelectTextCommand(obj) {
        (0, _classCallCheck3.default)(this, SelectTextCommand);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, _Assignable8.call(this, obj));

        _this8.type = _type2.default.selectText;
        _this8.selector = null;
        _this8.startPos = null;
        _this8.endPos = null;
        _this8.options = null;

        _this8._assignFrom(obj, true);
        return _this8;
    }

    SelectTextCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'startPos', type: _argument.positiveIntegerArgument }, { name: 'endPos', type: _argument.positiveIntegerArgument }, { name: 'options', type: _argument.actionOptions, init: initActionOptions, required: true }];
    };

    return SelectTextCommand;
}(_assignable2.default);

var SelectEditableContentCommand = exports.SelectEditableContentCommand = function (_Assignable9) {
    (0, _inherits3.default)(SelectEditableContentCommand, _Assignable9);

    function SelectEditableContentCommand(obj) {
        (0, _classCallCheck3.default)(this, SelectEditableContentCommand);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, _Assignable9.call(this, obj));

        _this9.type = _type2.default.selectEditableContent;
        _this9.startSelector = null;
        _this9.endSelector = null;
        _this9.options = null;

        _this9._assignFrom(obj, true);
        return _this9;
    }

    SelectEditableContentCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'startSelector', init: _initializers.initSelector, required: true }, { name: 'endSelector', init: _initializers.initSelector }, { name: 'options', type: _argument.actionOptions, init: initActionOptions, required: true }];
    };

    return SelectEditableContentCommand;
}(_assignable2.default);

var SelectTextAreaContentCommand = exports.SelectTextAreaContentCommand = function (_Assignable10) {
    (0, _inherits3.default)(SelectTextAreaContentCommand, _Assignable10);

    function SelectTextAreaContentCommand(obj) {
        (0, _classCallCheck3.default)(this, SelectTextAreaContentCommand);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, _Assignable10.call(this, obj));

        _this10.type = _type2.default.selectTextAreaContent;
        _this10.selector = null;
        _this10.startLine = null;
        _this10.startPos = null;
        _this10.endLine = null;
        _this10.endPos = null;
        _this10.options = null;

        _this10._assignFrom(obj, true);
        return _this10;
    }

    SelectTextAreaContentCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }, { name: 'startLine', type: _argument.positiveIntegerArgument }, { name: 'startPos', type: _argument.positiveIntegerArgument }, { name: 'endLine', type: _argument.positiveIntegerArgument }, { name: 'endPos', type: _argument.positiveIntegerArgument }, { name: 'options', type: _argument.actionOptions, init: initActionOptions, required: true }];
    };

    return SelectTextAreaContentCommand;
}(_assignable2.default);

var PressKeyCommand = exports.PressKeyCommand = function (_Assignable11) {
    (0, _inherits3.default)(PressKeyCommand, _Assignable11);

    function PressKeyCommand(obj) {
        (0, _classCallCheck3.default)(this, PressKeyCommand);

        var _this11 = (0, _possibleConstructorReturn3.default)(this, _Assignable11.call(this, obj));

        _this11.type = _type2.default.pressKey;
        _this11.keys = '';
        _this11.options = null;

        _this11._assignFrom(obj, true);
        return _this11;
    }

    PressKeyCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'keys', type: _argument.nonEmptyStringArgument, required: true }, { name: 'options', type: _argument.actionOptions, init: initActionOptions, required: true }];
    };

    return PressKeyCommand;
}(_assignable2.default);

var NavigateToCommand = exports.NavigateToCommand = function (_Assignable12) {
    (0, _inherits3.default)(NavigateToCommand, _Assignable12);

    function NavigateToCommand(obj) {
        (0, _classCallCheck3.default)(this, NavigateToCommand);

        var _this12 = (0, _possibleConstructorReturn3.default)(this, _Assignable12.call(this, obj));

        _this12.type = _type2.default.navigateTo;
        _this12.url = null;
        _this12.stateSnapshot = null;

        _this12._assignFrom(obj, true);
        return _this12;
    }

    NavigateToCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'url', type: _argument.urlArgument, required: true }, { name: 'stateSnapshot', type: _argument.nullableStringArgument }];
    };

    return NavigateToCommand;
}(_assignable2.default);

var SetFilesToUploadCommand = exports.SetFilesToUploadCommand = function (_Assignable13) {
    (0, _inherits3.default)(SetFilesToUploadCommand, _Assignable13);

    function SetFilesToUploadCommand(obj) {
        (0, _classCallCheck3.default)(this, SetFilesToUploadCommand);

        var _this13 = (0, _possibleConstructorReturn3.default)(this, _Assignable13.call(this, obj));

        _this13.type = _type2.default.setFilesToUpload;

        _this13.selector = null;
        _this13.filePath = '';

        _this13._assignFrom(obj, true);
        return _this13;
    }

    SetFilesToUploadCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: function init(name, val) {
                return (0, _initializers.initSelector)(name, val, true);
            }, required: true }, { name: 'filePath', type: _argument.stringOrStringArrayArgument, required: true }];
    };

    return SetFilesToUploadCommand;
}(_assignable2.default);

var ClearUploadCommand = exports.ClearUploadCommand = function (_Assignable14) {
    (0, _inherits3.default)(ClearUploadCommand, _Assignable14);

    function ClearUploadCommand(obj) {
        (0, _classCallCheck3.default)(this, ClearUploadCommand);

        var _this14 = (0, _possibleConstructorReturn3.default)(this, _Assignable14.call(this, obj));

        _this14.type = _type2.default.clearUpload;

        _this14.selector = null;

        _this14._assignFrom(obj, true);
        return _this14;
    }

    ClearUploadCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: function init(name, val) {
                return (0, _initializers.initSelector)(name, val, true);
            }, required: true }];
    };

    return ClearUploadCommand;
}(_assignable2.default);

var SwitchToIframeCommand = exports.SwitchToIframeCommand = function (_Assignable15) {
    (0, _inherits3.default)(SwitchToIframeCommand, _Assignable15);

    function SwitchToIframeCommand(obj) {
        (0, _classCallCheck3.default)(this, SwitchToIframeCommand);

        var _this15 = (0, _possibleConstructorReturn3.default)(this, _Assignable15.call(this, obj));

        _this15.type = _type2.default.switchToIframe;
        _this15.selector = null;
        _this15._assignFrom(obj, true);
        return _this15;
    }

    SwitchToIframeCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'selector', init: _initializers.initSelector, required: true }];
    };

    return SwitchToIframeCommand;
}(_assignable2.default);

var SwitchToMainWindowCommand = exports.SwitchToMainWindowCommand = function SwitchToMainWindowCommand() {
    (0, _classCallCheck3.default)(this, SwitchToMainWindowCommand);

    this.type = _type2.default.switchToMainWindow;
};

var SetNativeDialogHandlerCommand = exports.SetNativeDialogHandlerCommand = function (_Assignable16) {
    (0, _inherits3.default)(SetNativeDialogHandlerCommand, _Assignable16);

    function SetNativeDialogHandlerCommand(obj) {
        (0, _classCallCheck3.default)(this, SetNativeDialogHandlerCommand);

        var _this16 = (0, _possibleConstructorReturn3.default)(this, _Assignable16.call(this, obj));

        _this16.type = _type2.default.setNativeDialogHandler;
        _this16.dialogHandler = {};

        _this16._assignFrom(obj, true);
        return _this16;
    }

    SetNativeDialogHandlerCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'dialogHandler', init: initDialogHandler, required: true }];
    };

    return SetNativeDialogHandlerCommand;
}(_assignable2.default);

var GetNativeDialogHistoryCommand = exports.GetNativeDialogHistoryCommand = function GetNativeDialogHistoryCommand() {
    (0, _classCallCheck3.default)(this, GetNativeDialogHistoryCommand);

    this.type = _type2.default.getNativeDialogHistory;
};

var GetBrowserConsoleMessagesCommand = exports.GetBrowserConsoleMessagesCommand = function GetBrowserConsoleMessagesCommand() {
    (0, _classCallCheck3.default)(this, GetBrowserConsoleMessagesCommand);

    this.type = _type2.default.getBrowserConsoleMessages;
};

var SetTestSpeedCommand = exports.SetTestSpeedCommand = function (_Assignable17) {
    (0, _inherits3.default)(SetTestSpeedCommand, _Assignable17);

    function SetTestSpeedCommand(obj) {
        (0, _classCallCheck3.default)(this, SetTestSpeedCommand);

        var _this17 = (0, _possibleConstructorReturn3.default)(this, _Assignable17.call(this, obj));

        _this17.type = _type2.default.setTestSpeed;
        _this17.speed = null;

        _this17._assignFrom(obj, true);
        return _this17;
    }

    SetTestSpeedCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'speed', type: _argument.setSpeedArgument, required: true }];
    };

    return SetTestSpeedCommand;
}(_assignable2.default);

var SetPageLoadTimeoutCommand = exports.SetPageLoadTimeoutCommand = function (_Assignable18) {
    (0, _inherits3.default)(SetPageLoadTimeoutCommand, _Assignable18);

    function SetPageLoadTimeoutCommand(obj) {
        (0, _classCallCheck3.default)(this, SetPageLoadTimeoutCommand);

        var _this18 = (0, _possibleConstructorReturn3.default)(this, _Assignable18.call(this, obj));

        _this18.type = _type2.default.setPageLoadTimeout;
        _this18.duration = null;

        _this18._assignFrom(obj, true);
        return _this18;
    }

    SetPageLoadTimeoutCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'duration', type: _argument.positiveIntegerArgument, required: true }];
    };

    return SetPageLoadTimeoutCommand;
}(_assignable2.default);

var UseRoleCommand = exports.UseRoleCommand = function (_Assignable19) {
    (0, _inherits3.default)(UseRoleCommand, _Assignable19);

    function UseRoleCommand(obj) {
        (0, _classCallCheck3.default)(this, UseRoleCommand);

        var _this19 = (0, _possibleConstructorReturn3.default)(this, _Assignable19.call(this, obj));

        _this19.type = _type2.default.useRole;
        _this19.role = null;

        _this19._assignFrom(obj, true);
        return _this19;
    }

    UseRoleCommand.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'role', type: _argument.actionRoleArgument, required: true }];
    };

    return UseRoleCommand;
}(_assignable2.default);