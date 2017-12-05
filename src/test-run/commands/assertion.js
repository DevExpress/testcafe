import TYPE from './type';
import Assignable from '../../utils/assignable';
import { AssertionOptions } from './options';
import { APIError } from '../../errors/runtime';
import { AssertionExecutableArgumentError } from '../../errors/test-run';
import { executeJsExpression } from '../execute-js-expression';
import { isJSExpression } from './utils';

import { stringArgument, actionOptions, nonEmptyStringArgument } from './validations/argument';

// Initializers
function initAssertionOptions (name, val) {
    return new AssertionOptions(val, true);
}

//Initializers
function initAssertionParameter (name, val, skipVisibilityCheck) {
    try {
        if (isJSExpression(val))
            val = executeJsExpression(val.value, skipVisibilityCheck);

        return val;
    }
    catch (err) {
        var msg = err.constructor === APIError ? err.rawMessage : err.message;

        throw new AssertionExecutableArgumentError(name, val.value, msg);
    }
}

// Commands
export default class AssertionCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.assertion;

        this.assertionType = null;
        this.actual        = void 0;
        this.expected      = void 0;
        this.expected2     = void 0;
        this.message       = null;
        this.options       = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'assertionType', type: nonEmptyStringArgument, required: true },
            { name: 'actual', init: initAssertionParameter },
            { name: 'expected', init: initAssertionParameter },
            { name: 'expected2', init: initAssertionParameter },
            { name: 'message', type: stringArgument },
            { name: 'options', type: actionOptions, init: initAssertionOptions, required: true }
        ];
    }
}
