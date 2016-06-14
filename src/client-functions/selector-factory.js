import ClientFunctionFactory from './client-function-factory';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';
import { ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteSelectorCommand } from '../test-run/commands';

export default class SelectorFactory extends ClientFunctionFactory {
    constructor (fn, dependencies, boundTestRun, callsiteNames) {
        super(fn, dependencies, boundTestRun, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function' && fnType !== 'string')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorCodeIsNotAFunctionOrString, fnType);

        return fnType === 'string' ? `function(){return document.querySelector('${fn}');}` : fn.toString();
    }

    _createExecutionTestRunCommand (args) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args
        });
    }

    _createReplicator () {
        return createReplicator([
            new FunctionTransform(this.callsiteNames),
            new SelectorNodeTransform()
        ]);
    }
}
