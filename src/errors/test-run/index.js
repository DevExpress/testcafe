// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import { TEST_RUN_ERRORS } from '../types';

// Base
//--------------------------------------------------------------------
class TestRunErrorBase {
    constructor (code) {
        this.code            = code;
        this.isTestCafeError = true;
        this.callsite        = null;
    }
}

class ActionOptionErrorBase extends TestRunErrorBase {
    constructor (code, optionName, actualValue) {
        super(code);

        this.optionName  = optionName;
        this.actualValue = actualValue;
    }
}

class ActionArgumentErrorBase extends TestRunErrorBase {
    constructor (code, argumentName, actualValue) {
        super(code);

        this.argumentName = argumentName;
        this.actualValue  = actualValue;
    }
}

// Synchronization errors
//--------------------------------------------------------------------
export class MissingAwaitError extends TestRunErrorBase {
    constructor (callsite) {
        super(TEST_RUN_ERRORS.missingAwaitError);

        this.callsite = callsite;
    }
}


// Client function errors
//--------------------------------------------------------------------
export class ClientFunctionExecutionInterruptionError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class DomNodeClientFunctionResultError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TEST_RUN_ERRORS.domNodeClientFunctionResultError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

// Selector errors
//--------------------------------------------------------------------
class SelectorErrorBase extends TestRunErrorBase {
    constructor (code, { apiFnChain, apiFnIndex }) {
        super(code);

        this.apiFnChain = apiFnChain;
        this.apiFnIndex = apiFnIndex;
    }
}

export class InvalidSelectorResultError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.invalidSelectorResultError);
    }
}

export class CannotObtainInfoForElementSpecifiedBySelectorError extends SelectorErrorBase {
    constructor (callsite, apiFnArgs) {
        super(TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError, apiFnArgs);

        this.callsite = callsite;
    }
}

// Page errors
//--------------------------------------------------------------------
export class PageLoadError extends TestRunErrorBase {
    constructor (errMsg, url) {
        super(TEST_RUN_ERRORS.pageLoadError);

        this.url    = url;
        this.errMsg = errMsg;
    }
}


// Uncaught errors
//--------------------------------------------------------------------
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (errStack, pageDestUrl) {
        super(TEST_RUN_ERRORS.uncaughtErrorOnPage);

        this.errStack    = errStack;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInTestCode extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TEST_RUN_ERRORS.uncaughtErrorInTestCode);

        this.errMsg      = String(err.rawMessage || err);
        this.callsite    = err.callsite || callsite;
        this.originError = err;
    }
}

export class UncaughtNonErrorObjectInTestCode extends TestRunErrorBase {
    constructor (obj) {
        super(TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr  = String(obj);
    }
}

export class UncaughtErrorInClientFunctionCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err) {
        super(TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode);

        this.errMsg                    = String(err);
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class UncaughtErrorInCustomDOMPropertyCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err, prop) {
        super(TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode, err, prop);

        this.errMsg                    = String(err);
        this.property                  = prop;
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class UnhandledPromiseRejectionError extends TestRunErrorBase {
    constructor (err) {
        super(TEST_RUN_ERRORS.unhandledPromiseRejection);

        this.errMsg = String(err);
    }
}

export class UncaughtExceptionError extends TestRunErrorBase {
    constructor (err) {
        super(TEST_RUN_ERRORS.uncaughtException);

        this.errMsg = String(err);
    }
}

export class UncaughtErrorInCustomClientScriptCode extends TestRunErrorBase {
    constructor (err) {
        super(TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCode);

        this.errMsg = String(err);
    }
}

export class UncaughtErrorInCustomClientScriptLoadedFromModule extends TestRunErrorBase {
    constructor (err, moduleName) {
        super(TEST_RUN_ERRORS.uncaughtErrorInCustomClientScriptCodeLoadedFromModule);

        this.errMsg     = String(err);
        this.moduleName = moduleName;
    }
}


// Assertion errors
//--------------------------------------------------------------------
export class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TEST_RUN_ERRORS.externalAssertionLibraryError);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}

export class AssertionExecutableArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, argumentValue, err, isAPIError) {
        super(TEST_RUN_ERRORS.assertionExecutableArgumentError, argumentName, argumentValue);

        this.errMsg      = isAPIError ? err.rawMessage : err.message;
        this.originError = err;
    }
}

export class AssertionWithoutMethodCallError extends TestRunErrorBase {
    constructor (callsite) {
        super(TEST_RUN_ERRORS.assertionWithoutMethodCallError);

        this.callsite = callsite;
    }
}

export class AssertionUnawaitedPromiseError extends TestRunErrorBase {
    constructor (callsite) {
        super(TEST_RUN_ERRORS.assertionUnawaitedPromiseError);

        this.callsite = callsite;
    }
}

// Action parameters errors
//--------------------------------------------------------------------
// Options errors
export class ActionIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TEST_RUN_ERRORS.actionIntegerOptionError, optionName, actualValue);
    }
}

export class ActionPositiveIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TEST_RUN_ERRORS.actionPositiveIntegerOptionError, optionName, actualValue);
    }
}

export class ActionBooleanOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TEST_RUN_ERRORS.actionBooleanOptionError, optionName, actualValue);
    }
}

export class ActionBooleanArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionBooleanArgumentError, argumentName, actualValue);
    }
}

export class ActionSpeedOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TEST_RUN_ERRORS.actionSpeedOptionError, optionName, actualValue);
    }
}

export class ActionOptionsTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TEST_RUN_ERRORS.actionOptionsTypeError);

        this.actualType = actualType;
    }
}


// Arguments errors
export class ActionStringArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionStringArgumentError, argumentName, actualValue);
    }
}

export class ActionNullableStringArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionNullableStringArgumentError, argumentName, actualValue);
    }
}

export class ActionIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionRoleArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionRoleArgumentError, argumentName, actualValue);
    }
}

export class ActionPositiveIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionPositiveIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionStringOrStringArrayArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError, argumentName, actualValue);
    }
}

export class ActionStringArrayElementError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue, elementIndex) {
        super(TEST_RUN_ERRORS.actionStringArrayElementError, argumentName, actualValue);

        this.elementIndex = elementIndex;
    }
}

export class SetTestSpeedArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.setTestSpeedArgumentError, argumentName, actualValue);
    }
}

export class ActionUnsupportedDeviceTypeError extends ActionArgumentErrorBase {
    constructor (argumentName, argumentValue) {
        super(TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError, argumentName, argumentValue);
    }
}

// Selector errors
export class ActionSelectorError extends TestRunErrorBase {
    constructor (selectorName, err, isAPIError) {
        super(TEST_RUN_ERRORS.actionSelectorError);

        this.selectorName = selectorName;
        this.errMsg       = isAPIError ? err.rawMessage : err.message;
        this.originError  = err;
    }
}

// Action execution errors
//--------------------------------------------------------------------
export class ActionElementNotFoundError extends SelectorErrorBase {
    constructor (apiFnArgs) {
        super(TEST_RUN_ERRORS.actionElementNotFoundError, apiFnArgs);
    }
}

export class ActionElementIsInvisibleError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionElementIsInvisibleError);
    }
}

export class ActionSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor (nodeDescription) {
        super(TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError);

        this.nodeDescription = nodeDescription;
    }
}

export class ActionAdditionalElementNotFoundError extends SelectorErrorBase {
    constructor (argumentName, apiFnArgs) {
        super(TEST_RUN_ERRORS.actionAdditionalElementNotFoundError, apiFnArgs);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalElementIsInvisibleError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor (argumentName, nodeDescription) {
        super(TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError);

        this.argumentName    = argumentName;
        this.nodeDescription = nodeDescription;
    }
}

export class ActionElementNonEditableError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionElementNonEditableError);
    }
}

export class ActionElementNotTextAreaError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionElementNotTextAreaError);
    }
}

export class ActionElementNonContentEditableError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TEST_RUN_ERRORS.actionElementNonContentEditableError);

        this.argumentName = argumentName;
    }
}

export class ActionRootContainerNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionRootContainerNotFoundError);
    }
}

export class ActionIncorrectKeysError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TEST_RUN_ERRORS.actionIncorrectKeysError);

        this.argumentName = argumentName;
    }
}

export class ActionCannotFindFileToUploadError extends TestRunErrorBase {
    constructor (filePaths, scannedFilePaths) {
        super(TEST_RUN_ERRORS.actionCannotFindFileToUploadError);

        this.filePaths        = filePaths;
        this.scannedFilePaths = scannedFilePaths;
    }
}

export class ActionElementIsNotFileInputError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionElementIsNotFileInputError);
    }
}

export class ActionInvalidScrollTargetError extends TestRunErrorBase {
    constructor (scrollTargetXValid, scrollTargetYValid) {
        super(TEST_RUN_ERRORS.actionInvalidScrollTargetError);

        if (!scrollTargetXValid) {
            if (!scrollTargetYValid)
                this.properties = 'scrollTargetX and scrollTargetY properties';
            else
                this.properties = 'scrollTargetX property';
        }
        else
            this.properties = 'scrollTargetY property';
    }
}

export class UncaughtErrorInCustomScript extends TestRunErrorBase {
    constructor (err, expression, line, column, callsite) {
        super(TEST_RUN_ERRORS.uncaughtErrorInCustomScript);

        this.callsite   = callsite;
        this.expression = expression;
        this.line       = line;
        this.column     = column;

        this.originError = err;
        this.errMsg      = err.message || String(err);
    }
}

export class UncaughtTestCafeErrorInCustomScript extends TestRunErrorBase {
    constructor (err, expression, line, column, callsite) {
        super(TEST_RUN_ERRORS.uncaughtTestCafeErrorInCustomScript);

        this.callsite   = callsite;
        this.expression = expression;
        this.line       = line;
        this.column     = column;

        this.originError = err;
        this.errCallsite = err.callsite;
    }
}

export class WindowDimensionsOverflowError extends TestRunErrorBase {
    constructor (callsite) {
        super(TEST_RUN_ERRORS.windowDimensionsOverflowError);

        this.callsite = callsite;
    }
}

export class InvalidElementScreenshotDimensionsError extends TestRunErrorBase {
    constructor (width, height) {
        super(TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError);

        const widthIsInvalid  = width <= 0;
        const heightIsInvalid = height <= 0;

        if (widthIsInvalid) {
            if (heightIsInvalid) {
                this.verb       = 'are';
                this.dimensions = 'width and height';
            }
            else {
                this.verb       = 'is';
                this.dimensions = 'width';
            }
        }
        else {
            this.verb       = 'is';
            this.dimensions = 'height';
        }
    }
}

export class ForbiddenCharactersInScreenshotPathError extends TestRunErrorBase {
    constructor (screenshotPath, forbiddenCharsList) {
        super(TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError);

        this.screenshotPath     = screenshotPath;
        this.forbiddenCharsList = forbiddenCharsList;
    }
}


export class RoleSwitchInRoleInitializerError extends TestRunErrorBase {
    constructor (callsite) {
        super(TEST_RUN_ERRORS.roleSwitchInRoleInitializerError);

        this.callsite = callsite;
    }
}


// Iframe errors
export class ActionElementNotIframeError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionElementNotIframeError);
    }
}

export class ActionIframeIsNotLoadedError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.actionIframeIsNotLoadedError);
    }
}

export class CurrentIframeIsNotLoadedError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.currentIframeIsNotLoadedError);
    }
}

export class ChildWindowNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.childWindowNotFoundError);
    }
}

export class ChildWindowIsNotLoadedError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.childWindowIsNotLoadedError);
    }
}

export class CannotSwitchToWindowError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.cannotSwitchToWindowError);
    }
}

export class CloseChildWindowError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.closeChildWindowError);
    }
}

export class CurrentIframeNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.currentIframeNotFoundError);
    }
}

export class CurrentIframeIsInvisibleError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.currentIframeIsInvisibleError);
    }
}

// Native dialog errors
export class NativeDialogNotHandledError extends TestRunErrorBase {
    constructor (dialogType, url) {
        super(TEST_RUN_ERRORS.nativeDialogNotHandledError);

        this.dialogType = dialogType;
        this.pageUrl    = url;
    }
}

export class UncaughtErrorInNativeDialogHandler extends TestRunErrorBase {
    constructor (dialogType, errMsg, url) {
        super(TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler);

        this.dialogType = dialogType;
        this.errMsg     = errMsg;
        this.pageUrl    = url;
    }
}

export class SetNativeDialogHandlerCodeWrongTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError);

        this.actualType = actualType;
    }
}

export class RequestHookUnhandledError extends TestRunErrorBase {
    constructor (err, hookClassName, methodName) {
        super(TEST_RUN_ERRORS.requestHookUnhandledError);

        this.errMsg        = String(err);
        this.hookClassName = hookClassName;
        this.methodName    = methodName;
    }
}

export class RequestHookNotImplementedMethodError extends TestRunErrorBase {
    constructor (methodName, hookClassName) {
        super(TEST_RUN_ERRORS.requestHookNotImplementedError);

        this.methodName    = methodName;
        this.hookClassName = hookClassName;
    }
}

export class ChildWindowClosedBeforeSwitchingError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.childWindowClosedBeforeSwitchingError);
    }
}

