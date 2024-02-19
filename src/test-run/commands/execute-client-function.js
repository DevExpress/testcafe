import TYPE from './type';
import { ActionCommandBase } from './base';

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
