import { isFinite } from 'lodash';
import ClientFunctionFactory from './client-function-factory';
import { SelectorNodeTransform } from './replicator';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteSelectorCommand } from '../test-run/commands/observation';

export default class SelectorFactory extends ClientFunctionFactory {
    constructor (fn, env, callsiteNames) {
        super(fn, env, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function' && fnType !== 'string')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorCodeIsNotAFunctionOrString, fnType);

        return fnType === 'string' ? `function(){return document.querySelector('${fn}');}` : fn.toString();
    }

    _createExecutionTestRunCommand (args, env, options) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args,
            env:                       env,
            visibilityCheck:           !!options.visibilityCheck,
            timeout:                   options.timeout
        });
    }

    _validateOptions (options) {
        super._validateOptions(options);

        var visibilityCheckOptionType = typeof options.visibilityCheck;

        if (visibilityCheckOptionType !== 'undefined' && visibilityCheckOptionType !== 'boolean')
            throw new APIError('with', MESSAGE.optionValueIsNotABoolean, 'visibilityCheck', visibilityCheckOptionType);

        var timeoutType         = typeof options.timeout;
        var isNonNegativeNumber = isFinite(options.timeout) && options.timeout >= 0;

        if (timeoutType !== 'undefined' && !isNonNegativeNumber) {
            var actual = timeoutType === 'number' ? options.timeout : timeoutType;

            throw new APIError('with', MESSAGE.optionValueIsNotANonNegativeNumber, 'timeout', actual);
        }
    }

    _getReplicatorTransforms () {
        var transforms = super._getReplicatorTransforms();

        transforms.push(new SelectorNodeTransform());

        return transforms;
    }
}
