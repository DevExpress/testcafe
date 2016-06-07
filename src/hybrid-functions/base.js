import testRunTracker from './test-run-tracker';
import { compiledCodeSymbol, DEFAULT_EXECUTION_CALLSITE_NAME } from './common';
import TestRun from '../test-run';
import { compileHybridFunction } from '../compiler/es-next/hybrid-function';
import { APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import getCallsite from '../errors/get-callsite';

export default class HybridFunctionBase {
    constructor (fn, dependencies, boundTestRun, callsiteNames) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };


        this._validateDependencies(dependencies);

        var fnCode = this._getFnCode(fn);

        this.compiledFnCode = compileHybridFunction(fnCode, dependencies || {}, this.callsiteNames.instantiation);

        return this._buildExecutableFunction(boundTestRun);
    }

    _validateDependencies (dependencies) {
        var dependenciesType = typeof dependencies;

        if (dependenciesType !== 'object' && dependenciesType !== 'undefined')
            throw new APIError(this.callsiteNames.instantiation, MESSAGE.hybridDependenciesIsNotAnObject, dependenciesType);
    }

    _resolveContextTestRun () {
        var testRunId = testRunTracker.getContextTestRunId();
        var testRun   = TestRun.activeTestRuns[testRunId];

        if (!testRun)
            throw new APIError(this.callsiteNames.execution, MESSAGE.hybridFunctionCantResolveTestRun);

        return testRun;
    }

    _decorateExecutableFunction (executableFn) {
        executableFn[compiledCodeSymbol] = this.compiledFnCode;

        var hybrid = this;

        executableFn.bindTestRun = function bindTestRun (t) {
            // NOTE: we can't use strict `t instanceof TestController`
            // check due to module circular reference
            if (!t || !(t.testRun instanceof TestRun))
                throw new APIError('bindTestRun', MESSAGE.invalidHybridTestRunBinding);

            return hybrid._buildExecutableFunction(t.testRun);
        };
    }

    _buildExecutableFunction (boundTestRun) {
        var hybrid = this;

        var executableFn = function __$$hybridFunction$$ () {
            var testRun    = boundTestRun || hybrid._resolveContextTestRun();
            var replicator = hybrid._getReplicator();
            var args       = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            args = replicator.encode(args);

            var command  = hybrid._createExecutionTestRunCommand(args);
            var callsite = getCallsite(hybrid.callsiteNames.execution);

            // NOTE: don't use async/await here to enable
            // sync errors for resolving the context test run
            return testRun
                .executeCommand(command, callsite)
                .then(result => replicator.decode(result));
        };

        this._decorateExecutableFunction(executableFn);

        return executableFn;
    }

    // Abstract methods
    _getFnCode (/* fn */) {
        throw new Error('Not implemented');
    }

    _getReplicator () {
        throw new Error('Not implemented');
    }

    _createExecutionTestRunCommand (/* args */) {
        throw new Error('Not implemented');
    }
}
