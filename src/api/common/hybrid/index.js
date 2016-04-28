import asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import { noop } from 'lodash';
import testRunTracker from './test-run-tracker';
import TestRun from '../../../test-run';
import compileHybridFunction from '../../../compiler/es-next/compile-hybrid-function';
import { ExecuteHybridFunctionCommand } from '../../../test-run/commands';
import { APIError } from '../../../errors/runtime';
import MESSAGE from '../../../errors/runtime/message';
import getCallsite from '../../../errors/get-callsite';

const ASYNC_TO_GEN_CODE         = asyncToGenerator(noop).toString();
const REGENERATOR_FOOTPRINTS_RE = /(_regenerator(\d+).default|regeneratorRuntime).wrap\(function _callee\$\(_context\)/;

function resolveContextTestRun () {
    var testRunId = testRunTracker.getContextTestRunId();
    var testRun   = TestRun.activeTestRuns[testRunId];

    if (!testRun)
        throw new APIError('hybridFunction', null, MESSAGE.hybridFunctionCantResolveTestRun);

    return testRun;
}

function createHybridFunction (fnCode, boundTestRun) {
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

    hybridFn.bindTestRun = function bindTestRun (t) {
        // NOTE: we can't use strict `t instanceof TestController`
        // check due to module circular reference
        if (!t || !(t.testRun instanceof TestRun))
            throw new APIError('bindTestRun', null, MESSAGE.invalidHybridTestRunBinding);

        return createHybridFunction(fnCode, t.testRun);
    };

    return hybridFn;
}

// NOTE: we use runtime APIError in most places because these errors may appear
// at the test compilation time when we don't have any test runs yet.
export default function Hybrid (fn) {
    var fnType        = typeof fn;
    var calledWithNew = this instanceof Hybrid;
    var fnName        = calledWithNew ? 'constructor' : 'Hybrid';
    var typeName      = calledWithNew ? 'Hybrid' : null;

    if (fnType !== 'function')
        throw new APIError(fnName, typeName, MESSAGE.clientCodeIsNotAFunction, fnType);

    var fnCode = fn.toString();

    if (fnCode === ASYNC_TO_GEN_CODE)
        throw new APIError(fnName, typeName, MESSAGE.regeneratorInClientCode);

    fnCode = compileHybridFunction(fnCode);

    // NOTE: check compiled code for regenerator injection: we have either generator
    // recompiled in Node.js 4+ for client or async function declared in function code.
    if (REGENERATOR_FOOTPRINTS_RE.test(fnCode))
        throw new APIError(fnName, typeName, MESSAGE.regeneratorInClientCode);

    return createHybridFunction(fnCode, null);
}
