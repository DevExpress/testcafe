import fs from 'fs';
import Compiler from '../../compiler';
import TestRunProxy from './test-run-proxy';

import {
    flatten as flattenTestStructure, isFixture,
    isTest,
    serialize as serializeTestStructure, Unit,
    Units
} from './test-structure';

import { SERVICE_INPUT_FD, SERVICE_OUTPUT_FD, SERVICE_SYNC_FD } from './io';
import { IPCProxy } from '../utils/ipc/proxy';
import { ServiceTransport } from '../utils/ipc/transport';
import sourceMapSupport from 'source-map-support';

import {
    CompilerProtocol,
    ExecuteCommandArguments, FunctionProperties, isFixtureFunctionProperty,
    isTestFunctionProperty,
    RunTestArguments
} from './protocol';
import { CompilerArguments } from '../../compiler/interfaces';

sourceMapSupport.install({
    hookRequire:              true,
    handleUncaughtExceptions: false,
    environment:              'node'
});

interface ServiceState {
    testRuns: { [id: string]: TestRunProxy };
    fixtureCtxs: { [id: string]: object };
    units: Units;
}

class CompilerService implements CompilerProtocol {
    private readonly proxy: IPCProxy;
    private readonly state: ServiceState;

    public constructor () {
        const input  = fs.createReadStream('', { fd: SERVICE_INPUT_FD });
        const output = fs.createWriteStream('', { fd: SERVICE_OUTPUT_FD });

        this.proxy    = new IPCProxy(new ServiceTransport(input, output, SERVICE_SYNC_FD));
        this.state    = {
            testRuns:    {},
            fixtureCtxs: {},
            units:       {}
        };

        this._setupRoutes();
        this.ready();
    }

    private _getFixtureCtx ({ id }: RunTestArguments): unknown {
        const unit = this.state.units[id];

        const fixtureId = isTest(unit) ? unit.fixture.id : unit.id;

        if (!this.state.fixtureCtxs[fixtureId])
            this.state.fixtureCtxs[fixtureId] = Object.create(null);

        return this.state.fixtureCtxs[fixtureId];
    }

    private _getContext (args: RunTestArguments): unknown {
        const { testRunId } = args;
        const fixtureCtx        = this._getFixtureCtx(args);

        if (!testRunId)
            return fixtureCtx;

        if (!this.state.testRuns[testRunId])
            this.state.testRuns[testRunId] = new TestRunProxy(this, testRunId, fixtureCtx);

        return this.state.testRuns[testRunId];
    }

    private _setupRoutes (): void {
        this.proxy.register(this.getTests, this);
        this.proxy.register(this.runTest, this);
        this.proxy.register(this.cleanUp, this);
    }

    private _getFunction (unit: Unit, functionName: FunctionProperties): Function|null {
        if (isTest(unit) && isTestFunctionProperty(functionName))
            return unit[functionName];

        if (isFixture(unit) && isFixtureFunctionProperty(functionName))
            return unit[functionName];

        throw new Error();
    }

    public async ready (): Promise<void> {
        this.proxy.call(this.ready);
    }

    public async cleanUp (): Promise<void> {
        await Compiler.cleanUp();
    }

    public async getTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<Units> {
        const compiler = new Compiler(sourceList, compilerOptions);

        const tests = await compiler.getTests();
        const units = flattenTestStructure(tests);

        Object.assign(this.state.units, units);

        return serializeTestStructure(units);
    }

    public async runTest (args: RunTestArguments): Promise<unknown> {
        const { id, functionName } = args;

        const unit    = this.state.units[id];
        const context = this._getContext(args);

        const functionObject = this._getFunction(unit, functionName);

        if (!functionObject)
            throw new Error();

        return await functionObject(context);
    }

    public async executeAction ({ id, apiMethodName, command, callsite }: ExecuteCommandArguments): Promise<unknown> {
        return this.proxy.call(this.executeAction, { id, apiMethodName, command, callsite });
    }
}

export default new CompilerService();
