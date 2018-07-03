'use strict';

exports.__esModule = true;
exports.RequestHookConfigureAPIError = exports.SetNativeDialogHandlerCodeWrongTypeError = exports.UncaughtErrorInNativeDialogHandler = exports.NativeDialogNotHandledError = exports.CurrentIframeIsInvisibleError = exports.CurrentIframeNotFoundError = exports.CurrentIframeIsNotLoadedError = exports.ActionIframeIsNotLoadedError = exports.ActionElementNotIframeError = exports.RoleSwitchInRoleInitializerError = exports.InvalidElementScreenshotDimensionsError = exports.WindowDimensionsOverflowError = exports.ActionInvalidScrollTargetError = exports.ActionElementIsNotFileInputError = exports.ActionCanNotFindFileToUploadError = exports.ActionIncorrectKeysError = exports.ActionRootContainerNotFoundError = exports.ActionElementNonContentEditableError = exports.ActionElementNotTextAreaError = exports.ActionElementNonEditableError = exports.ActionAdditionalSelectorMatchesWrongNodeTypeError = exports.ActionAdditionalElementIsInvisibleError = exports.ActionAdditionalElementNotFoundError = exports.ActionSelectorMatchesWrongNodeTypeError = exports.ActionElementIsInvisibleError = exports.ActionElementNotFoundError = exports.ActionSelectorError = exports.ActionUnsupportedDeviceTypeError = exports.SetTestSpeedArgumentError = exports.ActionStringArrayElementError = exports.ActionStringOrStringArrayArgumentError = exports.ActionPositiveIntegerArgumentError = exports.ActionRoleArgumentError = exports.ActionIntegerArgumentError = exports.ActionNullableStringArgumentError = exports.ActionStringArgumentError = exports.ActionOptionsTypeError = exports.ActionSpeedOptionError = exports.ActionBooleanOptionError = exports.ActionPositiveIntegerOptionError = exports.ActionIntegerOptionError = exports.AssertionUnawaitedPromiseError = exports.AssertionExecutableArgumentError = exports.ExternalAssertionLibraryError = exports.UncaughtErrorInCustomDOMPropertyCode = exports.UncaughtErrorInClientFunctionCode = exports.UncaughtNonErrorObjectInTestCode = exports.UncaughtErrorInTestCode = exports.UncaughtErrorOnPage = exports.PageLoadError = exports.CantObtainInfoForElementSpecifiedBySelectorError = exports.InvalidSelectorResultError = exports.DomNodeClientFunctionResultError = exports.ClientFunctionExecutionInterruptionError = exports.MissingAwaitError = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Base
//--------------------------------------------------------------------
var TestRunErrorBase = function TestRunErrorBase(type) {
    (0, _classCallCheck3.default)(this, TestRunErrorBase);

    this.type = type;
    this.isTestCafeError = true;
    this.callsite = null;
}; // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------


var ActionOptionErrorBase = function (_TestRunErrorBase) {
    (0, _inherits3.default)(ActionOptionErrorBase, _TestRunErrorBase);

    function ActionOptionErrorBase(type, optionName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionOptionErrorBase);

        var _this = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase.call(this, type));

        _this.optionName = optionName;
        _this.actualValue = actualValue;
        return _this;
    }

    return ActionOptionErrorBase;
}(TestRunErrorBase);

var ActionArgumentErrorBase = function (_TestRunErrorBase2) {
    (0, _inherits3.default)(ActionArgumentErrorBase, _TestRunErrorBase2);

    function ActionArgumentErrorBase(type, argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionArgumentErrorBase);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase2.call(this, type));

        _this2.argumentName = argumentName;
        _this2.actualValue = actualValue;
        return _this2;
    }

    return ActionArgumentErrorBase;
}(TestRunErrorBase);

// Synchronization errors
//--------------------------------------------------------------------


var MissingAwaitError = exports.MissingAwaitError = function (_TestRunErrorBase3) {
    (0, _inherits3.default)(MissingAwaitError, _TestRunErrorBase3);

    function MissingAwaitError(callsite) {
        (0, _classCallCheck3.default)(this, MissingAwaitError);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase3.call(this, _type2.default.missingAwaitError));

        _this3.callsite = callsite;
        return _this3;
    }

    return MissingAwaitError;
}(TestRunErrorBase);

// Client function errors
//--------------------------------------------------------------------


var ClientFunctionExecutionInterruptionError = exports.ClientFunctionExecutionInterruptionError = function (_TestRunErrorBase4) {
    (0, _inherits3.default)(ClientFunctionExecutionInterruptionError, _TestRunErrorBase4);

    function ClientFunctionExecutionInterruptionError(instantiationCallsiteName) {
        (0, _classCallCheck3.default)(this, ClientFunctionExecutionInterruptionError);

        var _this4 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase4.call(this, _type2.default.clientFunctionExecutionInterruptionError));

        _this4.instantiationCallsiteName = instantiationCallsiteName;
        return _this4;
    }

    return ClientFunctionExecutionInterruptionError;
}(TestRunErrorBase);

var DomNodeClientFunctionResultError = exports.DomNodeClientFunctionResultError = function (_TestRunErrorBase5) {
    (0, _inherits3.default)(DomNodeClientFunctionResultError, _TestRunErrorBase5);

    function DomNodeClientFunctionResultError(instantiationCallsiteName) {
        (0, _classCallCheck3.default)(this, DomNodeClientFunctionResultError);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase5.call(this, _type2.default.domNodeClientFunctionResultError));

        _this5.instantiationCallsiteName = instantiationCallsiteName;
        return _this5;
    }

    return DomNodeClientFunctionResultError;
}(TestRunErrorBase);

// Selector errors
//--------------------------------------------------------------------


var InvalidSelectorResultError = exports.InvalidSelectorResultError = function (_TestRunErrorBase6) {
    (0, _inherits3.default)(InvalidSelectorResultError, _TestRunErrorBase6);

    function InvalidSelectorResultError() {
        (0, _classCallCheck3.default)(this, InvalidSelectorResultError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase6.call(this, _type2.default.invalidSelectorResultError));
    }

    return InvalidSelectorResultError;
}(TestRunErrorBase);

var CantObtainInfoForElementSpecifiedBySelectorError = exports.CantObtainInfoForElementSpecifiedBySelectorError = function (_TestRunErrorBase7) {
    (0, _inherits3.default)(CantObtainInfoForElementSpecifiedBySelectorError, _TestRunErrorBase7);

    function CantObtainInfoForElementSpecifiedBySelectorError(callsite) {
        (0, _classCallCheck3.default)(this, CantObtainInfoForElementSpecifiedBySelectorError);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase7.call(this, _type2.default.cantObtainInfoForElementSpecifiedBySelectorError));

        _this7.callsite = callsite;
        return _this7;
    }

    return CantObtainInfoForElementSpecifiedBySelectorError;
}(TestRunErrorBase);

// Page errors
//--------------------------------------------------------------------


var PageLoadError = exports.PageLoadError = function (_TestRunErrorBase8) {
    (0, _inherits3.default)(PageLoadError, _TestRunErrorBase8);

    function PageLoadError(errMsg) {
        (0, _classCallCheck3.default)(this, PageLoadError);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase8.call(this, _type2.default.pageLoadError));

        _this8.errMsg = errMsg;
        return _this8;
    }

    return PageLoadError;
}(TestRunErrorBase);

// Uncaught errors
//--------------------------------------------------------------------


var UncaughtErrorOnPage = exports.UncaughtErrorOnPage = function (_TestRunErrorBase9) {
    (0, _inherits3.default)(UncaughtErrorOnPage, _TestRunErrorBase9);

    function UncaughtErrorOnPage(errMsg, pageDestUrl) {
        (0, _classCallCheck3.default)(this, UncaughtErrorOnPage);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase9.call(this, _type2.default.uncaughtErrorOnPage));

        _this9.errMsg = errMsg;
        _this9.pageDestUrl = pageDestUrl;
        return _this9;
    }

    return UncaughtErrorOnPage;
}(TestRunErrorBase);

var UncaughtErrorInTestCode = exports.UncaughtErrorInTestCode = function (_TestRunErrorBase10) {
    (0, _inherits3.default)(UncaughtErrorInTestCode, _TestRunErrorBase10);

    function UncaughtErrorInTestCode(err, callsite) {
        (0, _classCallCheck3.default)(this, UncaughtErrorInTestCode);

        var _this10 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase10.call(this, _type2.default.uncaughtErrorInTestCode));

        _this10.errMsg = String(err);
        _this10.callsite = callsite;
        return _this10;
    }

    return UncaughtErrorInTestCode;
}(TestRunErrorBase);

var UncaughtNonErrorObjectInTestCode = exports.UncaughtNonErrorObjectInTestCode = function (_TestRunErrorBase11) {
    (0, _inherits3.default)(UncaughtNonErrorObjectInTestCode, _TestRunErrorBase11);

    function UncaughtNonErrorObjectInTestCode(obj) {
        (0, _classCallCheck3.default)(this, UncaughtNonErrorObjectInTestCode);

        var _this11 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase11.call(this, _type2.default.uncaughtNonErrorObjectInTestCode));

        _this11.objType = typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj);
        _this11.objStr = String(obj);
        return _this11;
    }

    return UncaughtNonErrorObjectInTestCode;
}(TestRunErrorBase);

var UncaughtErrorInClientFunctionCode = exports.UncaughtErrorInClientFunctionCode = function (_TestRunErrorBase12) {
    (0, _inherits3.default)(UncaughtErrorInClientFunctionCode, _TestRunErrorBase12);

    function UncaughtErrorInClientFunctionCode(instantiationCallsiteName, err) {
        (0, _classCallCheck3.default)(this, UncaughtErrorInClientFunctionCode);

        var _this12 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase12.call(this, _type2.default.uncaughtErrorInClientFunctionCode));

        _this12.errMsg = String(err);
        _this12.instantiationCallsiteName = instantiationCallsiteName;
        return _this12;
    }

    return UncaughtErrorInClientFunctionCode;
}(TestRunErrorBase);

var UncaughtErrorInCustomDOMPropertyCode = exports.UncaughtErrorInCustomDOMPropertyCode = function (_TestRunErrorBase13) {
    (0, _inherits3.default)(UncaughtErrorInCustomDOMPropertyCode, _TestRunErrorBase13);

    function UncaughtErrorInCustomDOMPropertyCode(instantiationCallsiteName, err, prop) {
        (0, _classCallCheck3.default)(this, UncaughtErrorInCustomDOMPropertyCode);

        var _this13 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase13.call(this, _type2.default.uncaughtErrorInCustomDOMPropertyCode, err, prop));

        _this13.errMsg = String(err);
        _this13.property = prop;
        _this13.instantiationCallsiteName = instantiationCallsiteName;
        return _this13;
    }

    return UncaughtErrorInCustomDOMPropertyCode;
}(TestRunErrorBase);

// Assertion errors
//--------------------------------------------------------------------


var ExternalAssertionLibraryError = exports.ExternalAssertionLibraryError = function (_TestRunErrorBase14) {
    (0, _inherits3.default)(ExternalAssertionLibraryError, _TestRunErrorBase14);

    function ExternalAssertionLibraryError(err, callsite) {
        (0, _classCallCheck3.default)(this, ExternalAssertionLibraryError);

        var _this14 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase14.call(this, _type2.default.externalAssertionLibraryError));

        _this14.errMsg = String(err);
        _this14.callsite = callsite;
        return _this14;
    }

    return ExternalAssertionLibraryError;
}(TestRunErrorBase);

var AssertionExecutableArgumentError = exports.AssertionExecutableArgumentError = function (_ActionArgumentErrorB) {
    (0, _inherits3.default)(AssertionExecutableArgumentError, _ActionArgumentErrorB);

    function AssertionExecutableArgumentError(argumentName, argumentValue, errMsg) {
        (0, _classCallCheck3.default)(this, AssertionExecutableArgumentError);

        var _this15 = (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB.call(this, _type2.default.assertionExecutableArgumentError, argumentName, argumentValue));

        _this15.errMsg = errMsg;
        return _this15;
    }

    return AssertionExecutableArgumentError;
}(ActionArgumentErrorBase);

var AssertionUnawaitedPromiseError = exports.AssertionUnawaitedPromiseError = function (_TestRunErrorBase15) {
    (0, _inherits3.default)(AssertionUnawaitedPromiseError, _TestRunErrorBase15);

    function AssertionUnawaitedPromiseError(callsite) {
        (0, _classCallCheck3.default)(this, AssertionUnawaitedPromiseError);

        var _this16 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase15.call(this, _type2.default.assertionUnawaitedPromiseError));

        _this16.callsite = callsite;
        return _this16;
    }

    return AssertionUnawaitedPromiseError;
}(TestRunErrorBase);

// Action parameters errors
//--------------------------------------------------------------------
// Options errors


var ActionIntegerOptionError = exports.ActionIntegerOptionError = function (_ActionOptionErrorBas) {
    (0, _inherits3.default)(ActionIntegerOptionError, _ActionOptionErrorBas);

    function ActionIntegerOptionError(optionName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionIntegerOptionError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionOptionErrorBas.call(this, _type2.default.actionIntegerOptionError, optionName, actualValue));
    }

    return ActionIntegerOptionError;
}(ActionOptionErrorBase);

var ActionPositiveIntegerOptionError = exports.ActionPositiveIntegerOptionError = function (_ActionOptionErrorBas2) {
    (0, _inherits3.default)(ActionPositiveIntegerOptionError, _ActionOptionErrorBas2);

    function ActionPositiveIntegerOptionError(optionName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionPositiveIntegerOptionError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionOptionErrorBas2.call(this, _type2.default.actionPositiveIntegerOptionError, optionName, actualValue));
    }

    return ActionPositiveIntegerOptionError;
}(ActionOptionErrorBase);

var ActionBooleanOptionError = exports.ActionBooleanOptionError = function (_ActionOptionErrorBas3) {
    (0, _inherits3.default)(ActionBooleanOptionError, _ActionOptionErrorBas3);

    function ActionBooleanOptionError(optionName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionBooleanOptionError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionOptionErrorBas3.call(this, _type2.default.actionBooleanOptionError, optionName, actualValue));
    }

    return ActionBooleanOptionError;
}(ActionOptionErrorBase);

var ActionSpeedOptionError = exports.ActionSpeedOptionError = function (_ActionOptionErrorBas4) {
    (0, _inherits3.default)(ActionSpeedOptionError, _ActionOptionErrorBas4);

    function ActionSpeedOptionError(optionName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionSpeedOptionError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionOptionErrorBas4.call(this, _type2.default.actionSpeedOptionError, optionName, actualValue));
    }

    return ActionSpeedOptionError;
}(ActionOptionErrorBase);

var ActionOptionsTypeError = exports.ActionOptionsTypeError = function (_TestRunErrorBase16) {
    (0, _inherits3.default)(ActionOptionsTypeError, _TestRunErrorBase16);

    function ActionOptionsTypeError(actualType) {
        (0, _classCallCheck3.default)(this, ActionOptionsTypeError);

        var _this21 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase16.call(this, _type2.default.actionOptionsTypeError));

        _this21.actualType = actualType;
        return _this21;
    }

    return ActionOptionsTypeError;
}(TestRunErrorBase);

// Arguments errors


var ActionStringArgumentError = exports.ActionStringArgumentError = function (_ActionArgumentErrorB2) {
    (0, _inherits3.default)(ActionStringArgumentError, _ActionArgumentErrorB2);

    function ActionStringArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionStringArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB2.call(this, _type2.default.actionStringArgumentError, argumentName, actualValue));
    }

    return ActionStringArgumentError;
}(ActionArgumentErrorBase);

var ActionNullableStringArgumentError = exports.ActionNullableStringArgumentError = function (_ActionArgumentErrorB3) {
    (0, _inherits3.default)(ActionNullableStringArgumentError, _ActionArgumentErrorB3);

    function ActionNullableStringArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionNullableStringArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB3.call(this, _type2.default.actionNullableStringArgumentError, argumentName, actualValue));
    }

    return ActionNullableStringArgumentError;
}(ActionArgumentErrorBase);

var ActionIntegerArgumentError = exports.ActionIntegerArgumentError = function (_ActionArgumentErrorB4) {
    (0, _inherits3.default)(ActionIntegerArgumentError, _ActionArgumentErrorB4);

    function ActionIntegerArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionIntegerArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB4.call(this, _type2.default.actionIntegerArgumentError, argumentName, actualValue));
    }

    return ActionIntegerArgumentError;
}(ActionArgumentErrorBase);

var ActionRoleArgumentError = exports.ActionRoleArgumentError = function (_ActionArgumentErrorB5) {
    (0, _inherits3.default)(ActionRoleArgumentError, _ActionArgumentErrorB5);

    function ActionRoleArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionRoleArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB5.call(this, _type2.default.actionRoleArgumentError, argumentName, actualValue));
    }

    return ActionRoleArgumentError;
}(ActionArgumentErrorBase);

var ActionPositiveIntegerArgumentError = exports.ActionPositiveIntegerArgumentError = function (_ActionArgumentErrorB6) {
    (0, _inherits3.default)(ActionPositiveIntegerArgumentError, _ActionArgumentErrorB6);

    function ActionPositiveIntegerArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionPositiveIntegerArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB6.call(this, _type2.default.actionPositiveIntegerArgumentError, argumentName, actualValue));
    }

    return ActionPositiveIntegerArgumentError;
}(ActionArgumentErrorBase);

var ActionStringOrStringArrayArgumentError = exports.ActionStringOrStringArrayArgumentError = function (_ActionArgumentErrorB7) {
    (0, _inherits3.default)(ActionStringOrStringArrayArgumentError, _ActionArgumentErrorB7);

    function ActionStringOrStringArrayArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, ActionStringOrStringArrayArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB7.call(this, _type2.default.actionStringOrStringArrayArgumentError, argumentName, actualValue));
    }

    return ActionStringOrStringArrayArgumentError;
}(ActionArgumentErrorBase);

var ActionStringArrayElementError = exports.ActionStringArrayElementError = function (_ActionArgumentErrorB8) {
    (0, _inherits3.default)(ActionStringArrayElementError, _ActionArgumentErrorB8);

    function ActionStringArrayElementError(argumentName, actualValue, elementIndex) {
        (0, _classCallCheck3.default)(this, ActionStringArrayElementError);

        var _this28 = (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB8.call(this, _type2.default.actionStringArrayElementError, argumentName, actualValue));

        _this28.elementIndex = elementIndex;
        return _this28;
    }

    return ActionStringArrayElementError;
}(ActionArgumentErrorBase);

var SetTestSpeedArgumentError = exports.SetTestSpeedArgumentError = function (_ActionArgumentErrorB9) {
    (0, _inherits3.default)(SetTestSpeedArgumentError, _ActionArgumentErrorB9);

    function SetTestSpeedArgumentError(argumentName, actualValue) {
        (0, _classCallCheck3.default)(this, SetTestSpeedArgumentError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB9.call(this, _type2.default.setTestSpeedArgumentError, argumentName, actualValue));
    }

    return SetTestSpeedArgumentError;
}(ActionArgumentErrorBase);

var ActionUnsupportedDeviceTypeError = exports.ActionUnsupportedDeviceTypeError = function (_ActionArgumentErrorB10) {
    (0, _inherits3.default)(ActionUnsupportedDeviceTypeError, _ActionArgumentErrorB10);

    function ActionUnsupportedDeviceTypeError(argumentName, argumentValue) {
        (0, _classCallCheck3.default)(this, ActionUnsupportedDeviceTypeError);
        return (0, _possibleConstructorReturn3.default)(this, _ActionArgumentErrorB10.call(this, _type2.default.actionUnsupportedDeviceTypeError, argumentName, argumentValue));
    }

    return ActionUnsupportedDeviceTypeError;
}(ActionArgumentErrorBase);

// Selector errors


var ActionSelectorError = exports.ActionSelectorError = function (_TestRunErrorBase17) {
    (0, _inherits3.default)(ActionSelectorError, _TestRunErrorBase17);

    function ActionSelectorError(selectorName, errMsg) {
        (0, _classCallCheck3.default)(this, ActionSelectorError);

        var _this31 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase17.call(this, _type2.default.actionSelectorError));

        _this31.selectorName = selectorName;
        _this31.errMsg = errMsg;
        return _this31;
    }

    return ActionSelectorError;
}(TestRunErrorBase);

// Action execution errors
//--------------------------------------------------------------------


var ActionElementNotFoundError = exports.ActionElementNotFoundError = function (_TestRunErrorBase18) {
    (0, _inherits3.default)(ActionElementNotFoundError, _TestRunErrorBase18);

    function ActionElementNotFoundError() {
        (0, _classCallCheck3.default)(this, ActionElementNotFoundError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase18.call(this, _type2.default.actionElementNotFoundError));
    }

    return ActionElementNotFoundError;
}(TestRunErrorBase);

var ActionElementIsInvisibleError = exports.ActionElementIsInvisibleError = function (_TestRunErrorBase19) {
    (0, _inherits3.default)(ActionElementIsInvisibleError, _TestRunErrorBase19);

    function ActionElementIsInvisibleError() {
        (0, _classCallCheck3.default)(this, ActionElementIsInvisibleError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase19.call(this, _type2.default.actionElementIsInvisibleError));
    }

    return ActionElementIsInvisibleError;
}(TestRunErrorBase);

var ActionSelectorMatchesWrongNodeTypeError = exports.ActionSelectorMatchesWrongNodeTypeError = function (_TestRunErrorBase20) {
    (0, _inherits3.default)(ActionSelectorMatchesWrongNodeTypeError, _TestRunErrorBase20);

    function ActionSelectorMatchesWrongNodeTypeError(nodeDescription) {
        (0, _classCallCheck3.default)(this, ActionSelectorMatchesWrongNodeTypeError);

        var _this34 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase20.call(this, _type2.default.actionSelectorMatchesWrongNodeTypeError));

        _this34.nodeDescription = nodeDescription;
        return _this34;
    }

    return ActionSelectorMatchesWrongNodeTypeError;
}(TestRunErrorBase);

var ActionAdditionalElementNotFoundError = exports.ActionAdditionalElementNotFoundError = function (_TestRunErrorBase21) {
    (0, _inherits3.default)(ActionAdditionalElementNotFoundError, _TestRunErrorBase21);

    function ActionAdditionalElementNotFoundError(argumentName) {
        (0, _classCallCheck3.default)(this, ActionAdditionalElementNotFoundError);

        var _this35 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase21.call(this, _type2.default.actionAdditionalElementNotFoundError));

        _this35.argumentName = argumentName;
        return _this35;
    }

    return ActionAdditionalElementNotFoundError;
}(TestRunErrorBase);

var ActionAdditionalElementIsInvisibleError = exports.ActionAdditionalElementIsInvisibleError = function (_TestRunErrorBase22) {
    (0, _inherits3.default)(ActionAdditionalElementIsInvisibleError, _TestRunErrorBase22);

    function ActionAdditionalElementIsInvisibleError(argumentName) {
        (0, _classCallCheck3.default)(this, ActionAdditionalElementIsInvisibleError);

        var _this36 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase22.call(this, _type2.default.actionAdditionalElementIsInvisibleError));

        _this36.argumentName = argumentName;
        return _this36;
    }

    return ActionAdditionalElementIsInvisibleError;
}(TestRunErrorBase);

var ActionAdditionalSelectorMatchesWrongNodeTypeError = exports.ActionAdditionalSelectorMatchesWrongNodeTypeError = function (_TestRunErrorBase23) {
    (0, _inherits3.default)(ActionAdditionalSelectorMatchesWrongNodeTypeError, _TestRunErrorBase23);

    function ActionAdditionalSelectorMatchesWrongNodeTypeError(argumentName, nodeDescription) {
        (0, _classCallCheck3.default)(this, ActionAdditionalSelectorMatchesWrongNodeTypeError);

        var _this37 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase23.call(this, _type2.default.actionAdditionalSelectorMatchesWrongNodeTypeError));

        _this37.argumentName = argumentName;
        _this37.nodeDescription = nodeDescription;
        return _this37;
    }

    return ActionAdditionalSelectorMatchesWrongNodeTypeError;
}(TestRunErrorBase);

var ActionElementNonEditableError = exports.ActionElementNonEditableError = function (_TestRunErrorBase24) {
    (0, _inherits3.default)(ActionElementNonEditableError, _TestRunErrorBase24);

    function ActionElementNonEditableError() {
        (0, _classCallCheck3.default)(this, ActionElementNonEditableError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase24.call(this, _type2.default.actionElementNonEditableError));
    }

    return ActionElementNonEditableError;
}(TestRunErrorBase);

var ActionElementNotTextAreaError = exports.ActionElementNotTextAreaError = function (_TestRunErrorBase25) {
    (0, _inherits3.default)(ActionElementNotTextAreaError, _TestRunErrorBase25);

    function ActionElementNotTextAreaError() {
        (0, _classCallCheck3.default)(this, ActionElementNotTextAreaError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase25.call(this, _type2.default.actionElementNotTextAreaError));
    }

    return ActionElementNotTextAreaError;
}(TestRunErrorBase);

var ActionElementNonContentEditableError = exports.ActionElementNonContentEditableError = function (_TestRunErrorBase26) {
    (0, _inherits3.default)(ActionElementNonContentEditableError, _TestRunErrorBase26);

    function ActionElementNonContentEditableError(argumentName) {
        (0, _classCallCheck3.default)(this, ActionElementNonContentEditableError);

        var _this40 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase26.call(this, _type2.default.actionElementNonContentEditableError));

        _this40.argumentName = argumentName;
        return _this40;
    }

    return ActionElementNonContentEditableError;
}(TestRunErrorBase);

var ActionRootContainerNotFoundError = exports.ActionRootContainerNotFoundError = function (_TestRunErrorBase27) {
    (0, _inherits3.default)(ActionRootContainerNotFoundError, _TestRunErrorBase27);

    function ActionRootContainerNotFoundError() {
        (0, _classCallCheck3.default)(this, ActionRootContainerNotFoundError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase27.call(this, _type2.default.actionRootContainerNotFoundError));
    }

    return ActionRootContainerNotFoundError;
}(TestRunErrorBase);

var ActionIncorrectKeysError = exports.ActionIncorrectKeysError = function (_TestRunErrorBase28) {
    (0, _inherits3.default)(ActionIncorrectKeysError, _TestRunErrorBase28);

    function ActionIncorrectKeysError(argumentName) {
        (0, _classCallCheck3.default)(this, ActionIncorrectKeysError);

        var _this42 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase28.call(this, _type2.default.actionIncorrectKeysError));

        _this42.argumentName = argumentName;
        return _this42;
    }

    return ActionIncorrectKeysError;
}(TestRunErrorBase);

var ActionCanNotFindFileToUploadError = exports.ActionCanNotFindFileToUploadError = function (_TestRunErrorBase29) {
    (0, _inherits3.default)(ActionCanNotFindFileToUploadError, _TestRunErrorBase29);

    function ActionCanNotFindFileToUploadError(filePaths) {
        (0, _classCallCheck3.default)(this, ActionCanNotFindFileToUploadError);

        var _this43 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase29.call(this, _type2.default.actionCanNotFindFileToUploadError));

        _this43.filePaths = filePaths;
        return _this43;
    }

    return ActionCanNotFindFileToUploadError;
}(TestRunErrorBase);

var ActionElementIsNotFileInputError = exports.ActionElementIsNotFileInputError = function (_TestRunErrorBase30) {
    (0, _inherits3.default)(ActionElementIsNotFileInputError, _TestRunErrorBase30);

    function ActionElementIsNotFileInputError() {
        (0, _classCallCheck3.default)(this, ActionElementIsNotFileInputError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase30.call(this, _type2.default.actionElementIsNotFileInputError));
    }

    return ActionElementIsNotFileInputError;
}(TestRunErrorBase);

var ActionInvalidScrollTargetError = exports.ActionInvalidScrollTargetError = function (_TestRunErrorBase31) {
    (0, _inherits3.default)(ActionInvalidScrollTargetError, _TestRunErrorBase31);

    function ActionInvalidScrollTargetError(scrollTargetXValid, scrollTargetYValid) {
        (0, _classCallCheck3.default)(this, ActionInvalidScrollTargetError);

        var _this45 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase31.call(this, _type2.default.actionInvalidScrollTargetError));

        if (!scrollTargetXValid) {
            if (!scrollTargetYValid) _this45.properties = 'scrollTargetX and scrollTargetY properties';else _this45.properties = 'scrollTargetX property';
        } else _this45.properties = 'scrollTargetY property';
        return _this45;
    }

    return ActionInvalidScrollTargetError;
}(TestRunErrorBase);

var WindowDimensionsOverflowError = exports.WindowDimensionsOverflowError = function (_TestRunErrorBase32) {
    (0, _inherits3.default)(WindowDimensionsOverflowError, _TestRunErrorBase32);

    function WindowDimensionsOverflowError(callsite) {
        (0, _classCallCheck3.default)(this, WindowDimensionsOverflowError);

        var _this46 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase32.call(this, _type2.default.windowDimensionsOverflowError));

        _this46.callsite = callsite;
        return _this46;
    }

    return WindowDimensionsOverflowError;
}(TestRunErrorBase);

var InvalidElementScreenshotDimensionsError = exports.InvalidElementScreenshotDimensionsError = function (_TestRunErrorBase33) {
    (0, _inherits3.default)(InvalidElementScreenshotDimensionsError, _TestRunErrorBase33);

    function InvalidElementScreenshotDimensionsError(width, height) {
        (0, _classCallCheck3.default)(this, InvalidElementScreenshotDimensionsError);

        var _this47 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase33.call(this, _type2.default.invalidElementScreenshotDimensionsError));

        var widthIsInvalid = width <= 0;
        var heightIsInvalid = height <= 0;

        if (widthIsInvalid) {
            if (heightIsInvalid) {
                _this47.verb = 'are';
                _this47.dimensions = 'width and height';
            } else {
                _this47.verb = 'is';
                _this47.dimensions = 'width';
            }
        } else {
            _this47.verb = 'is';
            _this47.dimensions = 'height';
        }
        return _this47;
    }

    return InvalidElementScreenshotDimensionsError;
}(TestRunErrorBase);

var RoleSwitchInRoleInitializerError = exports.RoleSwitchInRoleInitializerError = function (_TestRunErrorBase34) {
    (0, _inherits3.default)(RoleSwitchInRoleInitializerError, _TestRunErrorBase34);

    function RoleSwitchInRoleInitializerError(callsite) {
        (0, _classCallCheck3.default)(this, RoleSwitchInRoleInitializerError);

        var _this48 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase34.call(this, _type2.default.roleSwitchInRoleInitializerError));

        _this48.callsite = callsite;
        return _this48;
    }

    return RoleSwitchInRoleInitializerError;
}(TestRunErrorBase);

// Iframe errors


var ActionElementNotIframeError = exports.ActionElementNotIframeError = function (_TestRunErrorBase35) {
    (0, _inherits3.default)(ActionElementNotIframeError, _TestRunErrorBase35);

    function ActionElementNotIframeError() {
        (0, _classCallCheck3.default)(this, ActionElementNotIframeError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase35.call(this, _type2.default.actionElementNotIframeError));
    }

    return ActionElementNotIframeError;
}(TestRunErrorBase);

var ActionIframeIsNotLoadedError = exports.ActionIframeIsNotLoadedError = function (_TestRunErrorBase36) {
    (0, _inherits3.default)(ActionIframeIsNotLoadedError, _TestRunErrorBase36);

    function ActionIframeIsNotLoadedError() {
        (0, _classCallCheck3.default)(this, ActionIframeIsNotLoadedError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase36.call(this, _type2.default.actionIframeIsNotLoadedError));
    }

    return ActionIframeIsNotLoadedError;
}(TestRunErrorBase);

var CurrentIframeIsNotLoadedError = exports.CurrentIframeIsNotLoadedError = function (_TestRunErrorBase37) {
    (0, _inherits3.default)(CurrentIframeIsNotLoadedError, _TestRunErrorBase37);

    function CurrentIframeIsNotLoadedError() {
        (0, _classCallCheck3.default)(this, CurrentIframeIsNotLoadedError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase37.call(this, _type2.default.currentIframeIsNotLoadedError));
    }

    return CurrentIframeIsNotLoadedError;
}(TestRunErrorBase);

var CurrentIframeNotFoundError = exports.CurrentIframeNotFoundError = function (_TestRunErrorBase38) {
    (0, _inherits3.default)(CurrentIframeNotFoundError, _TestRunErrorBase38);

    function CurrentIframeNotFoundError() {
        (0, _classCallCheck3.default)(this, CurrentIframeNotFoundError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase38.call(this, _type2.default.currentIframeNotFoundError));
    }

    return CurrentIframeNotFoundError;
}(TestRunErrorBase);

var CurrentIframeIsInvisibleError = exports.CurrentIframeIsInvisibleError = function (_TestRunErrorBase39) {
    (0, _inherits3.default)(CurrentIframeIsInvisibleError, _TestRunErrorBase39);

    function CurrentIframeIsInvisibleError() {
        (0, _classCallCheck3.default)(this, CurrentIframeIsInvisibleError);
        return (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase39.call(this, _type2.default.currentIframeIsInvisibleError));
    }

    return CurrentIframeIsInvisibleError;
}(TestRunErrorBase);

// Native dialog errors


var NativeDialogNotHandledError = exports.NativeDialogNotHandledError = function (_TestRunErrorBase40) {
    (0, _inherits3.default)(NativeDialogNotHandledError, _TestRunErrorBase40);

    function NativeDialogNotHandledError(dialogType, url) {
        (0, _classCallCheck3.default)(this, NativeDialogNotHandledError);

        var _this54 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase40.call(this, _type2.default.nativeDialogNotHandledError));

        _this54.dialogType = dialogType;
        _this54.pageUrl = url;
        return _this54;
    }

    return NativeDialogNotHandledError;
}(TestRunErrorBase);

var UncaughtErrorInNativeDialogHandler = exports.UncaughtErrorInNativeDialogHandler = function (_TestRunErrorBase41) {
    (0, _inherits3.default)(UncaughtErrorInNativeDialogHandler, _TestRunErrorBase41);

    function UncaughtErrorInNativeDialogHandler(dialogType, errMsg, url) {
        (0, _classCallCheck3.default)(this, UncaughtErrorInNativeDialogHandler);

        var _this55 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase41.call(this, _type2.default.uncaughtErrorInNativeDialogHandler));

        _this55.dialogType = dialogType;
        _this55.errMsg = errMsg;
        _this55.pageUrl = url;
        return _this55;
    }

    return UncaughtErrorInNativeDialogHandler;
}(TestRunErrorBase);

var SetNativeDialogHandlerCodeWrongTypeError = exports.SetNativeDialogHandlerCodeWrongTypeError = function (_TestRunErrorBase42) {
    (0, _inherits3.default)(SetNativeDialogHandlerCodeWrongTypeError, _TestRunErrorBase42);

    function SetNativeDialogHandlerCodeWrongTypeError(actualType) {
        (0, _classCallCheck3.default)(this, SetNativeDialogHandlerCodeWrongTypeError);

        var _this56 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase42.call(this, _type2.default.setNativeDialogHandlerCodeWrongTypeError));

        _this56.actualType = actualType;
        return _this56;
    }

    return SetNativeDialogHandlerCodeWrongTypeError;
}(TestRunErrorBase);

// Request Hooks


var RequestHookConfigureAPIError = exports.RequestHookConfigureAPIError = function (_TestRunErrorBase43) {
    (0, _inherits3.default)(RequestHookConfigureAPIError, _TestRunErrorBase43);

    function RequestHookConfigureAPIError(requestHookName, errMsg) {
        (0, _classCallCheck3.default)(this, RequestHookConfigureAPIError);

        var _this57 = (0, _possibleConstructorReturn3.default)(this, _TestRunErrorBase43.call(this, _type2.default.requestHookConfigureAPIError));

        _this57.requestHookName = requestHookName;
        _this57.errMsg = errMsg;
        return _this57;
    }

    return RequestHookConfigureAPIError;
}(TestRunErrorBase);