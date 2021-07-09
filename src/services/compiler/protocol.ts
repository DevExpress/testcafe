import { CompilerArguments } from '../../compiler/interfaces';
import { IncomingMessageLikeInitOptions } from 'testcafe-hammerhead';
import Role from '../../role/role';

import {
    AddRequestEventListenersArguments,
    ExecuteActionArguments,
    ExecuteCommandArguments,
    ExecuteMockPredicate,
    ExecuteRequestFilterRulePredicateArguments,
    ExecuteRoleInitFnArguments,
    GetAssertionActualValueArguments,
    InitializeTestRunDataArguments,
    RemoveHeaderOnConfigureResponseEventArguments,
    RemoveRequestEventListenersArguments,
    RequestHookEventArguments,
    SetConfigureResponseEventOptionsArguments,
    SetCtxArguments,
    SetHeaderOnConfigureResponseEventArguments,
    SetMockArguments,
    SetOptionsArguments,
    TestRunLocator,
    UpdateRolePropertyArguments
} from './interfaces';

export const BEFORE_AFTER_PROPERTIES      = ['beforeFn', 'afterFn'] as const;
export const BEFORE_AFTER_EACH_PROPERTIES = ['beforeEachFn', 'afterEachFn'] as const;
export const TEST_FUNCTION_PROPERTIES     = ['fn', ...BEFORE_AFTER_PROPERTIES] as const;
export const FIXTURE_FUNCTION_PROPERTIES  = [...BEFORE_AFTER_PROPERTIES, ...BEFORE_AFTER_EACH_PROPERTIES] as const;
export const FUNCTION_PROPERTIES          = [...TEST_FUNCTION_PROPERTIES, ...BEFORE_AFTER_EACH_PROPERTIES] as const;

export type FunctionProperties = typeof FUNCTION_PROPERTIES[number];
export type TestFunctionProperties = typeof TEST_FUNCTION_PROPERTIES[number];
export type FixtureFunctionProperties = typeof FIXTURE_FUNCTION_PROPERTIES[number];


export function isTestFunctionProperty (value: FunctionProperties): value is TestFunctionProperties {
    return TEST_FUNCTION_PROPERTIES.includes(value as TestFunctionProperties);
}

export function isFixtureFunctionProperty (value: FunctionProperties): value is FixtureFunctionProperties {
    return FIXTURE_FUNCTION_PROPERTIES.includes(value as FixtureFunctionProperties);
}

export interface RunTestArguments extends TestRunLocator {
    id: string;
    functionName: FunctionProperties;
}

export interface TestRunDispatcherProtocol {
    executeActionSync ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): unknown;
    executeAction ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): Promise<unknown>;
    executeCommand ({ command }: ExecuteCommandArguments): Promise<unknown>;
    addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void>;
    removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void>;
    getAssertionActualValue ({ testRunId, commandId }: GetAssertionActualValueArguments): Promise<unknown>;
    executeRoleInitFn ({ testRunId, roleId }: ExecuteRoleInitFnArguments): Promise<unknown>;
    onRoleAppeared (role: Role): void;
}

export interface CompilerProtocol extends TestRunDispatcherProtocol {
    ready (): Promise<void>;
    getTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<unknown>;
    runTestFn ({ id, functionName, testRunId }: RunTestArguments): Promise<unknown>;
    cleanUp (): Promise<void>;
    setOptions ({ value }: SetOptionsArguments): Promise<void>;
    onRequestHookEvent ({ name, testId, hookId, eventData }: RequestHookEventArguments): Promise<void>;
    setMock ({ responseEventId, mock }: SetMockArguments): Promise<void>;
    setConfigureResponseEventOptions ({ eventId, opts }: SetConfigureResponseEventOptionsArguments): Promise<void>;
    setHeaderOnConfigureResponseEvent ({ eventId, headerName, headerValue }: SetHeaderOnConfigureResponseEventArguments): Promise<void>;
    removeHeaderOnConfigureResponseEvent ({ eventId, headerName }: RemoveHeaderOnConfigureResponseEventArguments): Promise<void>;
    executeRequestFilterRulePredicate ({ testId, hookId, ruleId, requestInfo }: ExecuteRequestFilterRulePredicateArguments): Promise<boolean>;
    executeMockPredicate ({ testId, hookId, ruleId, requestInfo, res }: ExecuteMockPredicate): Promise<IncomingMessageLikeInitOptions>;
    getWarningMessages ({ testRunId }: TestRunLocator): Promise<string[]>;
    initializeTestRunData ({ testRunId, testId }: InitializeTestRunDataArguments): Promise<void>;
    getCtx ({ testRunId }: TestRunLocator): Promise<object>;
    getFixtureCtx ({ testRunId }: TestRunLocator): Promise<object>;
    setCtx ({ testRunId, value }: SetCtxArguments): Promise<void>;
    setFixtureCtx ({ testRunId, value }: SetCtxArguments): Promise<void>;
    updateRoleProperty ({ roleId, name, value }: UpdateRolePropertyArguments): Promise<void>;
}
