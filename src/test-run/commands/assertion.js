import TYPE from './type';
import CommandBase from './base';
import { AssertionOptions } from './options';
import { APIError } from '../../errors/runtime';
import { AssertionExecutableArgumentError } from '../../errors/test-run';
import { executeJsExpression } from '../execute-js-expression';
import { isJSExpression } from './utils';
import {
    stringArgument,
    actionOptions,
    nonEmptyStringArgument
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

// Commands
export default class AssertionCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.assertion, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'id', type: nonEmptyStringArgument, required: false },
            { name: 'assertionType', type: nonEmptyStringArgument, required: true },
            { name: 'actual', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'expected2', init: initAssertionParameter, defaultValue: void 0 },
            { name: 'message', type: stringArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initAssertionOptions, required: true }
        ];
    }
}
