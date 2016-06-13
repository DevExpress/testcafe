// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import TYPE from './type';

// Base
//--------------------------------------------------------------------
class TestRunErrorBase {
    constructor (type) {
        this.type            = type;
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
        super(TYPE.missingAwaitError);

        this.callsite = callsite;
    }
}


// Hybrid function errors
//--------------------------------------------------------------------
export class ClientFunctionExecutionInterruptionError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TYPE.clientFunctionExecutionInterruptionError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

export class RegeneratorInFunctionArgumentOfClientFunctionError extends TestRunErrorBase {
    constructor (instantiationCallsiteName, callsite) {
        super(TYPE.regeneratorInFunctionArgumentOfClientFunctionError);

        this.instantiationCallsiteName = instantiationCallsiteName;
        this.callsite                  = callsite;
    }
}

export class DomNodeClientFunctionResultError extends TestRunErrorBase {
    constructor (instantiationCallsiteName) {
        super(TYPE.domNodeClientFunctionResultError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}


// Uncaught errors
//--------------------------------------------------------------------
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (errMsg, pageDestUrl) {
        super(TYPE.uncaughtErrorOnPage);

        this.errMsg      = errMsg;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInTestCode extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TYPE.uncaughtErrorInTestCode);

        this.errMsg   = String(err);
        this.callsite = callsite;
    }
}

export class UncaughtNonErrorObjectInTestCode extends TestRunErrorBase {
    constructor (obj) {
        super(TYPE.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr  = String(obj);
    }
}

export class UncaughtErrorInClientFunctionCode extends TestRunErrorBase {
    constructor (instantiationCallsiteName, err) {
        super(TYPE.uncaughtErrorInClientFunctionCode);

        this.errMsg                    = String(err);
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}


// Assertion errors
//--------------------------------------------------------------------
export class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor (err, callsite) {
        super(TYPE.externalAssertionLibraryError);

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

export class ActionOptionsTypeError extends TestRunErrorBase {
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

export class ActionBooleanArgumentError extends ActionArgumentErrorBase {
    constructor (argumentName, actualValue) {
        super(TYPE.actionBooleanArgumentError, argumentName, actualValue);
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

export class ActionUnsupportedUrlProtocolError extends TestRunErrorBase {
    constructor (argumentName, protocol) {
        super(TYPE.actionUnsupportedUrlProtocolError);

        this.argumentName = argumentName;
        this.protocol     = protocol;
    }
}

export class ActionUnsupportedDeviceTypeError extends ActionArgumentErrorBase {
    constructor (argumentName, argumentValue) {
        super(TYPE.actionUnsupportedDeviceTypeError, argumentName, argumentValue);
    }
}


// Selector errors
export class ActionSelectorTypeError extends TestRunErrorBase {
    constructor (actualType) {
        super(TYPE.actionSelectorTypeError);

        this.actualType = actualType;
    }
}

export class ActionAdditionalSelectorTypeError extends TestRunErrorBase {
    constructor (argumentName, actualType) {
        super(TYPE.actionAdditionalSelectorTypeError);

        this.argumentName = argumentName;
        this.actualType   = actualType;
    }
}

// Action execution errors
//--------------------------------------------------------------------
export class ActionElementNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionElementNotFoundError);
    }
}

export class ActionElementIsInvisibleError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionElementIsInvisibleError);
    }
}

export class ActionAdditionalElementNotFoundError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TYPE.actionAdditionalElementNotFoundError);

        this.argumentName = argumentName;
    }
}

export class ActionAdditionalElementIsInvisibleError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TYPE.actionAdditionalElementIsInvisibleError);

        this.argumentName = argumentName;
    }
}

export class ActionElementNonEditableError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionElementNonEditableError);
    }
}

export class ActionElementNotTextAreaError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionElementNotTextAreaError);
    }
}

export class ActionElementNonContentEditableError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TYPE.actionElementNonContentEditableError);

        this.argumentName = argumentName;
    }
}

export class ActionRootContainerNotFoundError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionRootContainerNotFoundError);
    }
}

export class ActionIncorrectKeysError extends TestRunErrorBase {
    constructor (argumentName) {
        super(TYPE.actionIncorrectKeysError);

        this.argumentName = argumentName;
    }
}

export class ActionCanNotFindFileToUploadError extends TestRunErrorBase {
    constructor (filePaths) {
        super(TYPE.actionCanNotFindFileToUploadError);

        this.filePaths = filePaths;
    }
}

export class ActionElementIsNotFileInputError extends TestRunErrorBase {
    constructor () {
        super(TYPE.actionElementIsNotFileInputError);
    }
}
