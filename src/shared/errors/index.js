// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import { TEST_RUN_ERRORS } from '../../errors/types';

// Base
//--------------------------------------------------------------------
export class TestRunErrorBase {
    constructor (code, callsite) {
        this.code            = code;
        this.isTestCafeError = true;
        this.callsite        = callsite || null;
    }
}

class ActionOptionErrorBase extends TestRunErrorBase {
    constructor (code, optionName, actualValue) {
        super(code);

        this.optionName  = optionName;
        this.actualValue = actualValue;
    }
}


// Client function errors
//--------------------------------------------------------------------
export class ClientFunctionExecutionInterruptionError extends TestRunErrorBase {
    constructor (instantiationCallsiteName, callsite) {
        super(TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError, callsite);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class DomNodeClientFunctionResultError extends TestRunErrorBase {
    constructor (instantiationCallsiteName, callsite) {
        super(TEST_RUN_ERRORS.domNodeClientFunctionResultError, callsite);

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


// Uncaught errors
//--------------------------------------------------------------------
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (errStack, pageDestUrl) {
        super(TEST_RUN_ERRORS.uncaughtErrorOnPage);

        this.errStack    = errStack;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInClientFunctionCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err, callsite) {
        super(TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode, callsite);

        this.errMsg                    = String(err);
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class UncaughtErrorInCustomDOMPropertyCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err, prop) {
        super(TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode);

        this.errMsg                    = String(err);
        this.property                  = prop;
        this.instantiationCallsiteName = instantiationCallsiteName;
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


// Action parameters errors
//--------------------------------------------------------------------
// Options errors
//--------------------------------------------------------------------
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

export class ActionSpeedOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TEST_RUN_ERRORS.actionSpeedOptionError, optionName, actualValue);
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


// Iframe errors
//--------------------------------------------------------------------
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

export class CannotCloseWindowWithChildrenError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.cannotCloseWindowWithChildrenError);
    }
}

export class CannotCloseWindowWithoutParentError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.cannotCloseWindowWithoutParent);
    }
}

export class SwitchToWindowPredicateError extends TestRunErrorBase {
    constructor (errMsg) {
        super(TEST_RUN_ERRORS.switchToWindowPredicateError);

        this.errMsg = errMsg;
    }
}

export class WindowNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.targetWindowNotFoundError);
    }
}

export class ParentWindowNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.parentWindowNotFoundError);
    }
}

export class PreviousWindowNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.previousWindowNotFoundError);
    }
}

export class ChildWindowClosedBeforeSwitchingError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.childWindowClosedBeforeSwitchingError);
    }
}

export class CannotRestoreChildWindowError extends TestRunErrorBase {
    constructor () {
        super(TEST_RUN_ERRORS.cannotRestoreChildWindowError);
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
//--------------------------------------------------------------------
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
