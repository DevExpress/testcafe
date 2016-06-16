import TYPE from './type';
import Assignable from '../../utils/assignable';

import {
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError
} from '../../errors/test-run';

function integerArgument (name, val, ErrorCtor = ActionIntegerArgumentError) {
    var valType = typeof val;

    if (valType !== 'number')
        throw new ErrorCtor(name, valType);

    var isInteger = !isNaN(val) &&
                    isFinite(val) &&
                    val === Math.floor(val);

    if (!isInteger)
        throw new ErrorCtor(name, val);
}

function positiveIntegerArgument (name, val) {
    integerArgument(name, val, ActionPositiveIntegerArgumentError);

    if (val < 0)
        throw new ActionPositiveIntegerArgumentError(name, val);
}


// Commands
export class WaitCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type    = TYPE.wait;
        this.timeout = null;
        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerArgument, required: true }
        ];
    }
}

class ExecuteClientFunctionCommandBase extends Assignable {
    constructor (type, obj) {
        super();

        this.type = type;

        this.instantiationCallsiteName = '';
        this.fnCode                    = '';
        this.args                      = [];

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return [
            { name: 'instantiationCallsiteName' },
            { name: 'fnCode' },
            { name: 'args' }
        ];
    }
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj) {
        super(TYPE.executeClientFunction, obj);
    }
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj) {
        super(TYPE.executeSelector);

        this.visibilityCheck = false;
        this.timeout         = null;

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'visibilityCheck' },
            { name: 'timeout' }
        ]);
    }
}

