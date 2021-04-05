import { spawn, ChildProcess } from 'child_process';
import {
    HOST_INPUT_FD,
    HOST_OUTPUT_FD,
    HOST_SYNC_FD
} from './io';

import { restore as restoreTestStructure } from '../serialization/test-structure';
import prepareOptions from '../serialization/prepare-options';
import { default as testRunTracker, TestRun } from '../../api/test-run-tracker';
import { IPCProxy } from '../utils/ipc/proxy';
import { HostTransport } from '../utils/ipc/transport';
import AsyncEventEmitter from '../../utils/async-event-emitter';
import TestCafeErrorList from '../../errors/error-list';

import {
    CompilerProtocol,
    RunTestArguments,
    ExecuteActionArguments,
    FunctionProperties,
    SetOptionsArguments,
    ExecuteCommandArguments,
    RequestHookEventArguments,
    SetMockArguments
} from './protocol';

import { CompilerArguments } from '../../compiler/interfaces';
import Test from '../../api/structure/test';
import { RequestFilterRule, ResponseMock } from 'testcafe-hammerhead';

const SERVICE_PATH = require.resolve('./service');

interface RuntimeResources {
    service: ChildProcess;
    proxy: IPCProxy;
}

interface TestFunction {
    (testRun: TestRun): Promise<unknown>;
}

export default class CompilerHost extends AsyncEventEmitter implements CompilerProtocol {
    private runtime: Promise<RuntimeResources|undefined>;

    public constructor () {
        super();

        this.runtime = Promise.resolve(void 0);
    }

    private _setupRoutes (proxy: IPCProxy): void {
        proxy.register([
            this.executeAction,
            this.executeCommand,
            this.ready,
            this.onRequestHookEvent,
            this.setMock
        ], this);
    }

    private async _init (runtime: Promise<RuntimeResources|undefined>): Promise<RuntimeResources|undefined> {
        const resolvedRuntime = await runtime;

        if (resolvedRuntime)
            return resolvedRuntime;

        try {
            const service = spawn(process.argv0, [SERVICE_PATH], { stdio: [0, 1, 2, 'pipe', 'pipe', 'pipe'] });

            // HACK: Node.js definition are not correct when additional I/O channels are sp
            const stdio = service.stdio as any;
            const proxy = new IPCProxy(new HostTransport(stdio[HOST_INPUT_FD], stdio[HOST_OUTPUT_FD], stdio[HOST_SYNC_FD]));

            this._setupRoutes(proxy);

            await this.once('ready');

            return { proxy, service };
        }
        catch (e) {
            return void 0;
        }
    }

    private async _getRuntime (): Promise<RuntimeResources> {
        const runtime = await this.runtime;

        if (!runtime)
            throw new Error();

        return runtime;
    }

    public async init (): Promise<void> {
        this.runtime = this._init(this.runtime);

        await this.runtime;
    }

    public async stop (): Promise<void> {
        const { service } = await this._getRuntime();

        service.kill();
    }

    private _wrapTestFunction (id: string, functionName: FunctionProperties): TestFunction {
        return async testRun => {
            try {
                return await this.runTest({ id, functionName, testRunId: testRun.id });
            }
            catch (err) {
                const errList = new TestCafeErrorList();

                errList.addError(err);

                throw errList;
            }
        };
    }

    public async ready (): Promise<void> {
        this.emit('ready');
    }

    public async executeAction (data: ExecuteActionArguments): Promise<unknown> {
        const targetTestRun = testRunTracker.activeTestRuns[data.id];

        if (!targetTestRun)
            return void 0;

        return targetTestRun.executeAction(data.apiMethodName, data.command, data.callsite);
    }

    public async executeCommand ({ command, id }: ExecuteCommandArguments): Promise<unknown> {
        const targetTestRun = testRunTracker.activeTestRuns[id];

        if (!targetTestRun)
            return void 0;

        return targetTestRun.executeCommand(command);
    }

    public async getTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<Test[]> {
        const { proxy } = await this._getRuntime();

        const units = await proxy.call(this.getTests, { sourceList, compilerOptions });

        return restoreTestStructure(units, (...args) => this._wrapTestFunction(...args));
    }

    public async runTest ({ id, functionName, testRunId }: RunTestArguments): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return await proxy.call(this.runTest, { id, functionName, testRunId });
    }

    public async cleanUp (): Promise<void> {
        const { proxy } = await this._getRuntime();

        await proxy.call(this.cleanUp);
    }

    public async setOptions ({ value }: SetOptionsArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        const preparedOptions = prepareOptions(value);

        await proxy.call(this.setOptions, { value: preparedOptions });
    }

    public async onRequestHookEvent ({ name, testRunId, testId, hookId, eventData }: RequestHookEventArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        await proxy.call(this.onRequestHookEvent, { name, testRunId, testId, hookId, eventData });
    }

    public async setMock ({ rule, mock }: SetMockArguments): Promise<void> {
        mock = ResponseMock.from(mock);
        rule = RequestFilterRule.from(rule as object)[0];

        await this.emit('setMock', { rule, mock });
    }
}
