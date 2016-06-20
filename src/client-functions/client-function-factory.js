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
    constructor (fn, env, callsiteNames) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        var fnCode = this._getFnCode(fn);

        this._validateEnv(env);

        this.env            = env;
        this.compiledFnCode = compileClientFunction(fnCode, this.env, this.callsiteNames.instantiation, this.callsiteNames.instantiation);
        this.replicator     = createReplicator(this._getReplicatorTransforms());
    }


    _validateEnv (env) {
        var envType = typeof env;

        if (envType !== 'object' && envType !== 'undefined')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionEnvIsNotAnObject, envType);
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
        options = options || {};

        var factory = this;

        var clientFn = function __$$clientFunction$$ () {
            var testRun = options.boundTestRun || factory._resolveContextTestRun();
            var args    = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            var command  = factory.getCommand(args, options);
            var callsite = getCallsite(factory.callsiteNames.execution);

            // NOTE: don't use async/await here to enable
            // sync errors for resolving the context test run
            return testRun
                .executeCommand(command, callsite)
                .then(result => factory.replicator.decode(result));
        };

        this._decorateFunction(clientFn);

        return clientFn;
    }

    getCommand (args, options) {
        args = this.replicator.encode(args);

        var env = this.replicator.encode(this.env);

        return this._createExecutionTestRunCommand(args, env, options);
    }

    // Overridable methods
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

    _createExecutionTestRunCommand (args, env) {
        return new ExecuteClientFunctionCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      args,
            env:                       env
        });
    }

    _getReplicatorTransforms () {
        return [
            new FunctionTransform(this.callsiteNames)
        ];
    }
}
