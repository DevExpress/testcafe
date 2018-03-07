import { isNil as isNullOrUndefined, merge } from 'lodash';
import dedent from 'dedent';
import ClientFunctionBuilder from '../client-function-builder';
import { SelectorNodeTransform } from '../replicator';
import { ClientFunctionAPIError } from '../../errors/runtime';
import functionBuilderSymbol from '../builder-symbol';
import MESSAGE from '../../errors/runtime/message';
import { assertType, is } from '../../errors/runtime/type-assertions';
import { ExecuteSelectorCommand } from '../../test-run/commands/observation';
import defineLazyProperty from '../../utils/define-lazy-property';
import { addAPI, addCustomMethods } from './add-api';
import createSnapshotMethods from './create-snapshot-methods';

export default class SelectorBuilder extends ClientFunctionBuilder {
    constructor (fn, options, callsiteNames) {
        var builderFromSelector          = fn && fn[functionBuilderSymbol];
        var builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[functionBuilderSymbol];
        var builder                      = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (options === void 0 || typeof options === 'object')
                options = merge({}, builder.options, options, { sourceSelectorBuilder: builder });
        }

        super(fn, options, callsiteNames);
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
                    var __f$=${code};
                    return function(){
                        var args = __dependencies$.boundArgs || arguments;
                        return window['%testCafeSelectorFilter%'](__f$.apply(this, args), __dependencies$.filterOptions);
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
        var resultPromise = super._executeCommand(args, testRun, callsite);

        this._addBoundArgsSelectorGetter(resultPromise, args);

        // OPTIMIZATION: use buffer function as selector not to trigger lazy property ahead of time
        addAPI(resultPromise, () => resultPromise.selector, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);

        return resultPromise;
    }

    getFunctionDependencies () {
        var dependencies        = super.getFunctionDependencies();
        var customDOMProperties = this.options.customDOMProperties;
        var customMethods       = this.options.customMethods;

        return merge({}, dependencies, {
            filterOptions: {
                filterVisible:  this.options.filterVisible,
                filterHidden:   this.options.filterHidden,
                counterMode:    this.options.counterMode,
                collectionMode: this.options.collectionMode,
                index:          isNullOrUndefined(this.options.index) ? null : this.options.index
            },

            boundArgs:           this.options.boundArgs,
            customDOMProperties: customDOMProperties,
            customMethods:       customMethods
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

    _validateOptions (options) {
        super._validateOptions(options);

        if (!isNullOrUndefined(options.visibilityCheck))
            assertType(is.boolean, this.callsiteNames.instantiation, '"visibilityCheck" option', options.visibilityCheck);

        if (!isNullOrUndefined(options.timeout))
            assertType(is.nonNegativeNumber, this.callsiteNames.instantiation, '"timeout" option', options.timeout);
    }

    _getReplicatorTransforms () {
        var transforms = super._getReplicatorTransforms();

        transforms.push(new SelectorNodeTransform());

        return transforms;
    }

    _addBoundArgsSelectorGetter (obj, selectorArgs) {
        defineLazyProperty(obj, 'selector', () => {
            var builder = new SelectorBuilder(this.getFunction(), { boundArgs: selectorArgs });

            return builder.getFunction();
        });
    }

    _decorateFunction (selectorFn) {
        super._decorateFunction(selectorFn);

        addAPI(selectorFn, () => selectorFn, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);
    }

    _processResult (result, selectorArgs) {
        var snapshot = super._processResult(result, selectorArgs);

        if (snapshot && !this.options.counterMode) {
            this._addBoundArgsSelectorGetter(snapshot, selectorArgs);
            createSnapshotMethods(snapshot);

            if (this.options.customMethods)
                addCustomMethods(snapshot, () => snapshot.selector, SelectorBuilder, this.options.customMethods);
        }

        return snapshot;
    }
}
