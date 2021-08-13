import TYPE from './type';
import { ActionCommandBase } from './base';
import { AssertionOptions } from './options';
import { APIError } from '../../errors/runtime';
import { AssertionExecutableArgumentError } from '../../errors/test-run';
import { executeJsExpression } from '../execute-js-expression';
import { isJSExpression } from './utils';
import ASSERTION_TYPE from '../../assertions/type';

import {
    stringArgument,
    actionOptions,
    nonEmptyStringArgument,
} from './validations/argument';


// Initializers
function initAssertionOptions (name, val) {
    return new AssertionOptions(val, true);
}

//Initializers
function initAssertionParameter (name, val, { skipVisibilityCheck, testRun }) {
    try {
        if (isJSExpression(val))
            val = executeJsExpression(val.value, testRun, { skipVisibilityCheck });

        return val;
    }
    catch (err) {
        throw new AssertionExecutableArgumentError(name, val.value, err, err instanceof APIError);
    }
}

const NOT_REPORTED_PROPERTIES = ['id', 'originActual'];

// Commands
export class AssertionCommand extends ActionCommandBase {
    static methodName = 'assertionCommand';

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.assertion, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'id', type: nonEmptyStringArgument, required: false },
            { name: 'assertionType', type: nonEmptyStringArgument, required: true },
            { name: 'originActual', defaultValue: void 0 },
            { name: 'actual', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected2', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'message', type: stringArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initAssertionOptions, required: true },
        ];
    }

    static get NOT_REPORTED_PROPERTIES () {
        return NOT_REPORTED_PROPERTIES;
    }
}

export class Eql extends AssertionCommand {
    static methodName = ASSERTION_TYPE.eql;
}

export class NotEql extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notEql;
}

export class Ok extends AssertionCommand {
    static methodName = ASSERTION_TYPE.ok;
}

export class NotOk extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notOk;
}

export class Contains extends AssertionCommand {
    static methodName = ASSERTION_TYPE.contains;
}

export class NotContains extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notContains;
}

export class TypeOf extends AssertionCommand {
    static methodName = ASSERTION_TYPE.typeOf;
}

export class NotTypeOf extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notTypeOf;
}

export class Gt extends AssertionCommand {
    static methodName = ASSERTION_TYPE.gt;
}

export class Gte extends AssertionCommand {
    static methodName = ASSERTION_TYPE.gte;
}

export class Lt extends AssertionCommand {
    static methodName = ASSERTION_TYPE.lt;
}

export class Lte extends AssertionCommand {
    static methodName = ASSERTION_TYPE.lte;
}

export class Within extends AssertionCommand {
    static methodName = ASSERTION_TYPE.within;
}

export class NotWithin extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notWithin;
}

export class Match extends AssertionCommand {
    static methodName = ASSERTION_TYPE.match;
}

export class NotMatch extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notMatch;
}
