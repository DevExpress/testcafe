import testRunTracker from './test-run-tracker';
import compiledCode from './compiled-code-symbol';
import TestRun from '../../../test-run';
import compileHybridFunction from '../../../compiler/es-next/compile-hybrid-function';
import { ExecuteHybridFunctionCommand } from '../../../test-run/commands';
import { APIError } from '../../../errors/runtime';
import MESSAGE from '../../../errors/runtime/message';
import getCallsite from '../../../errors/get-callsite';


function resolveContextTestRun () {
    var testRunId = testRunTracker.getContextTestRunId();
    var testRun   = TestRun.activeTestRuns[testRunId];

    if (!testRun)
        throw new APIError('hybridFunction', MESSAGE.hybridFunctionCantResolveTestRun);

    return testRun;
}

function getHybridFunctionInstance (fnCode, boundTestRun) {
    var hybridFn = function hybridFunction () {
        var testRun = boundTestRun || resolveContextTestRun(boundTestRun);
        var args    = [];

        // OPTIMIZATION: don't leak `arguments` object.
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        var callsite = getCallsite('hybridFunction');
        var command  = new ExecuteHybridFunctionCommand(fnCode, args);

        return testRun.executeCommand(command, callsite);
    };

    hybridFn[compiledCode] = fnCode;

    hybridFn.bindTestRun = function bindTestRun (t) {
        // NOTE: we can't use strict `t instanceof TestController`
        // check due to module circular reference
        if (!t || !(t.testRun instanceof TestRun))
            throw new APIError('bindTestRun', MESSAGE.invalidHybridTestRunBinding);

        return getHybridFunctionInstance(fnCode, t.testRun);
    };

    return hybridFn;
}

// NOTE: we use runtime APIError in most places because these errors may appear
// at the test compilation time when we don't have any test runs yet.
export default function Hybrid (fn, dependencies = {}) {
    var fnType           = typeof fn;
    var dependenciesType = typeof dependencies;

    if (fnType !== 'function')
        throw new APIError('Hybrid', MESSAGE.clientCodeIsNotAFunction, fnType);

    if (dependenciesType !== 'object')
        throw new APIError('Hybrid', MESSAGE.hybridDependenciesIsNotAnObject, dependenciesType);

    var fnCode = compileHybridFunction(fn.toString(), dependencies);

    return getHybridFunctionInstance(fnCode, null);
}
