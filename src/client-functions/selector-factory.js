import { isFinite } from 'lodash';
import ClientFunctionFactory from './client-function-factory';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
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

    _createExecutionTestRunCommand (args, options) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args,
            visibilityCheck:           !!options.visibilityCheck,
            timeout:                   options.timeout
        });
    }

    _validateOptions (options) {
        super._validateOptions(options);

        var visibilityCheckOptionType = typeof options.visibilityCheck;

        if (visibilityCheckOptionType !== 'undefined' && visibilityCheckOptionType !== 'boolean')
            throw new APIError('with', MESSAGE.optionValueIsNotABoolean, 'visibilityCheck', visibilityCheckOptionType);


        if (!isFinite(options.timeout) || options.timeout < 0) {
            var type   = typeof options.timeout;
            var actual = type === 'number' ? options.timeout : type;

            throw new APIError('with', MESSAGE.optionValueIsNotANonNegativeNumber, 'timeout', actual);
        }
    }

    _createReplicator () {
        return createReplicator([
            new FunctionTransform(this.callsiteNames),
            new SelectorNodeTransform()
        ]);
    }
}
