import { isNil as isNullOrUndefined } from 'lodash';
import testRunTracker from './test-run-tracker';
import functionBuilderSymbol from './builder-symbol';
import { createReplicator, FunctionTransform } from './replicator';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import TestRun from '../test-run';
import compileClientFunction from '../compiler/es-next/compile-client-function';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import getCallsite from '../errors/get-callsite';

const DEFAULT_EXECUTION_CALLSITE_NAME = '__$$clientFunction$$';

export default class ClientFunctionBuilder {
    constructor (fn, scopeVars, callsiteNames = {}) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        this.functionDescriptor = this._createFunctionDescriptor(fn, scopeVars);

        if (!this.functionDescriptor)
            throw this._createInvalidFnTypeError(fn);

        this.replicator = createReplicator(this._getReplicatorTransforms());
    }

    _validateScopeVars (scopeVars) {
        var scopeVarsType = typeof scopeVars;

        if (scopeVarsType !== 'object' && scopeVarsType !== 'undefined')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionScopeVarsIsNotAnObject, scopeVarsType);
    }


    _resolveContextTestRun () {
        var testRunId = testRunTracker.getContextTestRunId();
        var testRun   = TestRun.activeTestRuns[testRunId];

        if (!testRun)
            throw new ClientFunctionAPIError(this.callsiteNames.execution, this.callsiteNames.instantiation, MESSAGE.clientFunctionCantResolveTestRun);

        return testRun;
    }

    _decorateFunction (clientFn) {
        clientFn[functionBuilderSymbol] = this;

        clientFn.with = options => {
            this._validateOptions(options);

            return this.getFunction(options);
        };
    }

    getFunction (options) {
        var builder = this;

        options = options || {};

        var clientFn = function __$$clientFunction$$ () {
            var testRun  = options.boundTestRun || builder._resolveContextTestRun();
            var callsite = getCallsite(builder.callsiteNames.execution);
            var args     = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            return builder._executeCommand(args, testRun, callsite, options);
        };

        this._decorateFunction(clientFn);

        return clientFn;
    }

    getCommand (args, options) {
        var encodedArgs      = this.replicator.encode(args);
        var encodedScopeVars = this.replicator.encode(this.functionDescriptor.scopeVars);

        return this._createExecutionTestRunCommand(encodedArgs, encodedScopeVars, options);
    }

    // Overridable methods
    _createFunctionDescriptor (fn, scopeVars) {
        if (typeof fn === 'function') {
            this._validateScopeVars(scopeVars);

            scopeVars = scopeVars || {};

            return {
                scopeVars: scopeVars,
                fnCode:    compileClientFunction(fn.toString(), scopeVars, this.callsiteNames.instantiation, this.callsiteNames.instantiation)
            };
        }

        return null;
    }

    _createInvalidFnTypeError (fn) {
        return new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionCodeIsNotAFunction, typeof fn);
    }

    async _executeCommand (args, testRun, callsite, options) {
        var command = this.getCommand(args, options);
        var result  = await testRun.executeCommand(command, callsite);

        return this.replicator.decode(result);
    }

    _validateOptions (options) {
        var optionsType = typeof options;

        if (optionsType !== 'object')
            throw new APIError('with', MESSAGE.optionsArgumentIsNotAnObject, optionsType);

        if (!isNullOrUndefined(options.boundTestRun)) {
            // NOTE: we can't use strict `t instanceof TestController`
            // check due to module circular reference
            if (!(options.boundTestRun.testRun instanceof TestRun))
                throw new APIError('with', MESSAGE.invalidClientFunctionTestRunBinding);

            // NOTE: boundTestRun is actually a TestController, so we need to unpack it
            options.boundTestRun = options.boundTestRun.testRun;
        }
    }

    _createExecutionTestRunCommand (encodedArgs, encodedScopeVars) {
        return new ExecuteClientFunctionCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.functionDescriptor.fnCode,
            args:                      encodedArgs,
            scopeVars:                 encodedScopeVars
        });
    }

    _getReplicatorTransforms () {
        return [
            new FunctionTransform(this.callsiteNames)
        ];
    }
}
