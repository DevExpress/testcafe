import path from 'path';
import { pathToFileURL } from 'url';
import cdp from 'chrome-remote-interface';
import EventEmitter from 'events';
import { spawn, ChildProcess } from 'child_process';
import { getFreePort } from 'endpoint-utils';

import {
    HOST_INPUT_FD,
    HOST_OUTPUT_FD,
    HOST_SYNC_FD,
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
    FunctionProperties,
} from './protocol';

import { CompilerArguments } from '../../compiler/interfaces';
import Test from '../../api/structure/test';

import {
    RequestInfo,
    ResponseMock,
    IncomingMessageLikeInitOptions,
} from 'testcafe-hammerhead';

import { DebugCommand, DisableDebugCommand } from '../../test-run/commands/observation';
import MethodShouldNotBeCalledError from '../utils/method-should-not-be-called-error';

import {
    AddRequestEventListenersArguments,
    ExecuteCommandArguments,
    ExecuteMockPredicate,
    ExecuteRequestFilterRulePredicateArguments,
    ExecuteRoleInitFnArguments,
    InitializeTestRunDataArguments,
    RemoveHeaderOnConfigureResponseEventArguments,
    RemoveRequestEventListenersArguments,
    RequestFilterRuleLocator,
    RequestHookEventArguments,
    SetConfigureResponseEventOptionsArguments,
    SetCtxArguments,
    SetMockArguments,
    SetHeaderOnConfigureResponseEventArguments,
    SetOptionsArguments,
    TestRunLocator,
    UpdateRolePropertyArguments,
    ExecuteJsExpressionArguments,
    ExecuteAsyncJsExpressionArguments,
    CommandLocator,
    AddUnexpectedErrorArguments,
    CheckWindowArgument,
    RemoveFixtureCtxsArguments,
    RemoveUnitsFromStateArguments,
} from './interfaces';

import { UncaughtExceptionError, UnhandledPromiseRejectionError } from '../../errors/test-run';
import { handleUnexpectedError } from '../../utils/handle-errors';
import { V8_DEBUG_FLAGS } from '../../cli/node-arguments-filter';
import { WarningLogMessage } from '../../notifications/warning-log';

const SERVICE_PATH       = require.resolve('./service-loader');
const INTERNAL_FILES_URL = pathToFileURL(path.join(__dirname, '../../'));

const INSPECT_RE      = new RegExp(`^(${V8_DEBUG_FLAGS.join('|')})`);
const INSPECT_PORT_RE = new RegExp(`^(${V8_DEBUG_FLAGS.join('|')})=(.+:)?(\\d+)$`);

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

const errorTypeConstructors = new Map<string, Function>([
    [UnhandledPromiseRejectionError.name, UnhandledPromiseRejectionError],
    [UncaughtExceptionError.name, UncaughtExceptionError],
]);

interface CompilerHostInitOptions {
    developmentMode: boolean;
    v8Flags: string[];
}

export default class CompilerHost extends AsyncEventEmitter implements CompilerProtocol {
    private runtime: Promise<RuntimeResources | undefined>;
    private cdp: cdp.ProtocolApi & EventEmitter | undefined;
    private readonly developmentMode: boolean;
    private readonly v8Flags: string[];
    public initialized: boolean;

    public constructor ({ developmentMode, v8Flags }: CompilerHostInitOptions) {
        super();

        this.runtime         = Promise.resolve(void 0);
        this.developmentMode = developmentMode;
        this.v8Flags         = v8Flags;
        this.initialized     = false;
    }

    private _setupRoutes (proxy: IPCProxy): void {
        proxy.register([
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
            this.getAssertionActualValue,
            this.executeRoleInitFn,
            this.getCtx,
            this.getFixtureCtx,
            this.setCtx,
            this.setFixtureCtx,
            this.updateRoleProperty,
            this.executeJsExpression,
            this.executeAsyncJsExpression,
            this.executeAssertionFn,
            this.addUnexpectedError,
            this.checkWindow,
            this.removeTestRunFromState,
            this.removeFixtureCtxsFromState,
            this.removeUnitsFromState,
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
                includeCommandLineAPI: true,
            });

            await this.cdp.Debugger.resume({ terminateOnResume: false });
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
                includeCommandLineAPI: true,
            });

            await this.cdp.Debugger.resume({ terminateOnResume: false });
        });

        // NOTE: need to step out from the source code until breakpoint is set in the code of test
        // force DebugCommand if breakpoint stopped in the test code
        // TODO: debugging: refactor to this.cdp.Debugger.on('paused') after updating to chrome-remote-interface@0.30.0
        this.cdp.on('Debugger.paused', (args: any): Promise<void> => {
            const { callFrames } = args;

            if (this.cdp) {
                if (args.reason === INITIAL_DEBUGGER_BREAK_ON_START)
                    return this.cdp.Debugger.resume({ terminateOnResume: false });

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

    private parseDebugPort (): string | null {
        if (this.v8Flags) {
            for (let i = 0; i < this.v8Flags.length; i++) {
                const match = this.v8Flags[i].match(INSPECT_PORT_RE);

                if (match)
                    return match[3];
            }
        }

        return null;
    }

    private _getServiceProcessArgs (port: string): string [] {
        let args: string[] = [];

        if (this.v8Flags)
            args = this.v8Flags.filter(flag => !INSPECT_RE.test(flag));

        // TODO: debugging: refactor to a separate debug info parsing unit
        const inspectBrkFlag = `--inspect-brk=127.0.0.1:${ port }`;

        args.push(inspectBrkFlag, SERVICE_PATH);

        return args;
    }

    private async _init (runtime: Promise<RuntimeResources | undefined>): Promise<RuntimeResources | undefined> {
        const resolvedRuntime = await runtime;

        if (resolvedRuntime)
            return resolvedRuntime;

        try {
            const port    = this.parseDebugPort() || await getFreePort();
            const args    = this._getServiceProcessArgs(port.toString());
            const service = spawn(process.argv0, args, { stdio: [0, 1, 2, 'pipe', 'pipe', 'pipe'] });

            // NOTE: need to wait, otherwise the error will be at `await cdp(...)`
            // TODO: debugging: refactor to use delay and multiple tries
            await new Promise(r => setTimeout(r, 2000));

            // @ts-ignore
            this.cdp = await cdp({ port });

            if (!this.cdp)
                return void 0;

            if (!this.developmentMode)
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

        this.initialized = true;
    }

    public async stop (): Promise<void> {
        if (!this.initialized)
            return;

        const { service, proxy } = await this._getRuntime();

        service.kill();
        proxy.stop();
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

    private _getErrorTypeConstructor (type: string): Function {
        return errorTypeConstructors.get(type) as Function;
    }

    public async ready (): Promise<void> {
        this.emit('ready');
    }

    public executeCommandSync (): never {
        throw new MethodShouldNotBeCalledError();
    }

    public async executeCommand ({ command, id, callsite }: ExecuteCommandArguments): Promise<unknown> {
        return this
            ._getTargetTestRun(id)
            .executeCommand(command, callsite);
    }

    public async getTests ({ sourceList, compilerOptions, runnableConfigurationId }: CompilerArguments, baseUrl?: string): Promise<Test[]> {
        const { proxy } = await this._getRuntime();

        const units = await proxy.call(this.getTests, { sourceList, compilerOptions, runnableConfigurationId }, baseUrl);

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

    public async setUserVariables (userVariables: UserVariables | null): Promise<void> {
        const { proxy } = await this._getRuntime();

        await proxy.call(this.setUserVariables, userVariables);
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
            eventData,
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

    public async getWarningMessages ({ testRunId }: TestRunLocator): Promise<WarningLogMessage[]> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.getWarningMessages, { testRunId });
    }

    public async addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void> {
        await this.emit('addRequestEventListeners', { hookId, hookClassName, rules });
    }

    public async removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void> {
        await this.emit('removeRequestEventListeners', { rules });
    }

    public async initializeTestRunData ({ testRunId, testId, browser, activeWindowId, messageBus }: InitializeTestRunDataArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.initializeTestRunData, { testRunId, testId, browser, activeWindowId, messageBus });
    }

    public async getAssertionActualValue ({ testRunId, commandId }: CommandLocator): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.getAssertionActualValue, { testRunId, commandId: commandId });
    }

    public async executeRoleInitFn ({ testRunId, roleId }: ExecuteRoleInitFnArguments): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.executeRoleInitFn, { testRunId, roleId });
    }

    public async getCtx ({ testRunId }: TestRunLocator): Promise<object> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.getCtx, { testRunId });
    }

    public async getFixtureCtx ({ testRunId }: TestRunLocator): Promise<object> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.getFixtureCtx, { testRunId });
    }

    public async setCtx ({ testRunId, value }: SetCtxArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.setCtx, { testRunId, value });
    }

    public async setFixtureCtx ({ testRunId, value }: SetCtxArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.setFixtureCtx, { testRunId, value });
    }

    public onRoleAppeared (): void {
        throw new MethodShouldNotBeCalledError();
    }

    public async updateRoleProperty ({ roleId, name, value }: UpdateRolePropertyArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.updateRoleProperty, { roleId, name, value });
    }

    public async executeJsExpression ({ expression, testRunId, options }: ExecuteJsExpressionArguments): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.executeJsExpression, { expression, testRunId, options });
    }

    public async executeAsyncJsExpression ({ expression, testRunId, callsite }: ExecuteAsyncJsExpressionArguments): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.executeAsyncJsExpression, { expression, testRunId, callsite });
    }

    public async executeAssertionFn ({ testRunId, commandId }: CommandLocator): Promise<unknown> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.executeAssertionFn, { testRunId, commandId });
    }

    public async addUnexpectedError ({ type, message }: AddUnexpectedErrorArguments): Promise<void> {
        const ErrorTypeConstructor = this._getErrorTypeConstructor(type);

        handleUnexpectedError(ErrorTypeConstructor, message);
    }

    public async checkWindow ({ testRunId, commandId, url, title }: CheckWindowArgument): Promise<boolean> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.checkWindow, { testRunId, commandId, url, title });
    }

    public async removeTestRunFromState ({ testRunId }: TestRunLocator): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.removeTestRunFromState, { testRunId });
    }

    public async removeFixtureCtxsFromState ({ fixtureIds }: RemoveFixtureCtxsArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.removeFixtureCtxsFromState, { fixtureIds });
    }

    public async removeUnitsFromState ({ runnableConfigurationId }: RemoveUnitsFromStateArguments): Promise<void> {
        const { proxy } = await this._getRuntime();

        return proxy.call(this.removeUnitsFromState, { runnableConfigurationId });
    }
}
