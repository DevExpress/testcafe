import { isNil as isNullOrUndefined } from 'lodash';
import testRunTracker from './test-run-tracker';
import functionFactorySymbol from './factory-symbol';
import { createReplicator, FunctionTransform } from './replicator';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import TestRun from '../test-run';
import compileClientFunction from '../compiler/es-next/compile-client-function';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import getCallsite from '../errors/get-callsite';

const DEFAULT_EXECUTION_CALLSITE_NAME = '__$$clientFunction$$';

export default class ClientFunctionFactory {
    constructor (fn, scopeVars, callsiteNames = {}) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        var fnCode = this._getFnCode(fn);

        this._validateScopeVars(scopeVars);

        this.scopeVars      = scopeVars;
        this.compiledFnCode = compileClientFunction(fnCode, this.scopeVars, this.callsiteNames.instantiation, this.callsiteNames.instantiation);
        this.replicator     = createReplicator(this._getReplicatorTransforms());
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
        clientFn[functionFactorySymbol] = this;

        clientFn.with = options => {
            this._validateOptions(options);

            return this.getFunction(options);
        };
    }

    getFunction (options) {
        var factory = this;

        var clientFn = function __$$clientFunction$$ () {
            var args = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            return factory._executeFunction(args, options || {});
        };

        this._decorateFunction(clientFn);

        return clientFn;
    }

    getCommand (args, options) {
        args = this.replicator.encode(args);

        var scopeVars = this.replicator.encode(this.scopeVars);

        return this._createExecutionTestRunCommand(args, scopeVars, options);
    }

    // Overridable methods
    _executeFunction (args, options) {
        var testRun  = options.boundTestRun || this._resolveContextTestRun();
        var command  = this.getCommand(args, options);
        var callsite = getCallsite(this.callsiteNames.execution);

        // NOTE: don't use async/await here to enable
        // sync errors for resolving the context test run
        return testRun
            .executeCommand(command, callsite)
            .then(result => this.replicator.decode(result));
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

    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionCodeIsNotAFunction, fnType);

        return fn.toString();
    }

    _createExecutionTestRunCommand (args, scopeVars) {
        return new ExecuteClientFunctionCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args,
            scopeVars:                 scopeVars
        });
    }

    _getReplicatorTransforms () {
        return [
            new FunctionTransform(this.callsiteNames)
        ];
    }
}
