import { TEST_RUN_ERRORS } from '../types';
import * as diff from '../../utils/diff/';
import { TestRunErrorBase } from '../../shared/errors';
export * from '../../shared/errors';

// Base
//--------------------------------------------------------------------
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


// Selector errors
//--------------------------------------------------------------------
export class ActionSelectorError extends TestRunErrorBase {
    constructor (selectorName, err, isAPIError) {
        super(TEST_RUN_ERRORS.actionSelectorError);

        this.selectorName = selectorName;
        this.errMsg       = isAPIError ? err.rawMessage : err.message;
        this.originError  = err;
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


// Assertion errors
//--------------------------------------------------------------------
export class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TEST_RUN_ERRORS.externalAssertionLibraryError);

        this.errMsg   = String(err);
        this.diff     = err?.showDiff && diff.generate(err.actual, err.expected);
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
//--------------------------------------------------------------------
export class ActionBooleanArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionBooleanArgumentError, argumentName, actualValue);
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

export class ActionFunctionArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TEST_RUN_ERRORS.actionFunctionArgumentError, argumentName, actualValue);
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


// Action execution errors
//--------------------------------------------------------------------
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


// Native dialog errors
//--------------------------------------------------------------------
export class SetNativeDialogHandlerCodeWrongTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError);

        this.actualType = actualType;
    }
}

export class RequestHookBaseError extends TestRunErrorBase {
    constructor (code, hookClassName, methodName) {
        super(code);

        this.hookClassName = hookClassName;
        this.methodName    = methodName;
    }
}

export class RequestHookUnhandledError extends RequestHookBaseError {
    constructor (err, hookClassName, methodName) {
        super(TEST_RUN_ERRORS.requestHookUnhandledError, hookClassName, methodName);

        this.errMsg = String(err);
    }
}

export class RequestHookNotImplementedMethodError extends RequestHookBaseError {
    constructor (methodName, hookClassName) {
        super(TEST_RUN_ERRORS.requestHookNotImplementedError, hookClassName, methodName);
    }
}

export class MultipleWindowsModeIsDisabledError extends TestRunErrorBase {
    constructor (methodName) {
        super(TEST_RUN_ERRORS.multipleWindowsModeIsDisabledError);

        this.methodName = methodName;
    }
}

export class MultipleWindowsModeIsNotAvailableInRemoteBrowserError extends TestRunErrorBase {
    constructor (methodName) {
        super(TEST_RUN_ERRORS.multipleWindowsModeIsNotSupportedInRemoteBrowserError);

        this.methodName = methodName;
    }
}

