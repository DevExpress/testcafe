import path from 'path';
import url from 'url';
import cdp from 'chrome-remote-interface';
import EventEmitter from 'events';
import { spawn, ChildProcess } from 'child_process';
import {
    HOST_INPUT_FD,
    HOST_OUTPUT_FD,
    HOST_SYNC_FD
} from './io';

import { restore as restoreTestStructure } from '../serialization/test-structure';
import prepareOptions from '../serialization/prepare-options';
import { default as testRunTracker } from '../../api/test-run-tracker';
import TestController from '../../api/test-controller';
import TestRun from '../../test-run';
import { IPCProxy } from '../utils/ipc/proxy';
import { HostTransport } from '../utils/ipc/transport';
import AsyncEventEmitter from '../../utils/async-event-emitter';
import TestCafeErrorList from '../../errors/error-list';
import DEBUG_ACTION from '../../utils/debug-action';

import {
    CompilerProtocol,
    RunTestArguments,
    ExecuteActionArguments,
    FunctionProperties,
    SetOptionsArguments,
    ExecuteCommandArguments,
    RequestHookEventArguments,
    SetMockArguments,
    SetConfigureResponseEventOptionsArguments,
    SetHeaderOnConfigureResponseEventArguments,
    RemoveHeaderOnConfigureResponseEventArguments,
    ExecuteRequestFilterRulePredicateArguments,
    RequestFilterRuleLocator,
    ExecuteMockPredicate,
    AddRequestEventListenersArguments,
    RemoveRequestEventListenersArguments,
    InitializeTestRunDataArguments,
    UseStateSnapshotArguments,
    SetTestRunPhaseArguments,
    TestRunLocator,
    SetBrowserConsoleMessagesArguments
} from './protocol';

import { CompilerArguments } from '../../compiler/interfaces';
import Test from '../../api/structure/test';
import {
    RequestInfo,
    ResponseMock,
    IncomingMessageLikeInitOptions,
    StateSnapshot
} from 'testcafe-hammerhead';

import { CallsiteRecord } from 'callsite-record';
import TestRunPhase from '../../test-run/phase';
import BrowserConsoleMessages from '../../test-run/browser-console-messages';

import {
    DebugCommand,
    DisableDebugCommand,
    ExecuteClientFunctionCommand,
    ExecuteSelectorCommand
} from '../../test-run/commands/observation';

const SERVICE_PATH       = require.resolve('./service');
const INTERNAL_FILES_URL = url.pathToFileURL(path.join(__dirname, '../../'));

interface RuntimeResources {
    service: ChildProcess;
    proxy: IPCProxy;
}

interface TestFunction {
    (testRun: TestRun): Promise<unknown>;
}

interface RequestFilterRulePredicate {
    (requestInfo: RequestInfo): Promise<boolean>;
}

interface WrapMockPredicateArguments extends RequestFilterRuleLocator {
    mock: ResponseMock;
}

const INITIAL_DEBUGGER_BREAK_ON_START = 'Break on start';

export default class CompilerHost extends AsyncEventEmitter implements CompilerProtocol {
    private runtime: Promise<RuntimeResources|undefined>;
    private cdp: cdp.ProtocolApi & EventEmitter | undefined;

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
            this.setMock,
            this.setConfigureResponseEventOptions,
            this.setHeaderOnConfigureResponseEvent,
            this.removeHeaderOnConfigureResponseEvent,
            this.executeRequestFilterRulePredicate,
            this.executeMockPredicate,
            this.getWarningMessages,
            this.addRequestEventListeners,
            this.removeRequestEventListeners,
            this.initializeTestRunData,
            this.getCurrentUrl,
            this.getStateSnapshot,
            this.useStateSnapshot,
            this.getTestRunPhase,
            this.setTestRunPhase,
            this.getActiveDialogHandler,
            this.getActiveIframeSelector,
            this.getSpeed,
            this.getPageLoadTimeout,
            this.setBrowserConsoleMessages,
            this.getBrowserConsoleMessages
        ], this);
    }

    private _setupDebuggerHandlers (): void {
        if (!this.cdp)
            return;

        testRunTracker.on(DEBUG_ACTION.resume, async () => {
            if (!this.cdp)
                return;

            const disableDebugMethodName = TestController.disableDebugForNonDebugCommands.name;

            // NOTE: disable `debugger` for non-debug commands if the `Resume` button is clicked
            // the `includeCommandLineAPI` option allows to use the `require` functoion in the expression
            // TODO: debugging: refactor to use absolute paths
            await this.cdp.Runtime.evaluate({
                expression:            `require.main.require('../../api/test-controller').${disableDebugMethodName}()`,
                includeCommandLineAPI: true
            });

            await this.cdp.Debugger.resume();
        });

        testRunTracker.on(DEBUG_ACTION.step, async () => {
            if (!this.cdp)
                return;

            const enableDebugMethodName = TestController.enableDebugForNonDebugCommands.name;

            // NOTE: enable `debugger` for non-debug commands in the `Next Action` button is clicked
            // the `includeCommandLineAPI` option allows to use the `require` functoion in the expression
            // TODO: debugging: refactor to use absolute paths
            await this.cdp.Runtime.evaluate({
                expression:            `require.main.require('../../api/test-controller').${enableDebugMethodName}()`,
                includeCommandLineAPI: true
            });

            await this.cdp.Debugger.resume();
        });

        // NOTE: need to step out from the source code until breakpoint is set in the code of test
        // force DebugCommand if breakpoint stopped in the test code
        // TODO: debugging: refactor to this.cdp.Debugger.on('paused') after updating to chrome-remote-interface@0.30.0
        this.cdp.on('Debugger.paused', (args: any): Promise<void> => {
            const { callFrames } = args;

            if (this.cdp) {
                if (args.reason === INITIAL_DEBUGGER_BREAK_ON_START)
                    return this.cdp.Debugger.resume();

                if (callFrames[0].url.includes(INTERNAL_FILES_URL))
                    return this.cdp.Debugger.stepOut();

                Object.values(testRunTracker.activeTestRuns).forEach(testRun => {
                    if (!testRun.debugging)
                        testRun.executeCommand(new DebugCommand());
                });
            }

            return Promise.resolve();
        });

        // NOTE: need to hide Status Bar if debugger is resumed
        // TODO: debugging: refactor to this.cdp.Debugger.on('resumed') after updating to chrome-remote-interface@0.30.0
        this.cdp.on('Debugger.resumed', () => {
            Object.values(testRunTracker.activeTestRuns).forEach(testRun => {
                if (testRun.debugging)
                    testRun.executeCommand(new DisableDebugCommand());
            });
        });
    }


    private async _init (runtime: Promise<RuntimeResources|undefined>): Promise<RuntimeResources|undefined> {
        const resolvedRuntime = await runtime;

        if (resolvedRuntime)
            return resolvedRuntime;

        try {
            // NOTE: fixed port number for debugging purposes. Will be replaced with the `getFreePort` util
            // TODO: debugging: refactor to a separate debug info parsing unit
            const port    = '64128';
            const service = spawn(process.argv0, [`--inspect-brk=127.0.0.1:${port}`, SERVICE_PATH], { stdio: [0, 1, 2, 'pipe', 'pipe', 'pipe'] });

            // NOTE: need to wait, otherwise the error will be at `await cdp(...)`
            // TODO: debugging: refactor to use delay and multiple tries
            await new Promise(r => setTimeout(r, 2000));

            // @ts-ignore
            this.cdp = await cdp({ port });

            if (!this.cdp)
                return void 0;

            this._setupDebuggerHandlers();

            await this.cdp.Debugger.enable({});
            await this.cdp.Runtime.enable();
            await this.cdp.Runtime.runIfWaitingForDebugger();

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
            throw new Error('Runtime is not available.');

        return runtime;
    }

    private _getTargetTestRun (id: string): TestRun {
        return testRunTracker.activeTestRuns[id] as unknown as TestRun;
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
                return await this.runTestFn({ id, functionName, testRunId: testRun.id });
            }
            catch (err) {
                const errList = new TestCafeErrorList();

                errList.addError(err);

                throw errList;
            }
        };
    }

    private _wrapRequestFilterRulePredicate ({ testId, hookId, ruleId }: RequestFilterRuleLocator): RequestFilterRulePredicate {
        return async (requestInfo: RequestInfo) => {
            return await this.executeRequestFilterRulePredicate({ testId, hookId, ruleId, requestInfo });
        };
    }

    private _wrapMockPredicate ({ mock, testId, hookId, ruleId }: WrapMockPredicateArguments): void {
        mock.body = async (requestInfo: RequestInfo, res: IncomingMessageLikeInitOptions) => {
            return await this.executeMockPredicate({ testId, hookId, ruleId, requestInfo, res });
        };
    }

    public async ready (): Promise<void> {
        this.emit('ready');
    }

    public async executeAction (data: ExecuteActionArguments): Promise<unknown> {
        return this
            ._getTargetTestRun(data.id)
            .executeAction(data.apiMethodName, data.command, data.callsite as CallsiteRecord);
    }

    public executeActionSync (): never {
        throw new Error('The method should not be called.');
    }

    public async executeCommand ({ command, id }: ExecuteCommandArguments): Promise<unknown> {
        return this
            ._getTargetTestRun(id)
            .executeCommand(command);
    }

    public async getTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<Test[]> {
        const { proxy } = await this._getRuntime();

        const units = await proxy.call(this.getTests, { sourceList, compilerOptions });

        return restoreTestStructure(
            units,
            (...args) => this._wrapTestFunction(...args),
            (ruleLocator: RequestFilterRuleLocator) => this._wrapRequestFilterRulePredicate(ruleLocator)
        );
    }

    public async runTestFn ({ id, functionName, testRunId }: RunTestArguments): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return await proxy.call(this.runTestFn, { id, functionName, testRunId });
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

    public async onRequestHookEvent ({ name, testId, hookId, eventData }: RequestHookEventArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        await proxy.call(this.onRequestHookEvent, {
            name,
            testId,
            hookId,
            eventData
        });
    }

    public async setMock ({ testId, hookId, ruleId, responseEventId, mock }: SetMockArguments): Promise<void> {
        if (mock.isPredicate)
            this._wrapMockPredicate({ mock, testId, hookId, ruleId });

        await this.emit('setMock', [responseEventId, mock]);
    }

    public async setConfigureResponseEventOptions ({ eventId, opts }: SetConfigureResponseEventOptionsArguments): Promise<void> {
        await this.emit('setConfigureResponseEventOptions', [eventId, opts]);
    }

    public async setHeaderOnConfigureResponseEvent ({ eventId, headerName, headerValue }: SetHeaderOnConfigureResponseEventArguments): Promise<void> {
        await this.emit('setHeaderOnConfigureResponseEvent', [eventId, headerName, headerValue]);
    }

    public async removeHeaderOnConfigureResponseEvent ({ eventId, headerName }: RemoveHeaderOnConfigureResponseEventArguments): Promise<void> {
        await this.emit('removeHeaderOnConfigureResponseEvent', [eventId, headerName]);
    }

    public async executeRequestFilterRulePredicate ({ testId, hookId, ruleId, requestInfo }: ExecuteRequestFilterRulePredicateArguments): Promise<boolean> {
        const { proxy } = await this._getRuntime();

        return await proxy.call(this.executeRequestFilterRulePredicate, { testId, hookId, ruleId, requestInfo });
    }

    public async executeMockPredicate ({ testId, hookId, ruleId, requestInfo, res }: ExecuteMockPredicate): Promise<IncomingMessageLikeInitOptions> {
        const { proxy } = await this._getRuntime();

        return await proxy.call(this.executeMockPredicate, { testId, hookId, ruleId, requestInfo, res });
    }

    public async getWarningMessages ({ testRunId }: TestRunLocator): Promise<string[]> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.getWarningMessages, { testRunId });
    }

    public async addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void> {
        await this.emit('addRequestEventListeners', { hookId, hookClassName, rules });
    }

    public async removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void> {
        await this.emit('removeRequestEventListeners', { rules });
    }

    public async initializeTestRunData ({ testRunId, testId }: InitializeTestRunDataArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.initializeTestRunData, { testRunId, testId });
    }

    public async getCurrentUrl ({ testRunId }: TestRunLocator): Promise<string> {
        return this._getTargetTestRun(testRunId).getCurrentUrl();
    }

    public async getStateSnapshot ({ testRunId }: TestRunLocator): Promise<StateSnapshot> {
        return this._getTargetTestRun(testRunId).getStateSnapshot();
    }

    public async useStateSnapshot ({ testRunId, snapshot }: UseStateSnapshotArguments): Promise<void> {
        return this._getTargetTestRun(testRunId).session.useStateSnapshot(snapshot);
    }

    public async getTestRunPhase ({ testRunId }: TestRunLocator): Promise<TestRunPhase> {
        return this._getTargetTestRun(testRunId).phase;
    }

    public async setTestRunPhase ({ testRunId, value }: SetTestRunPhaseArguments): Promise<void> {
        this._getTargetTestRun(testRunId).phase = value;
    }

    public async getActiveDialogHandler ({ testRunId }: TestRunLocator): Promise<ExecuteClientFunctionCommand | null> {
        return this._getTargetTestRun(testRunId).activeDialogHandler;
    }

    public async getActiveIframeSelector ({ testRunId }: TestRunLocator): Promise<ExecuteSelectorCommand | null> {
        return this._getTargetTestRun(testRunId).activeIframeSelector;
    }

    public async getSpeed ({ testRunId }: TestRunLocator): Promise<number> {
        return this._getTargetTestRun(testRunId).speed;
    }

    public async getPageLoadTimeout ({ testRunId }: TestRunLocator): Promise<number> {
        return this._getTargetTestRun(testRunId).pageLoadTimeout;
    }

    public async setBrowserConsoleMessages ({ testRunId, value }: SetBrowserConsoleMessagesArguments): Promise<void> {
        this._getTargetTestRun(testRunId).consoleMessages = value;
    }

    public async getBrowserConsoleMessages ({ testRunId }: TestRunLocator): Promise<BrowserConsoleMessages> {
        return this._getTargetTestRun(testRunId).consoleMessages;
    }
}
