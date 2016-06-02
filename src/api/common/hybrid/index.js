import { identity } from 'lodash';
import Replicator from 'replicator';
import testRunTracker from './test-run-tracker';
import compiledCode from './compiled-code-symbol';
import TestRun from '../../../test-run';
import { compileHybridFunction, compileFunctionArgumentOfHybridFunction } from '../../../compiler/es-next/hybrid-function';
import { ExecuteHybridFunctionCommand } from '../../../test-run/commands';
import { APIError } from '../../../errors/runtime';
import MESSAGE from '../../../errors/runtime/message';
import getCallsite from '../../../errors/get-callsite';

const DEFAULT_CALLSITE_NAMES = {
    instantiation: 'Hybrid',
    execution:     '__$$hybridFunction$$'
};

// NOTE: we will serialize replicator results
// to JSON with a command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
var replicator = new Replicator({
    serialize:   identity,
    deserialize: identity
});

replicator.addTransforms([
    {
        type: 'Function',

        shouldTransform (type) {
            return type === 'function';
        },

        toSerializable (fn) {
            var isHybrid = !!fn[compiledCode];

            if (isHybrid)
                return fn[compiledCode];

            return compileFunctionArgumentOfHybridFunction(fn.toString(), DEFAULT_CALLSITE_NAMES.execution);
        },

        fromSerializable (fnDescriptor) {
            if (!fnDescriptor.isHybridCode)
                fnDescriptor.fnCode = compileHybridFunction(fnDescriptor.fnCode, {}, DEFAULT_CALLSITE_NAMES);

            return buildHybridFunctionInstance(fnDescriptor.fnCode);
        }
    }
]);


function resolveContextTestRun (callsiteNames) {
    var testRunId = testRunTracker.getContextTestRunId();
    var testRun   = TestRun.activeTestRuns[testRunId];

    if (!testRun)
        throw new APIError(callsiteNames.execution, MESSAGE.hybridFunctionCantResolveTestRun);

    return testRun;
}

function buildHybridFunctionInstance (fnCode, boundTestRun, callsiteNames = DEFAULT_CALLSITE_NAMES) {
    var hybridFn = function __$$hybridFunction$$ () {
        var testRun = boundTestRun || resolveContextTestRun(callsiteNames);
        var args    = [];

        // OPTIMIZATION: don't leak `arguments` object.
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        args = replicator.encode(args);

        var command  = new ExecuteHybridFunctionCommand(fnCode, args);
        var callsite = getCallsite(callsiteNames.execution);

        // NOTE: don't use async/await here to enable
        // sync errors for resolving the context test run
        return testRun
            .executeCommand(command, callsite)
            .then(result => replicator.decode(result));
    };

    hybridFn[compiledCode] = fnCode;

    hybridFn.bindTestRun = function bindTestRun (t) {
        // NOTE: we can't use strict `t instanceof TestController`
        // check due to module circular reference
        if (!t || !(t.testRun instanceof TestRun))
            throw new APIError('bindTestRun', MESSAGE.invalidHybridTestRunBinding);

        return buildHybridFunctionInstance(fnCode, t.testRun, callsiteNames);
    };

    return hybridFn;
}

// NOTE: we use runtime APIError in most places because these errors may appear
// at the test compilation time when we don't have any test runs yet.
export default function createHybridFunction (fn, dependencies = {}, boundTestRun = null, callsiteNames = DEFAULT_CALLSITE_NAMES) {
    var fnType           = typeof fn;
    var dependenciesType = typeof dependencies;

    if (fnType !== 'function')
        throw new APIError(callsiteNames.instantiation, MESSAGE.clientCodeIsNotAFunction, fnType);

    if (dependenciesType !== 'object')
        throw new APIError(callsiteNames.instantiation, MESSAGE.hybridDependenciesIsNotAnObject, dependenciesType);

    var fnCode = compileHybridFunction(fn.toString(), dependencies, callsiteNames);

    return buildHybridFunctionInstance(fnCode, boundTestRun, callsiteNames);
}
