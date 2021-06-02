import fs from 'fs';
import Compiler from '../../compiler';
import TestRunProxy from './test-run-proxy';
import TestController from '../../api/test-controller';


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
    ExecuteMockPredicate,
    ExecuteRequestFilterRulePredicateArguments,
    FunctionProperties,
    isFixtureFunctionProperty,
    isTestFunctionProperty,
    RemoveHeaderOnConfigureResponseEventArguments,
    RequestHookEventArguments,
    RequestHookLocator,
    RunTestArguments,
    SetConfigureResponseEventOptionsArguments,
    SetHeaderOnConfigureResponseEventArguments,
    SetMockArguments,
    SetOptionsArguments,
    AddRequestEventListenersArguments,
    RemoveRequestEventListenersArguments,
    InitializeTestRunDataArguments,
    UseStateSnapshotArguments,
    SetTestRunPhaseArguments,
    TestRunLocator,
    SetBrowserConsoleMessagesArguments
} from './protocol';

import { CompilerArguments } from '../../compiler/interfaces';
import Fixture from '../../api/structure/fixture';
import { Dictionary } from '../../configuration/interfaces';
import ProcessTitle from '../process-title';
import Test from '../../api/structure/test';
import RequestHookMethodNames from '../../api/request-hooks/hook-method-names';

import {
    ConfigureResponseEvent,
    IncomingMessageLikeInitOptions,
    RequestEvent,
    RequestFilterRule,
    ResponseMock,
    responseMockSetBodyMethod,
    StateSnapshot
} from 'testcafe-hammerhead';

import RequestHook from '../../api/request-hooks/hook';
import RequestMock from '../../api/request-hooks/request-mock';
import TestRunPhase from '../../test-run/phase';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from '../../test-run/commands/observation';
import BrowserConsoleMessages from '../../test-run/browser-console-messages';

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

interface WrapSetMockArguments extends RequestHookLocator {
    event: RequestEvent;
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

    private _getFixtureCtx (unit: Unit): object {
        const fixtureId = isTest(unit) ? unit.fixture.id : (unit as Fixture).id;

        return this.state.fixtureCtxs[fixtureId];
    }

    private _getTestCtx ({ testRunId }: RunTestArguments, unit: Unit): TestRunProxy {
        const testRunProxy = this.state.testRuns[testRunId];

        testRunProxy.fixtureCtx = this._getFixtureCtx(unit);

        return testRunProxy;
    }

    private _getContext (args: RunTestArguments, unit: Unit): TestRunProxy | unknown {
        const { testRunId } = args;

        if (testRunId)
            return this._getTestCtx(args, unit);

        return this._getFixtureCtx(unit);
    }

    private _setupRoutes (): void {
        this.proxy.register([
            this.getTests,
            this.runTestFn,
            this.cleanUp,
            this.setOptions,
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

    private _getFunction (unit: Unit, functionName: FunctionProperties): Function|null {
        if (isTest(unit) && isTestFunctionProperty(functionName))
            return unit[functionName];

        if (isFixture(unit) && isFixtureFunctionProperty(functionName))
            return unit[functionName];

        throw new Error(`Cannot find '${functionName}' function for ${typeof unit}`);
    }

    private _wrapEventMethods ({ name, testId, hookId, eventData }: RequestHookEventArguments): void {
        if (name === RequestHookMethodNames.onRequest)
            this._wrapSetMockFn({ testId, hookId, event: eventData as RequestEvent });
        else if (name === RequestHookMethodNames._onConfigureResponse)
            this._wrapConfigureResponseEventMethods(eventData as ConfigureResponseEvent);
    }

    private _wrapSetMockFn ({ testId, hookId, event }: WrapSetMockArguments): void {
        event.setMock = async (mock: ResponseMock) => {
            await this.setMock({
                responseEventId: event.id,
                ruleId:          event.requestFilterRule.id,
                testId,
                hookId,
                mock
            });
        };
    }

    private _wrapConfigureResponseEventMethods (event: ConfigureResponseEvent): void {
        event.setHeader = async (name: string, value: string) => {
            await this.setHeaderOnConfigureResponseEvent({
                eventId:     event.id,
                headerName:  name,
                headerValue: value
            });
        };

        event.removeHeader = async (name: string) => {
            await this.removeHeaderOnConfigureResponseEvent({
                eventId:    event.id,
                headerName: name
            });
        };
    }

    private _initializeTestRunProxy (testRunId: string, test: Test): void {
        const testRunProxy = new TestRunProxy({
            dispatcher: this,
            id:         testRunId,
            options:    this.state.options,
            test
        });

        this.state.testRuns[testRunId] = testRunProxy;
    }

    private _initializeFixtureCtx (test: Test): void {
        const fixtureId = test.fixture.id;

        if (this.state.fixtureCtxs[fixtureId])
            return;

        this.state.fixtureCtxs[fixtureId] = Object.create(null);
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

    public async runTestFn (args: RunTestArguments): Promise<unknown> {
        const { id, functionName } = args;

        const unit           = this.state.units[id];
        const context        = this._getContext(args, unit);
        const functionObject = this._getFunction(unit, functionName);

        if (!functionObject)
            throw new Error(`Cannot find the "${functionName}" of ${typeof unit}`);

        return await functionObject(context);
    }

    public executeActionSync ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): unknown {
        return this.proxy.callSync(this.executeAction, { id, apiMethodName, command, callsite });
    }

    public async executeAction ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): Promise<unknown> {
        return this.proxy.call(this.executeAction, { id, apiMethodName, command, callsite });
    }

    public async executeCommand ({ command, id }: ExecuteCommandArguments): Promise<unknown> {
        return this.proxy.call(this.executeCommand, { id, command });
    }

    public async onRequestHookEvent ({ name, testId, hookId, eventData }: RequestHookEventArguments): Promise<void> {
        this._wrapEventMethods({ name, testId, hookId, eventData });

        const test       = this.state.units[testId] as Test;
        const targetHook = test.requestHooks.find(hook => hook.id === hookId) as RequestHook;

        // @ts-ignore
        await targetHook[name].call(targetHook, eventData);

        if (name === RequestHookMethodNames._onConfigureResponse && targetHook._responseEventConfigureOpts) {
            const { opts, id: eventId } = eventData as ConfigureResponseEvent;

            await this.setConfigureResponseEventOptions({ eventId, opts });
        }
    }

    public async setMock ({ testId, hookId, ruleId, responseEventId, mock }: SetMockArguments): Promise<void> {
        await this.proxy.call(this.setMock, { testId, hookId, ruleId, responseEventId, mock });
    }

    public async setConfigureResponseEventOptions ({ eventId, opts }: SetConfigureResponseEventOptionsArguments): Promise<void> {
        await this.proxy.call(this.setConfigureResponseEventOptions, { eventId, opts });
    }

    public async setHeaderOnConfigureResponseEvent ({ eventId, headerName, headerValue }: SetHeaderOnConfigureResponseEventArguments): Promise<void> {
        await this.proxy.call(this.setHeaderOnConfigureResponseEvent, { eventId, headerName, headerValue });
    }

    public async removeHeaderOnConfigureResponseEvent ({ eventId, headerName }: RemoveHeaderOnConfigureResponseEventArguments): Promise<void> {
        await this.proxy.call(this.removeHeaderOnConfigureResponseEvent, { eventId, headerName });
    }

    public async executeRequestFilterRulePredicate ({ testId, hookId, ruleId, requestInfo }: ExecuteRequestFilterRulePredicateArguments): Promise<boolean> {
        const test       = this.state.units[testId] as Test;
        const targetHook = test.requestHooks.find(hook => hook.id === hookId) as RequestHook;
        const targetRule = targetHook._requestFilterRules.find(rule => rule.id === ruleId) as RequestFilterRule;
        const result     = await targetRule.options.call(targetRule, requestInfo);

        return !!result;
    }

    public async executeMockPredicate ({ testId, hookId, ruleId, requestInfo, res }: ExecuteMockPredicate): Promise<IncomingMessageLikeInitOptions> {
        const test         = this.state.units[testId] as Test;
        const requestMock  = test.requestHooks.find(hook => hook.id === hookId) as RequestMock;
        const responseMock = requestMock.mocks.get(ruleId) as ResponseMock;

        responseMockSetBodyMethod.add(res);

        res = Object.assign(res, await (responseMock.body as Function)(requestInfo, res));

        responseMockSetBodyMethod.remove(res);

        return res;
    }

    public async getWarningMessages ({ testRunId }: TestRunLocator): Promise<string[]> {
        const testRunProxy = this.state.testRuns[testRunId];

        return testRunProxy.warningLog.messages;
    }

    public async addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void> {
        return await this.proxy.call(this.addRequestEventListeners, { hookId, hookClassName, rules });
    }

    public async removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void> {
        return await this.proxy.call(this.removeRequestEventListeners, { rules });
    }

    public async initializeTestRunData ({ testRunId, testId }: InitializeTestRunDataArguments): Promise<void> {
        const test = this.state.units[testId] as Test;

        this._initializeTestRunProxy(testRunId, test);
        this._initializeFixtureCtx(test);
    }

    public async getCurrentUrl ({ testRunId }: TestRunLocator): Promise<string> {
        return this.proxy.call(this.getCurrentUrl, { testRunId });
    }

    public async getStateSnapshot ({ testRunId }: TestRunLocator): Promise<StateSnapshot> {
        return this.proxy.call(this.getStateSnapshot, { testRunId });
    }

    public enableDebugForNonDebugCommands (): void {
        TestController.enableDebugForNonDebugCommands();
    }

    public disableDebugForNonDebugCommands (): void {
        TestController.disableDebugForNonDebugCommands();
    }

    public async useStateSnapshot ({ testRunId, snapshot }: UseStateSnapshotArguments): Promise<void> {
        return this.proxy.call(this.useStateSnapshot, { testRunId, snapshot });
    }

    public async getTestRunPhase ({ testRunId }: TestRunLocator): Promise<TestRunPhase> {
        return this.proxy.call(this.getTestRunPhase, { testRunId });
    }
    public async setTestRunPhase ({ testRunId, value }: SetTestRunPhaseArguments): Promise<void> {
        return this.proxy.call(this.setTestRunPhase, { testRunId, value });
    }

    public async getActiveDialogHandler ({ testRunId }: TestRunLocator): Promise<ExecuteClientFunctionCommand | null> {
        return this.proxy.call(this.getActiveDialogHandler, { testRunId });
    }

    public async getActiveIframeSelector ({ testRunId }: TestRunLocator): Promise<ExecuteSelectorCommand | null> {
        return this.proxy.call(this.getActiveIframeSelector, { testRunId });
    }

    public async getSpeed ({ testRunId }: TestRunLocator): Promise<number> {
        return this.proxy.call(this.getSpeed, { testRunId });
    }

    public async getPageLoadTimeout ({ testRunId }: TestRunLocator): Promise<number> {
        return this.proxy.call(this.getPageLoadTimeout, { testRunId });
    }

    public async setBrowserConsoleMessages ({ testRunId, value }: SetBrowserConsoleMessagesArguments): Promise<void> {
        return this.proxy.call(this.setBrowserConsoleMessages, { testRunId, value });
    }

    public async getBrowserConsoleMessages ({ testRunId }: TestRunLocator): Promise<BrowserConsoleMessages> {
        return this.proxy.call(this.getBrowserConsoleMessages, { testRunId });
    }
}

export default new CompilerService();
