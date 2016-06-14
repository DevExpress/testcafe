import testRunTracker from './test-run-tracker';
import compiledCodeSymbol from './compiled-code-symbol';
import { createReplicator, FunctionTransform } from './replicator';
import { ExecuteClientFunctionCommand } from '../test-run/commands';
import TestRun from '../test-run';
import { compileClientFunction } from '../compiler/es-next/client-functions';
import { APIError, ClientFunctionAPIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import getCallsite from '../errors/get-callsite';

const DEFAULT_EXECUTION_CALLSITE_NAME = '__$$clientFunction$$';

export default class ClientFunctionFactory {
    constructor (fn, dependencies, callsiteNames) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        this._validateDependencies(dependencies);

        var fnCode = this._getFnCode(fn);

        this.compiledFnCode = compileClientFunction(fnCode, dependencies || {}, this.callsiteNames.instantiation);
    }

    _validateDependencies (dependencies) {
        var dependenciesType = typeof dependencies;

        if (dependenciesType !== 'object' && dependenciesType !== 'undefined')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionDependenciesIsNotAnObject, dependenciesType);
    }

    _resolveContextTestRun () {
        var testRunId = testRunTracker.getContextTestRunId();
        var testRun   = TestRun.activeTestRuns[testRunId];

        if (!testRun)
            throw new ClientFunctionAPIError(this.callsiteNames.execution, this.callsiteNames.instantiation, MESSAGE.clientFunctionCantResolveTestRun);

        return testRun;
    }

    _decorateFunction (clientFn) {
        clientFn[compiledCodeSymbol] = this.compiledFnCode;

        var factory = this;

        clientFn.bindTestRun = function bindTestRun (t) {
            // NOTE: we can't use strict `t instanceof TestController`
            // check due to module circular reference
            if (!t || !(t.testRun instanceof TestRun))
                throw new APIError('bindTestRun', MESSAGE.invalidClientFunctionTestRunBinding);

            return factory.getFunction(t.testRun);
        };
    }

    getFunction (boundTestRun) {
        var factory = this;

        var clientFn = function __$$clientFunction$$ () {
            var testRun    = boundTestRun || factory._resolveContextTestRun();
            var replicator = factory._getReplicator();
            var args       = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            args = replicator.encode(args);

            var command  = factory._createExecutionTestRunCommand(args);
            var callsite = getCallsite(factory.callsiteNames.execution);

            // NOTE: don't use async/await here to enable
            // sync errors for resolving the context test run
            return testRun
                .executeCommand(command, callsite)
                .then(result => replicator.decode(result));
        };

        this._decorateFunction(clientFn);

        return clientFn;
    }

    // Descendants override points
    _getFnCode (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.clientFunctionCodeIsNotAFunction, fnType);

        return fn.toString();
    }

    _createExecutionTestRunCommand (args) {
        return new ExecuteClientFunctionCommand(this.callsiteNames.instantiation, this.compiledFnCode, args, false);
    }

    _getReplicator () {
        return createReplicator([
            new FunctionTransform(this.callsiteNames)
        ]);
    }
}
