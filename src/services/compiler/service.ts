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
    Units,
} from '../serialization/test-structure';

import {
    SERVICE_INPUT_FD,
    SERVICE_OUTPUT_FD,
    SERVICE_SYNC_FD,
} from './io';

import { IPCProxy } from '../utils/ipc/proxy';
import { ServiceTransport } from '../utils/ipc/transport';

import {
    CompilerProtocol,
    FunctionProperties,
    isFixtureFunctionProperty,
    isTestFunctionProperty,
    RunTestArguments,
} from './protocol';

import {
    ExecuteCommandArguments,
    ExecuteMockPredicate,
    ExecuteRequestFilterRulePredicateArguments,
    RemoveHeaderOnConfigureResponseEventArguments,
    RequestHookEventArguments,
    RequestHookLocator,
    SetConfigureResponseEventOptionsArguments,
    SetHeaderOnConfigureResponseEventArguments,
    SetMockArguments,
    SetOptionsArguments,
    AddRequestEventListenersArguments,
    RemoveRequestEventListenersArguments,
    InitializeTestRunDataArguments,
    TestRunLocator,
    SetCtxArguments,
    ExecuteRoleInitFnArguments,
    UpdateRolePropertyArguments,
    ExecuteJsExpressionArguments,
    ExecuteAsyncJsExpressionArguments,
    CommandLocator,
    AddUnexpectedErrorArguments,
    CheckWindowArgument,
    RemoveFixtureCtxsArguments,
    RemoveUnitsFromStateArguments,
} from './interfaces';

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
} from 'testcafe-hammerhead';

import RequestHook from '../../api/request-hooks/hook';
import RequestMock from '../../api/request-hooks/request-mock';
import Role from '../../role/role';
import userVariables from '../../api/user-variables';
import { executeJsExpression, executeAsyncJsExpression } from '../../test-run/execute-js-expression';

import {
    UncaughtErrorInCustomScript,
    UncaughtExceptionError,
    UncaughtTestCafeErrorInCustomScript,
    UnhandledPromiseRejectionError,
} from '../../errors/test-run';

import { renderHtmlWithoutStack, shouldRenderHtmlWithoutStack } from '../../errors/test-run/render-error-template/utils';
import { setupSourceMapSupport } from '../../utils/setup-sourcemap-support';
import { formatError } from '../../utils/handle-errors';
import { SwitchToWindowPredicateError } from '../../shared/errors';
import MessageBus from '../../utils/message-bus';
import { WarningLogMessage } from '../../notifications/warning-log';
import { uniq } from 'lodash';

setupSourceMapSupport();

// This is hack for supporting the 'import { t } from "testcafe"' expression in tests.
// It caused by using the 'esm' module.
require('../../api/test-controller/proxy');

interface ServiceState {
    testRuns: { [id: string]: TestRunProxy };
    fixtureCtxs: { [id: string]: object };
    units: Units;
    options: Dictionary<OptionValue>;
    roles: Map<string, Role>;
}

interface WrapSetMockArguments extends RequestHookLocator {
    event: RequestEvent;
}

interface InitTestRunProxyData {
    testRunId: string;
    test: Test;
    browser: Browser;
    activeWindowId: string | null;
    messageBus?: MessageBus;
}

class CompilerService implements CompilerProtocol {
    private readonly proxy: IPCProxy;
    private readonly state: ServiceState;
    private readonly _runnableConfigurationUnitsRelations: { [id: string]: string[] };

    public constructor () {
        process.title = ProcessTitle.service;

        const input  = fs.createReadStream('', { fd: SERVICE_INPUT_FD });
        const output = fs.createWriteStream('', { fd: SERVICE_OUTPUT_FD });

        this.proxy = new IPCProxy(new ServiceTransport(input, output, SERVICE_SYNC_FD));
        this.state = this._initState();

        this._runnableConfigurationUnitsRelations = {};

        this._registerErrorHandlers();
        this._setupRoutes();
        this.ready();
    }

    private _initState (): ServiceState {
        return {
            testRuns:    {},
            fixtureCtxs: {},
            units:       {},
            options:     {},
            roles:       new Map<string, Role>(),
        };
    }

    private async _handleUnexpectedError (ErrorCtor: Function, error: Error): Promise<void> {
        const message = formatError(ErrorCtor, error);
        const type    = ErrorCtor.name;

        await this.addUnexpectedError({ type, message });
    }

    private _registerErrorHandlers (): void {
        process.on('unhandledRejection', async e => this._handleUnexpectedError(UnhandledPromiseRejectionError, e as Error));
        process.on('uncaughtException', async e => this._handleUnexpectedError(UncaughtExceptionError, e as Error));
    }

    private _getFixtureCtx (unit: Unit): object {
        const fixtureId = isTest(unit) ? (unit.fixture as Fixture).id : (unit as Fixture).id;

        return this.state.fixtureCtxs[fixtureId];
    }

    private _getTestCtx ({ testRunId }: RunTestArguments, unit: Unit): TestRunProxy {
        const testRunProxy = this._getTargetTestRun(testRunId);

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
            this.setUserVariables,
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
            this.getAssertionActualValue,
            this.executeRoleInitFn,
            this.getCtx,
            this.getFixtureCtx,
            this.setCtx,
            this.setFixtureCtx,
            this.updateRoleProperty,
            this.executeJsExpression,
            this.executeAsyncJsExpression,
            this.addUnexpectedError,
            this.checkWindow,
            this.removeTestRunFromState,
            this.removeFixtureCtxsFromState,
            this.removeUnitsFromState,
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
                mock,
            });
        };
    }

    private _wrapConfigureResponseEventMethods (event: ConfigureResponseEvent): void {
        event.setHeader = async (name: string, value: string) => {
            await this.setHeaderOnConfigureResponseEvent({
                eventId:     event.id,
                headerName:  name,
                headerValue: value,
            });
        };

        event.removeHeader = async (name: string) => {
            await this.removeHeaderOnConfigureResponseEvent({
                eventId:    event.id,
                headerName: name,
            });
        };
    }

    private _initializeTestRunProxy ({ testRunId, test, browser, activeWindowId, messageBus }: InitTestRunProxyData): void {
        const testRunProxy = new TestRunProxy({
            dispatcher: this,
            id:         testRunId,
            options:    this.state.options,
            test,
            browser,
            activeWindowId,
            messageBus,
        });

        this.state.testRuns[testRunId] = testRunProxy;
    }

    private _initializeFixtureCtx (test: Test): void {
        const fixtureId = (test.fixture as Fixture).id;

        if (this.state.fixtureCtxs[fixtureId])
            return;

        this.state.fixtureCtxs[fixtureId] = Object.create(null);
    }

    private _getTargetTestRun (testRunId: string): TestRunProxy {
        return this.state.testRuns[testRunId];
    }

    private _getTargetRole (roleId: string): Role {
        return this.state.roles.get(roleId) as Role;
    }

    public async setUserVariables (value: UserVariables | null): Promise<void> {
        userVariables.value = value;
    }

    private _getUnitIds (tests: Test[]): string[] {
        const testIds     = tests.map(test => test.id);
        const fixtureIds  = tests.map(test => test.fixture?.id) as string[];
        const testFileIds = tests.map(test => test.testFile.id);

        return uniq([...testIds, ...fixtureIds, ...testFileIds]);
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

    public async getTests ({ sourceList, compilerOptions, runnableConfigurationId }: CompilerArguments, baseUrl?: string): Promise<Units> {
        const compiler = new Compiler(sourceList, compilerOptions, { isCompilerServiceMode: true, baseUrl, experimentalEsm: false });

        const tests   = await compiler.getTests();
        const units   = flattenTestStructure(tests);
        const unitIds = this._getUnitIds(tests);

        this._runnableConfigurationUnitsRelations[runnableConfigurationId] = unitIds;

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

    public executeCommandSync ({ id, command, callsite }: ExecuteCommandArguments): unknown {
        return this.proxy.callSync(this.executeCommand, { id, command, callsite });
    }

    public async executeCommand ({ command, id, callsite }: ExecuteCommandArguments): Promise<unknown> {
        return this.proxy.call(this.executeCommand, { id, command, callsite });
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

    public async getWarningMessages ({ testRunId }: TestRunLocator): Promise<WarningLogMessage[]> {
        // NOTE: In case of raising an error into ReporterPluginHost methods,
        // TestRun has time to start.
        const targetTestRun = this._getTargetTestRun(testRunId);

        return targetTestRun ? targetTestRun.warningLog.messageInfos : [];
    }

    public async addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void> {
        return await this.proxy.call(this.addRequestEventListeners, { hookId, hookClassName, rules });
    }

    public async removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void> {
        return await this.proxy.call(this.removeRequestEventListeners, { rules });
    }

    public async initializeTestRunData ({ testRunId, testId, browser, activeWindowId, messageBus }: InitializeTestRunDataArguments): Promise<void> {
        // NOTE: In case of raising an error into ReporterPluginHost methods,
        // TestRun has time to start.
        const test = this.state.units[testId] as Test;

        if (!test)
            return;

        this._initializeTestRunProxy({ testRunId, test, browser, activeWindowId, messageBus });
        this._initializeFixtureCtx(test);
    }

    public enableDebugForNonDebugCommands (): void {
        TestController.enableDebugForNonDebugCommands();
    }

    public disableDebugForNonDebugCommands (): void {
        TestController.disableDebugForNonDebugCommands();
    }

    public async getAssertionActualValue ({ testRunId, commandId }: CommandLocator): Promise<unknown> {
        return this._getTargetTestRun(testRunId).getAssertionActualValue(commandId);
    }

    public async executeRoleInitFn ({ testRunId, roleId }: ExecuteRoleInitFnArguments): Promise<unknown> {
        const role         = this._getTargetRole(roleId);
        const testRunProxy = this._getTargetTestRun(testRunId);

        return (role._initFn as Function)(testRunProxy);
    }

    public async getCtx ({ testRunId }: TestRunLocator): Promise<object> {
        return this._getTargetTestRun(testRunId).ctx;
    }

    public async getFixtureCtx ({ testRunId }: TestRunLocator): Promise<object> {
        return this._getTargetTestRun(testRunId).fixtureCtx;
    }

    public async setCtx ({ testRunId, value }: SetCtxArguments): Promise<void> {
        this._getTargetTestRun(testRunId).ctx = value;
    }

    public async setFixtureCtx ({ testRunId, value }: SetCtxArguments): Promise<void> {
        this._getTargetTestRun(testRunId).fixtureCtx = value;
    }

    public onRoleAppeared (role: Role): void {
        if (this.state.roles.has(role.id))
            return;

        this.state.roles.set(role.id, role);
    }

    public async updateRoleProperty ({ roleId, name, value }: UpdateRolePropertyArguments): Promise<void> {
        const role = this._getTargetRole(roleId);

        // @ts-ignore
        role[name] = value;
    }

    public async executeJsExpression ({ expression, testRunId, options }: ExecuteJsExpressionArguments): Promise<unknown> {
        const testRunProxy = this._getTargetTestRun(testRunId);

        return executeJsExpression(expression, testRunProxy, options);
    }

    public async executeAsyncJsExpression ({ expression, testRunId, callsite }: ExecuteAsyncJsExpressionArguments): Promise<unknown> {
        const testRunProxy = this._getTargetTestRun(testRunId);

        return executeAsyncJsExpression(expression, testRunProxy, callsite, async (err: UncaughtTestCafeErrorInCustomScript | UncaughtErrorInCustomScript) => {
            if (err instanceof UncaughtTestCafeErrorInCustomScript === false)
                return;

            const targetError = err as UncaughtTestCafeErrorInCustomScript;

            if (!shouldRenderHtmlWithoutStack(targetError))
                return;

            testRunProxy.restoreOriginCallsiteForError(targetError);

            // @ts-ignore
            err.errCallsite = renderHtmlWithoutStack(targetError);
        });
    }

    public async executeAssertionFn ({ testRunId, commandId }: CommandLocator): Promise<unknown> {
        return this
            ._getTargetTestRun(testRunId)
            .executeAssertionFn(commandId);
    }

    public async addUnexpectedError ({ type, message }: AddUnexpectedErrorArguments): Promise<void> {
        return this.proxy.call(this.addUnexpectedError, { type, message });
    }

    public async checkWindow ({ testRunId, commandId, url, title }: CheckWindowArgument): Promise<boolean> {
        try {
            return this
                ._getTargetTestRun(testRunId)
                .checkWindow(commandId, { title, url });
        }
        catch (err: any) {
            throw new SwitchToWindowPredicateError(err.message);
        }
    }

    public async removeTestRunFromState ({ testRunId }: TestRunLocator): Promise<void> {
        delete this.state.testRuns[testRunId];
    }

    public async removeFixtureCtxsFromState ({ fixtureIds }: RemoveFixtureCtxsArguments): Promise<void> {
        for (const fixtureId of fixtureIds)
            delete this.state.fixtureCtxs[fixtureId];
    }

    public async removeUnitsFromState ({ runnableConfigurationId }: RemoveUnitsFromStateArguments): Promise<void> {
        const unitIds = this._runnableConfigurationUnitsRelations[runnableConfigurationId];

        for (const unitId of unitIds)
            delete this.state.units[unitId];

        delete this._runnableConfigurationUnitsRelations[runnableConfigurationId];
    }
}

export default new CompilerService();
