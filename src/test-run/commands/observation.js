import TYPE from './type';
import CommandBase from './base';
import { positiveIntegerArgument } from './validations/argument';

// Commands
export class WaitCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.wait);
    }

    _getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class ExecuteClientFunctionCommandBase extends CommandBase {
    constructor (obj, testRun, type) {
        super(obj, testRun, type, false);
    }

    _getAssignableProperties () {
        return [
            { name: 'instantiationCallsiteName', defaultValue: '' },
            { name: 'fnCode', defaultValue: '' },
            { name: 'args', defaultValue: [] },
            { name: 'dependencies', defaultValue: [] }
        ];
    }
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.executeClientFunction);
    }
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.executeSelector);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'visibilityCheck', defaultValue: false },
            { name: 'timeout', defaultValue: null },
            { name: 'apiFnChain' },
            { name: 'needError' },
            { name: 'index', defaultValue: 0 }
        ]);
    }
}

export class DebugCommand extends CommandBase {
    constructor () {
        super(null, null, TYPE.debug);
    }
}

export class DisableDebugCommand extends CommandBase {
    constructor () {
        super(null, null, TYPE.disableDebug);
    }
}

