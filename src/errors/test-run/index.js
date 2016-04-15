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

// Synchronization errors
//--------------------------------------------------------------------
export class MissingAwaitError extends TestRunErrorBase {
    constructor (callsite) {
        super(CATEGORY.synchronizationError, TYPE.missingAwaitError);

        this.callsite = callsite;
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
export class ActionNumberOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TYPE.actionNumberOptionError, optionName, actualValue);
    }
}

export class ActionPositiveNumberOptionError extends ActionOptionErrorBase {
    constructor (optionName, actualValue) {
        super(TYPE.actionPositiveNumberOptionError, optionName, actualValue);
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

export class ActionSelectorTypeError extends ActionError {
    constructor (actualType) {
        super(TYPE.actionSelectorTypeError);

        this.actualType = actualType;
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
