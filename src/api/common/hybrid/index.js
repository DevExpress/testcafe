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

var DEFAULT_EXECUTION_CALLSITE_NAME = '__$$hybridFunction$$';

function createReplicator (transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    var replicator = new Replicator({
        serialize:   identity,
        deserialize: identity
    });

    return replicator.addTransforms(transforms);
}

// Replicator transforms
var functionTransform = {
    type: 'Function',

    shouldTransform (type) {
        return type === 'function';
    },

    toSerializable (fn) {
        var isHybrid = !!fn[compiledCode];

        if (isHybrid)
            return fn[compiledCode];

        return compileFunctionArgumentOfHybridFunction(fn.toString(), DEFAULT_EXECUTION_CALLSITE_NAME);
    },

    fromSerializable (fnDescriptor) {
        if (!fnDescriptor.isHybridCode)
            fnDescriptor.fnCode = compileHybridFunction(fnDescriptor.fnCode, {}, '');

        return buildHybridFunctionInstance(fnDescriptor.fnCode, false, null, DEFAULT_EXECUTION_CALLSITE_NAME);
    }
};

var nodeTransform = {
    type: 'Node',

    shouldTransform () {
        return false;
    },

    fromSerializable (snapshot) {
        return snapshot;
    }
};

// Replicators
var replicatorForHybrid   = createReplicator([functionTransform]);
var replicatorForSelector = createReplicator([functionTransform, nodeTransform]);


function resolveContextTestRun (executionCallsiteName) {
    var testRunId = testRunTracker.getContextTestRunId();
    var testRun   = TestRun.activeTestRuns[testRunId];

    if (!testRun)
        throw new APIError(executionCallsiteName, MESSAGE.hybridFunctionCantResolveTestRun);

    return testRun;
}

function buildHybridFunctionInstance (fnCode, isSelector, boundTestRun, executionCallsiteName) {
    var hybridFn = function __$$hybridFunction$$ () {
        var testRun    = boundTestRun || resolveContextTestRun(executionCallsiteName);
        var replicator = isSelector ? replicatorForSelector : replicatorForHybrid;
        var args       = [];

        // OPTIMIZATION: don't leak `arguments` object.
        for (var i = 0; i < arguments.length; i++)
            args.push(arguments[i]);

        args = replicator.encode(args);

        var command  = new ExecuteHybridFunctionCommand(fnCode, args, isSelector);
        var callsite = getCallsite(executionCallsiteName);

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

        return buildHybridFunctionInstance(fnCode, isSelector, t.testRun, executionCallsiteName);
    };

    return hybridFn;
}

// NOTE: we use runtime APIError in most places because these errors may appear
// at the test compilation time when we don't have any test runs yet.
export default function createHybridFunction (fn, opts) {
    opts.dependencies            = opts.dependencies || {};
    opts.callsiteNames.execution = opts.callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME;

    var fnType           = typeof fn;
    var dependenciesType = typeof opts.dependencies;

    if (fnType !== 'function')
        throw new APIError(opts.callsiteNames.instantiation, MESSAGE.hybridFunctionCodeIsNotAFunction, fnType);

    if (dependenciesType !== 'object')
        throw new APIError(opts.callsiteNames.instantiation, MESSAGE.hybridDependenciesIsNotAnObject, dependenciesType);

    var fnCode = compileHybridFunction(fn.toString(), opts.dependencies, opts.callsiteNames.instantiation);

    return buildHybridFunctionInstance(fnCode, opts.isSelector, opts.boundTestRun, opts.callsiteNames.execution);
}
