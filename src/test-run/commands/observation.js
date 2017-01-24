import TYPE from './type';
import Assignable from '../../utils/assignable';
import { positiveIntegerArgument } from './validations/argument';

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
        this.dependencies              = [];

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return [
            { name: 'instantiationCallsiteName' },
            { name: 'fnCode' },
            { name: 'args' },
            { name: 'dependencies' }
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
        this.index           = 0;

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'visibilityCheck' },
            { name: 'timeout' },
            { name: 'index' }
        ]);
    }
}

export class DebugCommand {
    constructor () {
        this.type = TYPE.debug;
    }
}

