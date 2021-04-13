import { CompilerArguments } from '../../compiler/interfaces';
import { Dictionary } from '../../configuration/interfaces';
import RequestHookMethodNames from '../../api/request-hooks/hook-method-names';
import {
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    RequestEvent,
    RequestFilterRule,
    ResponseEvent,
    ResponseMock
} from 'testcafe-hammerhead';

export const BEFORE_AFTER_PROPERTIES  = ['beforeFn', 'afterFn'] as const;
export const BEFORE_AFTER_EACH_PROPERTIES = ['beforeEachFn', 'afterEachFn'] as const;
export const TEST_FUNCTION_PROPERTIES = ['fn', ...BEFORE_AFTER_PROPERTIES] as const;
export const FUNCTION_PROPERTIES = [...TEST_FUNCTION_PROPERTIES, ...BEFORE_AFTER_EACH_PROPERTIES] as const;

export type FunctionProperties = typeof FUNCTION_PROPERTIES[number];
export type TestFunctionProperties = typeof TEST_FUNCTION_PROPERTIES[number];
export type FixtureFunctionProperties = typeof BEFORE_AFTER_EACH_PROPERTIES[number];


export function isTestFunctionProperty (value: FunctionProperties): value is TestFunctionProperties {
    return TEST_FUNCTION_PROPERTIES.includes(value as TestFunctionProperties);
}

export function isFixtureFunctionProperty (value: FunctionProperties): value is FixtureFunctionProperties {
    return BEFORE_AFTER_EACH_PROPERTIES.includes(value as FixtureFunctionProperties);
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

export interface SetOptionsArguments {
    value: Dictionary<OptionValue>;
}

export interface RequestHookEventArguments {
    name: RequestHookMethodNames;
    testRunId: string;
    testId: string;
    hookId: string;
    eventData: RequestEvent | ConfigureResponseEvent | ResponseEvent;
}

export interface SetMockArguments {
    rule: RequestFilterRule;
    mock: ResponseMock;
}

export interface SetConfigureResponseEventOptionsArguments {
    rule: RequestFilterRule;
    opts: ConfigureResponseEventOptions;
}

export interface TestRunDispatcherProtocol {
    executeAction ({ id, apiMethodName, command, callsite }: ExecuteActionArguments): Promise<unknown>;
    executeCommand ({ command }: ExecuteCommandArguments): Promise<unknown>;
}

export interface CompilerProtocol extends TestRunDispatcherProtocol {
    ready (): Promise<void>;

    getTests ({ sourceList, compilerOptions }: CompilerArguments): Promise<unknown>;

    runTest ({ id, functionName, testRunId }: RunTestArguments): Promise<unknown>;

    cleanUp (): Promise<void>;

    setOptions ({ value }: SetOptionsArguments): Promise<void>;

    onRequestHookEvent ({ name, testRunId, testId, hookId, eventData }: RequestHookEventArguments): Promise<void>;

    setMock ({ rule, mock }: SetMockArguments): Promise<void>;

    setConfigureResponseEventOptions ({ rule, opts }: SetConfigureResponseEventOptionsArguments): Promise<void>;
}
