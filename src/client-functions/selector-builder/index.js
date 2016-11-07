import Promise from 'pinkie';
import { isFinite, isRegExp, isNil as isNullOrUndefined, assign, escapeRegExp as escapeRe } from 'lodash';
import dedent from 'dedent';
import ClientFunctionBuilder from '../client-function-builder';
import { SelectorNodeTransform } from '../replicator';
import { APIError, ClientFunctionAPIError } from '../../errors/runtime';
import functionBuilderSymbol from '../builder-symbol';
import MESSAGE from '../../errors/runtime/message';
import { getCallsiteForGetter } from '../../errors/callsite';
import deprecate from '../../warnings/deprecate';
import { ExecuteSelectorCommand } from '../../test-run/commands/observation';
import defineLazyProperty from '../../utils/define-lazy-property';
import createSnapshotShorthands from './create-snapshot-shorthands';
import createSnapshotMethods from './create-snapshot-methods';
import ensureDeprecatedOptions from './ensure-deprecated-options';

export default class SelectorBuilder extends ClientFunctionBuilder {
    constructor (fn, options, callsiteNames) {
        if (callsiteNames && callsiteNames.instantiation === 'with')
            ensureDeprecatedOptions('with', options);

        var builderFromSelector          = fn && fn[functionBuilderSymbol];
        var builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[functionBuilderSymbol];
        var builder                      = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (options === void 0 || typeof options === 'object')
                options = assign({}, builder.options, options, { sourceSelectorBuilder: builder });
        }

        super(fn, options, callsiteNames);
    }

    static _defineNodeSnapshotDerivativeSelectorProperty (obj, propName, fn) {
        defineLazyProperty(obj, propName, () => {
            deprecate(getCallsiteForGetter(), {
                what:       `nodeSnapshot.${propName}`,
                useInstead: 'hierarchical selectors (e.g. selector.find())'
            });

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
        // it has same dependencies as source selector, then we can
        // avoid recompilation and just re-use already compiled code.
        var hasSameDependenciesAsSourceSelector = this.options.sourceSelectorBuilder &&
                                                  this.options.sourceSelectorBuilder.options.dependencies ===
                                                  this.options.dependencies;

        if (hasSameDependenciesAsSourceSelector)
            return this.options.sourceSelectorBuilder.compiledFnCode;

        var code = typeof this.fn === 'string' ?
                   `(function(){return document.querySelectorAll(${JSON.stringify(this.fn)});});` :
                   super._getCompiledFnCode();


        if (code) {
            return dedent(
                `(function(){
                    var __f$=${code}
                    return function(){
                        return window['%testCafeSelectorFilter%'](__f$.apply(this, arguments), __dependencies$.__filterOptions$);
                    };
                 })();`
            );
        }

        return null;
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

        // OPTIMIZATION: use buffer function as selector not to trigger lazy property ahead of time
        createSnapshotShorthands(lazyPromise, () => lazyPromise.selector);

        return lazyPromise;
    }

    getFunctionDependencies () {
        var dependencies = super.getFunctionDependencies();
        var text         = this.options.text;

        if (typeof text === 'string')
            text = new RegExp(escapeRe(text));

        return assign({}, dependencies, {
            __filterOptions$: {
                index: this.options.index || 0,
                text:  text
            }
        });
    }

    _createTestRunCommand (encodedArgs, encodedDependencies) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      encodedArgs,
            dependencies:              encodedDependencies,
            visibilityCheck:           !!this.options.visibilityCheck,
            timeout:                   this.options.timeout
        });
    }

    _validateNonNegativeNumberOption (name, value) {
        if (!isNullOrUndefined(value) && (!isFinite(value) || value < 0)) {
            var valueType = typeof value;
            var actual    = valueType === 'number' ? value : valueType;

            throw new APIError(this.callsiteNames.instantiation, MESSAGE.optionValueIsNotANonNegativeNumber, name, actual);
        }
    }

    _validateOptions (options) {
        super._validateOptions(options);

        if (!isNullOrUndefined(options.visibilityCheck)) {
            var visibilityCheckOptionType = typeof options.visibilityCheck;

            if (visibilityCheckOptionType !== 'boolean')
                throw new APIError(this.callsiteNames.instantiation, MESSAGE.optionValueIsNotABoolean, 'visibilityCheck', visibilityCheckOptionType);
        }

        if (!isNullOrUndefined(options.text)) {
            var textType = typeof options.text;

            if (textType !== 'string' && !isRegExp(options.text))
                throw new APIError(this.callsiteNames.instantiation, MESSAGE.optionValueIsNotAStringOrRegExp, 'text', textType);
        }

        this._validateNonNegativeNumberOption('timeout', options.timeout);
        this._validateNonNegativeNumberOption('index', options.index);
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

    _decorateFunction (selectorFn) {
        super._decorateFunction(selectorFn);

        createSnapshotShorthands(selectorFn, selectorFn);
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

        createSnapshotMethods(nodeSnapshot);

        return nodeSnapshot;
    }
}
