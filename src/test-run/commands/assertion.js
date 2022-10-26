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

const ASSERTION_NOT_REPORTED_PROPERTIES = ['id', 'originActual'];

// Commands
export class AssertionCommand extends ActionCommandBase {
    static methodName = 'expect';

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.assertion, validateProperties);
    }

    getAssignableProperties () {
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

    getNonReportedProperties () {
        return super.getNonReportedProperties().concat(ASSERTION_NOT_REPORTED_PROPERTIES);
    }
}

export class EqlAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.eql;
}

export class NotEqlAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notEql;
}

export class OkAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.ok;
}

export class NotOkAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notOk;
}

export class ContainsAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.contains;
}

export class NotContainsAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notContains;
}

export class TypeOfAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.typeOf;
}

export class NotTypeOfAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notTypeOf;
}

export class GtAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.gt;
}

export class GteAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.gte;
}

export class LtAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.lt;
}

export class LteAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.lte;
}

export class WithinAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.within;
}

export class NotWithinAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notWithin;
}

export class MatchAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.match;
}

export class NotMatchAssertionCommand extends AssertionCommand {
    static methodName = ASSERTION_TYPE.notMatch;
}
