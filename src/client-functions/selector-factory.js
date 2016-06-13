import ClientFunctionFactory from './client-function-factory';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';
import { ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteClientFunctionCommand } from '../test-run/commands';

export default class SelectorFactory extends ClientFunctionFactory {
    constructor (fn, dependencies, boundTestRun, callsiteNames) {
        super(fn, dependencies, boundTestRun, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        // TODO needs its own error and should accept strings
        if (fnType !== 'function')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionCodeIsNotAFunction, fnType);

        return fn.toString();
    }

    _createExecutionTestRunCommand (args) {
        // TODO needs its own command
        return new ExecuteClientFunctionCommand(this.callsiteNames.instantiation, this.compiledFnCode, args, true);
    }

    _getReplicator () {
        return createReplicator([
            new FunctionTransform(this.callsiteNames),
            new SelectorNodeTransform()
        ]);
    }
}
