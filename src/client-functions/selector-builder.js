import { isFinite } from 'lodash';
import ClientFunctionBuilder from './client-function-builder';
import { SelectorNodeTransform } from './replicator';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import functionBuilderSymbol from './builder-symbol';
import MESSAGE from '../errors/runtime/message';
import { ExecuteSelectorCommand } from '../test-run/commands/observation';
import defineLazyProperty from '../utils/define-lazy-property';

export default class SelectorBuilder extends ClientFunctionBuilder {
    constructor (fn, scopeVars, callsiteNames) {
        super(fn, scopeVars, callsiteNames);
    }

    static _defineNodeSnapshotDerivativeSelectorProperty (obj, propName, fn) {
        defineLazyProperty(obj, propName, () => {
            var builder = new SelectorBuilder(fnArg => {
                /* eslint-disable no-undef */
                var selectorResult = selector();

                if (selectorResult && typeof selectorResult.then === 'function')
                    return selectorResult.then(node => fn(node, fnArg));

                return fn(selectorResult, fnArg);
                /* eslint-enable no-undef */
            }, { selector: obj.selector, fn });

            return builder.getFunction();
        });
    }

    _createFunctionDescriptor (fn, scopeVars) {
        var builderFromSelector          = fn && fn[functionBuilderSymbol];
        var builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[functionBuilderSymbol];
        var builder                      = builderFromSelector || builderFromPromiseOrSnapshot;

        if (builder instanceof SelectorBuilder)
            return builder.functionDescriptor;

        if (typeof fn === 'string') {
            return {
                scopeVars: {},
                fnCode:    `(function(){return document.querySelector('${fn.replace(/'/g, "\\'")}');})`
            };
        }

        return super._createFunctionDescriptor(fn, scopeVars);
    }

    _createInvalidFnTypeError (fn) {
        return new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorInitializedWithWrongType, typeof fn);
    }

    _executeCommand (args, testRun, callsite, options) {
        var lazyPromise   = Promise.resolve();
        var resultPromise = null;

        // OPTIMIZATION: Selectors are executed lazily (once someone subscribes to their result).
        // It's especially useful for situations when the selector's result is passed to
        // an action, e.g.: `t.click(someSelector(42));` In that case, we create a new selector
        // inside this action, but we are not interested in the result of ongoing execution.
        var execute = () => {
            if (!resultPromise) {
                resultPromise = super
                    ._executeCommand(args, testRun, callsite, options)
                    .then(result => result ? this._decorateFunctionResult(result, args) : result);
            }

            return resultPromise;
        };

        lazyPromise.then  = (onFulfilled, onRejected) => execute().then(onFulfilled, onRejected);
        lazyPromise.catch = onRejected => execute().catch(onRejected);

        this._defineSelectorPropertyWithBoundArgs(lazyPromise, args);

        return lazyPromise;
    }


    _createExecutionTestRunCommand (encodedArgs, encodedScopeVars, options) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.functionDescriptor.fnCode,
            args:                      encodedArgs,
            scopeVars:                 encodedScopeVars,
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

    _defineSelectorPropertyWithBoundArgs (obj, selectorArgs) {
        defineLazyProperty(obj, 'selector', () => {
            var builder = new SelectorBuilder(() => /* eslint-disable no-undef */selector.apply(null, args)/* eslint-enable no-undef */, {
                selector: this.getFunction(),
                args:     selectorArgs
            });

            return builder.getFunction();
        });
    }

    _decorateFunctionResult (nodeSnapshot, selectorArgs) {
        this._defineSelectorPropertyWithBoundArgs(nodeSnapshot, selectorArgs);

        SelectorBuilder._defineNodeSnapshotDerivativeSelectorProperty(nodeSnapshot, 'getParentNode', node => {
            return node ? node.parentNode : node;
        });

        SelectorBuilder._defineNodeSnapshotDerivativeSelectorProperty(nodeSnapshot, 'getChildNode', (node, idx) => {
            return node ? node.childNodes[idx] : node;
        });

        SelectorBuilder._defineNodeSnapshotDerivativeSelectorProperty(nodeSnapshot, 'getChildElement', (node, idx) => {
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
