import fs from 'fs';
import Compiler from '../../compiler';
import TestRunProxy from './test-run-proxy';

import {
    flatten as flattenTestStructure,
    isFixture,
    isTest,
    serialize as serializeTestStructure,
    Unit,
    Units
} from '../serialization/test-structure';

import {
    SERVICE_INPUT_FD,
    SERVICE_OUTPUT_FD,
    SERVICE_SYNC_FD
} from './io';

import { IPCProxy } from '../utils/ipc/proxy';
import { ServiceTransport } from '../utils/ipc/transport';
import sourceMapSupport from 'source-map-support';

import {
    CompilerProtocol,
    ExecuteActionArguments,
    ExecuteCommandArguments,
    FunctionProperties,
    isFixtureFunctionProperty,
    isTestFunctionProperty,
    RunTestArguments,
    SetOptionsArguments
} from './protocol';

import { CompilerArguments } from '../../compiler/interfaces';
import Fixture from '../../api/structure/fixture';
import { Dictionary } from '../../configuration/interfaces';
import ProcessTitle from '../process-title';

sourceMapSupport.install({
    hookRequire:              true,
    handleUncaughtExceptions: false,
    environment:              'node'
});

interface ServiceState {
    testRuns: { [id: string]: TestRunProxy };
    fixtureCtxs: { [id: string]: object };
    units: Units;
    options: Dictionary<OptionValue>;
}

class CompilerService implements CompilerProtocol {
    private readonly proxy: IPCProxy;
    private readonly state: ServiceState;

    public constructor () {
        process.title = ProcessTitle.service;

        const input  = fs.createReadStream('', { fd: SERVICE_INPUT_FD });
        const output = fs.createWriteStream('', { fd: SERVICE_OUTPUT_FD });

        this.proxy = new IPCProxy(new ServiceTransport(input, output, SERVICE_SYNC_FD));
        this.state = this._initState();

        this._setupRoutes();
        this.ready();
    }

    private _initState (): ServiceState {
        return {
            testRuns:    {},
            fixtureCtxs: {},
            units:       {},
            options:     {}
        };
    }

    private _ensureTestRunProxy (testRunId: string, fixtureCtx: unknown): TestRunProxy {
        if (!this.state.testRuns[testRunId]) {
            this.state.testRuns[testRunId] = new TestRunProxy({
                dispatcher: this,
                id:         testRunId,
                options:    this.state.options,
                fixtureCtx
            });
        }

        return this.state.testRuns[testRunId];
    }

    private _getFixtureCtx ({ id }: RunTestArguments): unknown {
        const unit = this.state.units[id];

        const fixtureId = isTest(unit) ? unit.fixture.id : (unit as Fixture).id;

        if (!this.state.fixtureCtxs[fixtureId])
            this.state.fixtureCtxs[fixtureId] = Object.create(null);

        return this.state.fixtureCtxs[fixtureId];
    }

    private _getContext (args: RunTestArguments): unknown {
        const { testRunId } = args;
        const fixtureCtx        = this._getFixtureCtx(args);

        if (!testRunId)
            return fixtureCtx;

        return this._ensureTestRunProxy(testRunId, fixtureCtx);
    }

    private _setupRoutes (): void {
        this.proxy.register([
            this.getTests,
            this.runTest,
            this.cleanUp,
            this.setOptions
        ], this);
    }

    private _getFunction (unit: Unit, functionName: FunctionProperties): Function|null {
        if (isTest(unit) && isTestFunctionProperty(functionName))
            return unit[functionName];

        if (isFixture(unit) && isFixtureFunctionProperty(functionName))
            return unit[functionName];

        throw new Error();
    }

    public async setOptions ({ value }: SetOptionsArguments): Promise<void> {
        this.state.options = value;
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

    public async executeAction ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): Promise<unknown> {
        return this.proxy.call(this.executeAction, { id, apiMethodName, command, callsite });
    }

    public async executeCommand ({ command, id }: ExecuteCommandArguments): Promise<unknown> {
        return this.proxy.call(this.executeCommand, { id, command });
    }
}

export default new CompilerService();
