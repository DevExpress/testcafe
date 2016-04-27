import asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import { noop } from 'lodash';
import testRunTracker from './test-run-tracker';
import { activeTestRuns } from '../../../test-run';
import { compileHybridFunction } from '../../../compiler/es-next';
import { ExecuteHybridFunctionCommand } from '../../../test-run/commands';
import { APIError } from '../../../errors/runtime';
import MESSAGE from '../../../errors/runtime/message';
import getCallsite from '../../../errors/get-callsite';

const ASYNC_TO_GEN_CODE         = asyncToGenerator(noop).toString();
const REGENERATOR_FOOTPRINTS_RE = /(_regenerator(\d+).default|regeneratorRuntime).wrap\(function _callee\$\(_context\)/;

function createHybridFunction (fnCode) {
    return function hybridFunction () {
        var testRunId = testRunTracker.getOwnerTestRunId();
        var testRun   = activeTestRuns[testRunId];

        if (!testRun)
            throw new APIError('hybridFunction', null, MESSAGE.hybridFunctionCantResolveTestRun);

        var args = [];

        // OPTIMIZATION: don't leak `arguments` object.
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        var callsite = getCallsite('hybridFunction');
        var command  = new ExecuteHybridFunctionCommand(fnCode, args);

        return testRun
            .executeCommand(command, callsite)
            .then(commandResult => commandResult.fnResult);
    };
}

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

    return createHybridFunction(fnCode);
}
