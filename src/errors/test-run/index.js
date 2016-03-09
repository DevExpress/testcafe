// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import CATEGORY from './category';
import TYPE from './type';


// Base
class TestRunErrorBase {
    constructor (category, type) {
        this.category = category;
        this.type     = type;
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

// Action option errors
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


// Test execution client errors
export class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor (scriptErr, pageDestUrl) {
        super(CATEGORY.unhandledException, TYPE.uncaughtErrorOnPage);

        this.scriptErr   = scriptErr;
        this.pageDestUrl = pageDestUrl;
    }
}

// Action errors
export class ActionSelectorTypeError extends ActionError {
    constructor (actualType) {
        super(TYPE.actionSelectorTypeError);

        this.actualType = actualType;
    }
}

export class ActionOptionsTypeError extends ActionError {
    constructor (actualType) {
        super(TYPE.actionOptionsTypeError);

        this.actualType = actualType;
    }
}

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
