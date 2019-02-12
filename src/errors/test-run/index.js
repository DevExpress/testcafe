// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import { TestRunErrors } from '../types';

// Base
//--------------------------------------------------------------------
class TestRunErrorBase {
    constructor (type) {
        this.type            = type.name;
        this.code            = type.code;
        this.isTestCafeError = true;
        this.callsite        = null;
    }
}

class ActionOptionErrorBase extends TestRunErrorBase {
    constructor (type, optionName, actualValue) {
        super(type);

        this.optionName  = optionName;
        this.actualValue = actualValue;
    }
}

class ActionArgumentErrorBase extends TestRunErrorBase {
    constructor (type, argumentName, actualValue) {
        super(type);

        this.argumentName = argumentName;
        this.actualValue  = actualValue;
    }
}

// Synchronization errors
//--------------------------------------------------------------------
export class MissingAwaitError extends TestRunErrorBase {
    constructor (callsite) {
        super(TestRunErrors.missingAwaitError);

        this.callsite = callsite;
    }
}


// Client function errors
//--------------------------------------------------------------------
export class ClientFunctionExecutionInterruptionError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TestRunErrors.clientFunctionExecutionInterruptionError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class DomNodeClientFunctionResultError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TestRunErrors.domNodeClientFunctionResultError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

// Selector errors
//--------------------------------------------------------------------
class SelectorErrorBase extends TestRunErrorBase {
    constructor (type, { apiFnChain, apiFnIndex }) {
        super(type);

        this.apiFnChain = apiFnChain;
        this.apiFnIndex = apiFnIndex;
    }
}

export class InvalidSelectorResultError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.invalidSelectorResultError);
    }
}

export class CantObtainInfoForElementSpecifiedBySelectorError extends SelectorErrorBase {
    constructor (callsite, apiFnArgs) {
        super(TestRunErrors.cantObtainInfoForElementSpecifiedBySelectorError, apiFnArgs);

        this.callsite = callsite;
    }
}

// Page errors
//--------------------------------------------------------------------
export class PageLoadError extends TestRunErrorBase {
    constructor (errMsg) {
        super(TestRunErrors.pageLoadError);

        this.errMsg = errMsg;
    }
}


// Uncaught errors
//--------------------------------------------------------------------
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (errStack, pageDestUrl) {
        super(TestRunErrors.uncaughtErrorOnPage);

        this.errStack    = errStack;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInTestCode extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TestRunErrors.uncaughtErrorInTestCode);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}

export class UncaughtNonErrorObjectInTestCode extends TestRunErrorBase {
    constructor (obj) {
        super(TestRunErrors.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr  = String(obj);
    }
}

export class UncaughtErrorInClientFunctionCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err) {
        super(TestRunErrors.uncaughtErrorInClientFunctionCode);

        this.errMsg                    = String(err);
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class UncaughtErrorInCustomDOMPropertyCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err, prop) {
        super(TestRunErrors.uncaughtErrorInCustomDOMPropertyCode, err, prop);

        this.errMsg                    = String(err);
        this.property                  = prop;
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class UnhandledPromiseRejectionError extends TestRunErrorBase {
    constructor (err) {
        super(TestRunErrors.unhandledPromiseRejection);

        this.errMsg = String(err);
    }
}

export class UncaughtExceptionError extends TestRunErrorBase {
    constructor (err) {
        super(TestRunErrors.uncaughtException);

        this.errMsg = String(err);
    }
}


// Assertion errors
//--------------------------------------------------------------------
export class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TestRunErrors.externalAssertionLibraryError);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}

export class AssertionExecutableArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, argumentValue, errMsg) {
        super(TestRunErrors.assertionExecutableArgumentError, argumentName, argumentValue);

        this.errMsg = errMsg;
    }
}

export class AssertionWithoutMethodCallError extends TestRunErrorBase {
    constructor (callsite) {
        super(TestRunErrors.assertionWithoutMethodCallError);

        this.callsite = callsite;
    }
}

export class AssertionUnawaitedPromiseError extends TestRunErrorBase {
    constructor (callsite) {
        super(TestRunErrors.assertionUnawaitedPromiseError);

        this.callsite = callsite;
    }
}

// Action parameters errors
//--------------------------------------------------------------------
// Options errors
export class ActionIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TestRunErrors.actionIntegerOptionError, optionName, actualValue);
    }
}

export class ActionPositiveIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TestRunErrors.actionPositiveIntegerOptionError, optionName, actualValue);
    }
}

export class ActionBooleanOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TestRunErrors.actionBooleanOptionError, optionName, actualValue);
    }
}

export class ActionBooleanArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionBooleanArgumentError, argumentName, actualValue);
    }
}

export class ActionSpeedOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TestRunErrors.actionSpeedOptionError, optionName, actualValue);
    }
}

export class ActionOptionsTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TestRunErrors.actionOptionsTypeError);

        this.actualType = actualType;
    }
}


// Arguments errors
export class ActionStringArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionStringArgumentError, argumentName, actualValue);
    }
}

export class ActionNullableStringArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionNullableStringArgumentError, argumentName, actualValue);
    }
}

export class ActionIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionRoleArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionRoleArgumentError, argumentName, actualValue);
    }
}

export class ActionPositiveIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionPositiveIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionStringOrStringArrayArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.actionStringOrStringArrayArgumentError, argumentName, actualValue);
    }
}

export class ActionStringArrayElementError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue, elementIndex) {
        super(TestRunErrors.actionStringArrayElementError, argumentName, actualValue);

        this.elementIndex = elementIndex;
    }
}

export class SetTestSpeedArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TestRunErrors.setTestSpeedArgumentError, argumentName, actualValue);
    }
}

export class ActionUnsupportedDeviceTypeError extends ActionArgumentErrorBase {
    constructor (argumentName, argumentValue) {
        super(TestRunErrors.actionUnsupportedDeviceTypeError, argumentName, argumentValue);
    }
}

// Selector errors
export class ActionSelectorError extends TestRunErrorBase {
    constructor (selectorName, errMsg) {
        super(TestRunErrors.actionSelectorError);

        this.selectorName = selectorName;
        this.errMsg       = errMsg;
    }
}

// Action execution errors
//--------------------------------------------------------------------
export class ActionElementNotFoundError extends SelectorErrorBase {
    constructor (apiFnArgs) {
        super(TestRunErrors.actionElementNotFoundError, apiFnArgs);
    }
}

export class ActionElementIsInvisibleError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionElementIsInvisibleError);
    }
}

export class ActionSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor (nodeDescription) {
        super(TestRunErrors.actionSelectorMatchesWrongNodeTypeError);

        this.nodeDescription = nodeDescription;
    }
}

export class ActionAdditionalElementNotFoundError extends SelectorErrorBase {
    constructor (argumentName, apiFnArgs) {
        super(TestRunErrors.actionAdditionalElementNotFoundError, apiFnArgs);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalElementIsInvisibleError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TestRunErrors.actionAdditionalElementIsInvisibleError);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor (argumentName, nodeDescription) {
        super(TestRunErrors.actionAdditionalSelectorMatchesWrongNodeTypeError);

        this.argumentName    = argumentName;
        this.nodeDescription = nodeDescription;
    }
}

export class ActionElementNonEditableError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionElementNonEditableError);
    }
}

export class ActionElementNotTextAreaError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionElementNotTextAreaError);
    }
}

export class ActionElementNonContentEditableError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TestRunErrors.actionElementNonContentEditableError);

        this.argumentName = argumentName;
    }
}

export class ActionRootContainerNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionRootContainerNotFoundError);
    }
}

export class ActionIncorrectKeysError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TestRunErrors.actionIncorrectKeysError);

        this.argumentName = argumentName;
    }
}

export class ActionCanNotFindFileToUploadError extends TestRunErrorBase {
    constructor (filePaths) {
        super(TestRunErrors.actionCanNotFindFileToUploadError);

        this.filePaths = filePaths;
    }
}

export class ActionElementIsNotFileInputError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionElementIsNotFileInputError);
    }
}

export class ActionInvalidScrollTargetError extends TestRunErrorBase {
    constructor (scrollTargetXValid, scrollTargetYValid) {
        super(TestRunErrors.actionInvalidScrollTargetError);

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

export class WindowDimensionsOverflowError extends TestRunErrorBase {
    constructor (callsite) {
        super(TestRunErrors.windowDimensionsOverflowError);

        this.callsite = callsite;
    }
}

export class InvalidElementScreenshotDimensionsError extends TestRunErrorBase {
    constructor (width, height) {
        super(TestRunErrors.invalidElementScreenshotDimensionsError);

        const widthIsInvalid  = width <= 0;
        const heightIsInvalid = height <= 0;

        if (widthIsInvalid) {
            if (heightIsInvalid) {
                this.verb      = 'are';
                this.dimensions = 'width and height';
            }
            else {
                this.verb      = 'is';
                this.dimensions = 'width';
            }
        }
        else {
            this.verb      = 'is';
            this.dimensions = 'height';
        }
    }
}

export class ForbiddenCharactersInScreenshotPathError extends TestRunErrorBase {
    constructor (screenshotPath, forbiddenCharsList) {
        super(TestRunErrors.forbiddenCharactersInScreenshotPathError);

        this.screenshotPath     = screenshotPath;
        this.forbiddenCharsList = forbiddenCharsList;
    }
}


export class RoleSwitchInRoleInitializerError extends TestRunErrorBase {
    constructor (callsite) {
        super(TestRunErrors.roleSwitchInRoleInitializerError);

        this.callsite = callsite;
    }
}


// Iframe errors
export class ActionElementNotIframeError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionElementNotIframeError);
    }
}

export class ActionIframeIsNotLoadedError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.actionIframeIsNotLoadedError);
    }
}

export class CurrentIframeIsNotLoadedError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.currentIframeIsNotLoadedError);
    }
}

export class CurrentIframeNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.currentIframeNotFoundError);
    }
}

export class CurrentIframeIsInvisibleError extends TestRunErrorBase {
    constructor () {
        super(TestRunErrors.currentIframeIsInvisibleError);
    }
}

// Native dialog errors
export class NativeDialogNotHandledError extends TestRunErrorBase {
    constructor (dialogType, url) {
        super(TestRunErrors.nativeDialogNotHandledError);

        this.dialogType = dialogType;
        this.pageUrl    = url;
    }
}

export class UncaughtErrorInNativeDialogHandler extends TestRunErrorBase {
    constructor (dialogType, errMsg, url) {
        super(TestRunErrors.uncaughtErrorInNativeDialogHandler);

        this.dialogType = dialogType;
        this.errMsg     = errMsg;
        this.pageUrl    = url;
    }
}

export class SetNativeDialogHandlerCodeWrongTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TestRunErrors.setNativeDialogHandlerCodeWrongTypeError);

        this.actualType = actualType;
    }
}
