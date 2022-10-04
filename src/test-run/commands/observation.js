import TYPE from './type';
import { ActionCommandBase } from './base';
import { positiveIntegerArgument } from './validations/argument';
import { camelCase } from 'lodash';

// Commands
export class WaitCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.wait);

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.wait);
    }

    getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerArgument, required: true },
        ];
    }
}

export class ExecuteClientFunctionCommandBase extends ActionCommandBase {
    constructor (obj, testRun, type) {
        super(obj, testRun, type, false);
    }

    getAssignableProperties () {
        return [
            { name: 'instantiationCallsiteName', defaultValue: '' },
            { name: 'fnCode', defaultValue: '' },
            { name: 'args', defaultValue: [] },
            { name: 'dependencies', defaultValue: [] },
            { name: 'esmRuntime', defaultValue: null },
        ];
    }
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    static methodName = TYPE.executeClientFunction;

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.executeClientFunction);
    }
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    static methodName = TYPE.executeSelector;

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.executeSelector);
    }

    getAssignableProperties () {
        return [
            { name: 'visibilityCheck', defaultValue: false },
            { name: 'timeout', defaultValue: null },
            { name: 'apiFnChain' },
            { name: 'needError' },
            { name: 'index', defaultValue: 0 },
            { name: 'strictError' },
        ];
    }
}

export class DebugCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.debug);

    constructor () {
        super(null, null, TYPE.debug);
    }
}

export class DisableDebugCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.disableDebug);

    constructor () {
        super(null, null, TYPE.disableDebug);
    }
}

