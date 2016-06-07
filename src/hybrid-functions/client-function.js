import HybridFunctionBase from './base';
import { replicatorForHybrid } from './replicators';
import { APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteHybridFunctionCommand } from '../test-run/commands';

export default class ClientHybridFunction extends HybridFunctionBase {
    constructor (fn, dependencies, boundTestRun, callsiteNames) {
        super(fn, dependencies, boundTestRun, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError(this.callsiteNames.instantiation, MESSAGE.hybridFunctionCodeIsNotAFunction, fnType);

        return fn.toString();
    }

    _createExecutionTestRunCommand (args) {
        return new ExecuteHybridFunctionCommand(this.compiledFnCode, args);
    }

    _getReplicator () {
        return replicatorForHybrid;
    }
}
