import testRunTracker from './test-run-tracker';
import { activeTestRuns } from '../../../test-run';
import { compileHybridFunction } from '../../../compiler/es-next';
import { ExecuteHybridFunctionCommand } from '../../../test-run/commands';
import getCallsite from '../../../errors/get-callsite';

export default function (fn) {
    var fnCode = compileHybridFunction(fn.toString());

    return async function () {
        var callsite  = getCallsite();
        var testRunId = testRunTracker.getOwnerTestRunId();
        var testRun   = activeTestRuns[testRunId];
        var args      = [];

        // OPTIMIZATION: don't leak `arguments` object.
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        var command       = new ExecuteHybridFunctionCommand(fnCode, args);
        var commandResult = await testRun.executeCommand(command, callsite);

        return commandResult.fnResult;
    };
}
