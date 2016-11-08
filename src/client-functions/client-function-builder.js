import { isNil as isNullOrUndefined, assign } from 'lodash';
import testRunTracker from './test-run-tracker';
import functionBuilderSymbol from './builder-symbol';
import { createReplicator, FunctionTransform } from './replicator';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import TestRun from '../test-run';
import compileClientFunction from '../compiler/es-next/compile-client-function';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import { assertObject, assertNonNullObject } from '../errors/runtime/type-assertions';
import MESSAGE from '../errors/runtime/message';
import getCallsite from '../errors/get-callsite';

const DEFAULT_EXECUTION_CALLSITE_NAME = '__$$clientFunction$$';

export default class ClientFunctionBuilder {
    constructor (fn, options, callsiteNames = {}) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        if (isNullOrUndefined(options))
            options = {};

        this._validateOptions(options);

        this.fn             = fn;
        this.options        = options;
        this.compiledFnCode = this._getCompiledFnCode();

        if (!this.compiledFnCode)
            throw this._createInvalidFnTypeError();

        this.replicator = createReplicator(this._getReplicatorTransforms());
    }

    static _resolveContextTestRun () {
        var testRunId = testRunTracker.getContextTestRunId();

        return TestRun.activeTestRuns[testRunId];
    }

    _decorateFunction (clientFn) {
        clientFn[functionBuilderSymbol] = this;

        clientFn.with = options => {
            if (typeof options === 'object')
                options = assign({}, this.options, options);

            var builder = new this.constructor(this.fn, options, {
                instantiation: 'with',
                execution:     this.callsiteNames.execution
            });

            return builder.getFunction();
        };
    }

    getFunction () {
        var builder = this;

        var clientFn = function __$$clientFunction$$ () {
            var testRun = builder.options.boundTestRun ?
                          builder.options.boundTestRun.testRun :
                          ClientFunctionBuilder._resolveContextTestRun();

            var callsite = getCallsite(builder.callsiteNames.execution);
            var args     = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            return builder._executeCommand(args, testRun, callsite);
        };

        this._decorateFunction(clientFn);

        return clientFn;
    }

    getCommand (args) {
        var encodedArgs         = this.replicator.encode(args);
        var encodedDependencies = this.replicator.encode(this.getFunctionDependencies());

        return this._createTestRunCommand(encodedArgs, encodedDependencies);
    }


    // Overridable methods
    getFunctionDependencies () {
        return this.options.dependencies || {};
    }

    _createTestRunCommand (encodedArgs, encodedDependencies) {
        return new ExecuteClientFunctionCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      encodedArgs,
            dependencies:              encodedDependencies
        });
    }

    _getCompiledFnCode () {
        if (typeof this.fn === 'function')
            return compileClientFunction(this.fn.toString(), this.options.dependencies, this.callsiteNames.instantiation, this.callsiteNames.instantiation);

        return null;
    }

    _createInvalidFnTypeError () {
        return new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionCodeIsNotAFunction, typeof this.fn);
    }

    _executeCommand (args, testRun, callsite) {
        if (!testRun)
            throw new ClientFunctionAPIError(this.callsiteNames.execution, this.callsiteNames.instantiation, MESSAGE.clientFunctionCantResolveTestRun);

        var command = this.getCommand(args);

        return testRun
            .executeCommand(command, callsite)
            .then(result => this.replicator.decode(result));
    }

    _validateOptions (options) {
        assertNonNullObject(this.callsiteNames.instantiation, '"options" argument', options);

        if (!isNullOrUndefined(options.boundTestRun)) {
            // NOTE: we can't use strict `t instanceof TestController`
            // check due to module circular reference
            if (!(options.boundTestRun.testRun instanceof TestRun))
                throw new APIError(this.callsiteNames.instantiation, MESSAGE.invalidClientFunctionTestRunBinding);
        }

        if (!isNullOrUndefined(options.dependencies))
            assertObject(this.callsiteNames.instantiation, '"dependencies" option', options.dependencies);
    }

    _getReplicatorTransforms () {
        return [
            new FunctionTransform(this.callsiteNames)
        ];
    }
}
