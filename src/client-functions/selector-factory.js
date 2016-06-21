import { isFinite } from 'lodash';
import ClientFunctionFactory from './client-function-factory';
import { SelectorNodeTransform } from './replicator';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import { ExecuteSelectorCommand } from '../test-run/commands/observation';

export default class SelectorFactory extends ClientFunctionFactory {
    constructor (fn, scopeVars, callsiteNames) {
        super(fn, scopeVars, callsiteNames);
    }

    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function' && fnType !== 'string')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorCodeIsNotAFunctionOrString, fnType);

        return fnType === 'string' ? `function(){return document.querySelector('${fn}');}` : fn.toString();
    }

    _executeFunction (args, options) {
        return super
            ._executeFunction(args, options)
            .then(result => result ? this._decorateFunctionResult(result, args) : result);
    }


    _createExecutionTestRunCommand (args, scopeVars, options) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args,
            scopeVars:                 scopeVars,
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


    // Snapshot selectors
    _createSnapshotSelector (selectorArgs) {
        var factory = new SelectorFactory(() => /* eslint-disable no-undef */selector.apply(null, args)/* eslint-enable no-undef */, {
            selector: this.getFunction(),
            args:     selectorArgs
        });

        return factory.getFunction();
    }

    _createSnapshotSelectorDerivative (snapshotSelector, fn) {
        var factory = new SelectorFactory(fnArg => {
            /* eslint-disable no-undef */
            var selectorResult = snapshotSelector();

            if (selectorResult && typeof selectorResult.then === 'function')
                return selectorResult.then(node => fn(node, fnArg));

            return fn(selectorResult, fnArg);
            /* eslint-enable no-undef */
        }, { snapshotSelector, fn });

        return factory.getFunction();
    }

    _decorateFunctionResult (nodeSnapshot, selectorArgs) {
        nodeSnapshot.selector = this._createSnapshotSelector(selectorArgs);

        nodeSnapshot.getParentNode = this._createSnapshotSelectorDerivative(nodeSnapshot.selector, node => {
            return node ? node.parentNode : node;
        });

        nodeSnapshot.getChildNode = this._createSnapshotSelectorDerivative(nodeSnapshot.selector, (node, idx) => {
            return node ? node.childNodes[idx] : node;
        });

        nodeSnapshot.getChildElement = this._createSnapshotSelectorDerivative(nodeSnapshot.selector, (node, idx) => {
            if (node.children)
                return node.children[idx];

            // NOTE: IE doesn't have `children` for non-element nodes =/
            var childNodeCount = node.childNodes.length;
            var currentElIdx   = 0;

            for (var i = 0; i < childNodeCount; i++) {
                if (node.childNodes[i].nodeType === 1) {
                    if (currentElIdx === idx)
                        return node.childNodes[i];

                    currentElIdx++;
                }
            }

            return null;
        });

        if (nodeSnapshot.classNames)
            nodeSnapshot.hasClass = name => nodeSnapshot.classNames.indexOf(name) > -1;


        return nodeSnapshot;
    }
}
