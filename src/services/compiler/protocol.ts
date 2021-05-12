import { CompilerArguments } from '../../compiler/interfaces';
import { Dictionary } from '../../configuration/interfaces';
import RequestHookMethodNames from '../../api/request-hooks/hook-method-names';
import {
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    RequestEvent,
    ResponseEvent,
    ResponseMock,
    RequestInfo,
    IncomingMessageLikeInitOptions,
    RequestFilterRule
} from 'testcafe-hammerhead';

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

export interface RunTestArguments {
    id: string;
    functionName: FunctionProperties;
    testRunId: string;
}

export interface ExecuteActionArguments {
    id: string;
    apiMethodName: string;
    command: unknown;
    callsite: unknown;
}

export interface ExecuteCommandArguments {
    id: string;
    command: unknown;
}

export interface RemoveRequestEventListenersArguments {
    rules: RequestFilterRule[];
}

export interface AddRequestEventListenersArguments {
    hookId: string;
    hookClassName: string;
    rules: RequestFilterRule[];
}

export interface SetOptionsArguments {
    value: Dictionary<OptionValue>;
}

export interface RequestHookEventArguments {
    name: RequestHookMethodNames;
    testId: string;
    hookId: string;
    eventData: RequestEvent | ConfigureResponseEvent | ResponseEvent;
}

export interface SetMockArguments extends RequestFilterRuleLocator {
    responseEventId: string;
    mock: ResponseMock;
}

export interface SetConfigureResponseEventOptionsArguments {
    eventId: string;
    opts: ConfigureResponseEventOptions;
}

export interface SetHeaderOnConfigureResponseEventArguments {
    eventId: string;
    headerName: string;
    headerValue: string;
}

export interface RemoveHeaderOnConfigureResponseEventArguments {
    eventId: string;
    headerName: string;
}

export interface RequestHookLocator {
    testId: string;
    hookId: string;
}

export interface RequestFilterRuleLocator extends RequestHookLocator {
    ruleId: string;
}

export interface ExecuteRequestFilterRulePredicateArguments extends RequestFilterRuleLocator {
    requestInfo: RequestInfo;
}

export interface ExecuteMockPredicate extends RequestFilterRuleLocator {
    requestInfo: RequestInfo;
    res: IncomingMessageLikeInitOptions;
}

export interface GetWarningMessagesArguments {
    testRunId: string;
}

export interface InitializeTestRunDataArguments {
    testRunId: string;
    testId: string;
}

export interface TestRunDispatcherProtocol {
    executeActionSync ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): unknown;
    executeAction ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): Promise<unknown>;
    executeCommand ({ command }: ExecuteCommandArguments): Promise<unknown>;
    addRequestEventListeners ( { hookId, hookClassName, rules }: AddRequestEventListenersArguments): Promise<void>;
    removeRequestEventListeners ({ rules }: RemoveRequestEventListenersArguments): Promise<void>;
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

    getWarningMessages ({ testRunId }: GetWarningMessagesArguments): Promise<string[]>;

    initializeTestRunData ({ testRunId, testId }: InitializeTestRunDataArguments): Promise<void>;
}
