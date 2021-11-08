import { CommandBase } from '../../test-run/commands/base';

import {
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    IncomingMessageLikeInitOptions,
    RequestEvent,
    RequestFilterRule,
    RequestInfo,
    ResponseEvent,
    ResponseMock,
} from 'testcafe-hammerhead';

import { Dictionary } from '../../configuration/interfaces';
import RequestHookMethodNames from '../../api/request-hooks/hook-method-names';
import Role from '../../role/role';
import { CallsiteRecord } from 'callsite-record';
import MessageBus from '../../utils/message-bus';

export interface TestRunLocator {
    testRunId: string;
}

export interface ExecuteCommandArguments {
    id: string;
    command: CommandBase;
    callsite?: string | CallsiteRecord;
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

export interface InitializeTestRunDataArguments extends TestRunLocator {
    testId: string;
    browser: Browser;
    activeWindowId: string | null;
    messageBus?: MessageBus;
}

export interface RoleLocator {
    roleId: string;
}

export interface SetCtxArguments extends TestRunLocator {
    value: object;
}

export interface ExecuteRoleInitFnArguments extends RoleLocator {
    testRunId: string;
}

export interface UpdateRolePropertyArguments extends RoleLocator {
    name: keyof Role;
    value: unknown;
}

export interface ExecuteJsExpressionOptions {
    skipVisibilityCheck: boolean;
}

export interface ExecuteJsExpressionArguments extends TestRunLocator {
    expression: string;
    options: ExecuteJsExpressionOptions;
}

export interface ExecuteAsyncJsExpressionArguments extends TestRunLocator {
    expression: string;
    callsite?: string;
}

export interface CommandLocator extends TestRunLocator {
    commandId: string;
}

export interface AddUnexpectedErrorArguments {
    type: string;
    message: string;
}

export interface CheckWindowArgument extends TestRunLocator {
    commandId: string;
    url: URL;
    title: string;
}

export interface RemoveFixtureCtxsArguments {
    fixtureIds: string[];
}

export interface RemoveUnitsFromStateArguments {
    runnableConfigurationId: string;
}

