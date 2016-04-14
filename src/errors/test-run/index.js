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
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (errMsg, pageDestUrl) {
        super(CATEGORY.uncaughtError, TYPE.uncaughtErrorOnPage);

        this.errMsg      = errMsg;
        this.pageDestUrl = pageDestUrl;
    }
}

export class UncaughtErrorInTestCode extends TestRunErrorBase {
    constructor (errMsg, callsite) {
        super(CATEGORY.uncaughtError, TYPE.uncaughtErrorInTestCode);

        this.errMsg   = errMsg;
        this.callsite = callsite;
    }
}

export class UncaughtNonErrorObjectInTestCode extends TestRunErrorBase {
    constructor (obj) {
        super(CATEGORY.uncaughtError, TYPE.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr  = String(obj);
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
