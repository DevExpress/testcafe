import TYPE from './type';
import { ActionCommandBase } from './base';
import { positiveIntegerArgument } from './validations/argument';
import { camelCase } from 'lodash';
import { initSelector } from './validations/initializers';

// Initializers
function initDebugOptions (name, val, options) {
    return initSelector(name, val, Object.assign({}, options,
        { skipVisibilityCheck: true, collectionMode: true }
    ));
}

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

export class DebugCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.debug);

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.debug);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initDebugOptions, required: false },
        ];
    }
}
