// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import CATEGORY from './category';
import TYPE from './type';

// Base
//--------------------------------------------------------------------
class TestRunErrorBase {
    constructor (category, type) {
        this.isTestCafeError = true;
        this.category        = category;
        this.type            = type;
        this.callsite        = null;
    }
}

class ActionOptionErrorBase extends TestRunErrorBase {
    constructor (type, optionName, actualValue) {
        super(CATEGORY.actionError, type);

        this.optionName  = optionName;
        this.actualValue = actualValue;
    }
}

class ActionError extends TestRunErrorBase {
    constructor (type) {
        super(CATEGORY.actionError, type);
    }
}

class UncaughtError extends TestRunErrorBase {
    constructor (type) {
        super(CATEGORY.uncaughtError, type);
    }
}

class ActionArgumentErrorBase extends ActionError {
    constructor (type, argumentName, actualValue) {
        super(type);

        this.argumentName = argumentName;
        this.actualValue  = actualValue;
    }
}

class SynchronizationError extends TestRunErrorBase {
    constructor (type) {
        super(CATEGORY.synchronizationError, type);
    }
}

// Synchronization errors
//--------------------------------------------------------------------
export class MissingAwaitError extends SynchronizationError {
    constructor (callsite) {
        super(TYPE.missingAwaitError);

        this.callsite = callsite;
    }
}

export class ClientCodeExecutionInterruptionError extends SynchronizationError {
    constructor () {
        super(TYPE.clientCodeExecutionInterruptionError);
    }
}


// Uncaught errors
//--------------------------------------------------------------------
export class UncaughtErrorOnPage extends UncaughtError {
    constructor (errMsg, pageDestUrl) {
        super(TYPE.uncaughtErrorOnPage);

        this.errMsg      = errMsg;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInTestCode extends UncaughtError {
    constructor (err, callsite) {
        super(TYPE.uncaughtErrorInTestCode);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}

export class UncaughtNonErrorObjectInTestCode extends UncaughtError {
    constructor (obj) {
        super(TYPE.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr  = String(obj);
    }
}

export class UncaughtErrorInClientExecutedCode extends UncaughtError {
    constructor (err) {
        super(TYPE.uncaughtErrorInClientExecutedCode);

        this.errMsg = String(err);
    }
}


// Assertion errors
//--------------------------------------------------------------------
export class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor (err, callsite) {
        super(CATEGORY.assertionError, TYPE.externalAssertionLibraryError);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}


// Action parameters errors
//--------------------------------------------------------------------
// Options errors
export class ActionIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TYPE.actionIntegerOptionError, optionName, actualValue);
    }
}

export class ActionPositiveIntegerOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TYPE.actionPositiveIntegerOptionError, optionName, actualValue);
    }
}

export class ActionBooleanOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TYPE.actionBooleanOptionError, optionName, actualValue);
    }
}

export class ActionOptionsTypeError extends ActionError {
    constructor (actualType) {
        super(TYPE.actionOptionsTypeError);

        this.actualType = actualType;
    }
}


// Arguments errors
export class ActionStringArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TYPE.actionStringArgumentError, argumentName, actualValue);
    }
}

export class ActionIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TYPE.actionIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionPositiveIntegerArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TYPE.actionPositiveIntegerArgumentError, argumentName, actualValue);
    }
}

export class ActionStringOrStringArrayArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TYPE.actionStringOrStringArrayArgumentError, argumentName, actualValue);
    }
}

export class ActionStringArrayElementError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue, elementIndex) {
        super(TYPE.actionStringArrayElementError, argumentName, actualValue);

        this.elementIndex = elementIndex;
    }
}


// Selector errors
export class ActionSelectorTypeError extends ActionError {
    constructor (actualType) {
        super(TYPE.actionSelectorTypeError);

        this.actualType = actualType;
    }
}

export class ActionAdditionalSelectorTypeError extends ActionError {
    constructor (argumentName, actualType) {
        super(TYPE.actionAdditionalSelectorTypeError);

        this.argumentName = argumentName;
        this.actualType   = actualType;
    }
}

export class ActionUnsupportedUrlProtocolError extends ActionError {
    constructor (argumentName, protocol) {
        super(TYPE.actionUnsupportedUrlProtocolError);

        this.argumentName = argumentName;
        this.protocol     = protocol;
    }
}

// Action execution errors
//--------------------------------------------------------------------
export class ActionElementNotFoundError extends ActionError {
    constructor () {
        super(TYPE.actionElementNotFoundError);
    }
}

export class ActionElementIsInvisibleError extends ActionError {
    constructor () {
        super(TYPE.actionElementIsInvisibleError);
    }
}

export class ActionAdditionalElementNotFoundError extends ActionError {
    constructor (argumentName) {
        super(TYPE.actionAdditionalElementNotFoundError);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalElementIsInvisibleError extends ActionError {
    constructor (argumentName) {
        super(TYPE.actionAdditionalElementIsInvisibleError);

        this.argumentName = argumentName;
    }
}

export class ActionElementNonEditableError extends ActionError {
    constructor () {
        super(TYPE.actionElementNonEditableError);
    }
}

export class ActionElementNotTextAreaError extends ActionError {
    constructor () {
        super(TYPE.actionElementNotTextAreaError);
    }
}

export class ActionElementNonContentEditableError extends ActionError {
    constructor (argumentName) {
        super(TYPE.actionElementNonContentEditableError);

        this.argumentName = argumentName;
    }
}

export class ActionRootContainerNotFoundError extends ActionError {
    constructor () {
        super(TYPE.actionRootContainerNotFoundError);
    }
}

export class ActionIncorrectKeysError extends ActionError {
    constructor (argumentName) {
        super(TYPE.actionIncorrectKeysError);

        this.argumentName = argumentName;
    }
}

export class ActionCanNotFindFileToUploadError extends ActionError {
    constructor (filePaths) {
        super(TYPE.actionCanNotFindFileToUploadError);

        this.filePaths = filePaths;
    }
}

export class ActionElementIsNotFileInputError extends ActionError {
    constructor () {
        super(TYPE.actionElementIsNotFileInputError);
    }
}
