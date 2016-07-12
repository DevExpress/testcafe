import { isFinite, assign, isNil as isNullOrUndefined } from 'lodash';
import ClientFunctionBuilder from './client-function-builder';
import { SelectorNodeTransform } from './replicator';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import functionBuilderSymbol from './builder-symbol';
import MESSAGE from '../errors/runtime/message';
import { ExecuteSelectorCommand } from '../test-run/commands/observation';
import defineLazyProperty from '../utils/define-lazy-property';

export default class SelectorBuilder extends ClientFunctionBuilder {
    constructor (fn, options, callsiteNames) {
        var builderFromSelector          = fn && fn[functionBuilderSymbol];
        var builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[functionBuilderSymbol];
        var builder                      = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (typeof options === 'object')
                options = assign({}, builder.options, options, { originSelectorBuilder: builder });
        }

        super(fn, options, callsiteNames);
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
            }, {
                dependencies: {
                    selector: obj.selector,
                    fn:       fn
                }
            });

            return builder.getFunction();
        });
    }

    _getCompiledFnCode () {
        // OPTIMIZATION: if selector was produced from another selector and
        // it has same dependencies as origin selector, then we can
        // avoid recompilation and just re-use already compiled code.
        var hasIdenticalDependenciesWithOriginSelector = this.options.originSelectorBuilder &&
                                                         this.options.originSelectorBuilder.options.dependencies ===
                                                         this.options.dependencies;

        if (hasIdenticalDependenciesWithOriginSelector)
            return this.options.originSelectorBuilder.compiledFnCode;

        if (typeof this.fn === 'string')
            return `(function(){return document.querySelector('${this.fn.replace(/'/g, "\\'")}');})`;

        return super._getCompiledFnCode();
    }

    _createInvalidFnTypeError () {
        return new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorInitializedWithWrongType, typeof this.fn);
    }

    _executeCommand (args, testRun, callsite) {
        var lazyPromise   = Promise.resolve();
        var resultPromise = null;

        // OPTIMIZATION: Selectors are executed lazily (once someone subscribes to their result).
        // It's especially useful for situations when the selector's result is passed to
        // an action, e.g.: `t.click(someSelector(42));` In that case, we create a new selector
        // inside this action, but we are not interested in the result of ongoing execution.
        var execute = () => {
            if (!resultPromise) {
                resultPromise = super
                    ._executeCommand(args, testRun, callsite)
                    .then(result => result ? this._decorateFunctionResult(result, args) : result);
            }

            return resultPromise;
        };

        lazyPromise.then  = (onFulfilled, onRejected) => execute().then(onFulfilled, onRejected);
        lazyPromise.catch = onRejected => execute().catch(onRejected);

        this._defineSelectorPropertyWithBoundArgs(lazyPromise, args);

        return lazyPromise;
    }


    _createExecutionTestRunCommand (encodedArgs, encodedDependencies) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      encodedArgs,
            dependencies:              encodedDependencies,
            visibilityCheck:           !!this.options.visibilityCheck,
            timeout:                   this.options.timeout
        });
    }

    _validateOptions (options) {
        super._validateOptions(options);

        if (!isNullOrUndefined(options.visibilityCheck)) {
            var visibilityCheckOptionType = typeof options.visibilityCheck;

            if (visibilityCheckOptionType !== 'boolean')
                throw new APIError(this.callsiteNames.instantiation, MESSAGE.optionValueIsNotABoolean, 'visibilityCheck', visibilityCheckOptionType);
        }

        if (!isNullOrUndefined(options.timeout) && (!isFinite(options.timeout) || options.timeout < 0)) {
            var timeoutType = typeof options.timeout;
            var actual      = timeoutType === 'number' ? options.timeout : timeoutType;

            throw new APIError(this.callsiteNames.instantiation, MESSAGE.optionValueIsNotANonNegativeNumber, 'timeout', actual);
        }
    }

    _getReplicatorTransforms () {
        var transforms = super._getReplicatorTransforms();

        transforms.push(new SelectorNodeTransform());

        return transforms;
    }

    _defineSelectorPropertyWithBoundArgs (obj, selectorArgs) {
        defineLazyProperty(obj, 'selector', () => {
            var builder = new SelectorBuilder(() => /* eslint-disable no-undef */selector.apply(null, args)/* eslint-enable no-undef */,
                {
                    dependencies: {
                        selector: this.getFunction(),
                        args:     selectorArgs
                    }
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
