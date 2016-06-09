import HybridFunction from './';
import { replicatorForSelector } from './replicators';
import { APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteHybridFunctionCommand } from '../test-run/commands';

export default class SelectorHybridFunction extends HybridFunction {
    constructor (fn, dependencies, boundTestRun, callsiteNames) {
        super(fn, dependencies, boundTestRun, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        // TODO needs its own error and should accept strings
        if (fnType !== 'function')
            throw new APIError(this.callsiteNames.instantiation, MESSAGE.hybridFunctionCodeIsNotAFunction, fnType);

        return fn.toString();
    }

    _createExecutionTestRunCommand (args) {
        // TODO needs its own command
        return new ExecuteHybridFunctionCommand(this.compiledFnCode, args, true);
    }

    _getReplicator () {
        return replicatorForSelector;
    }
}
