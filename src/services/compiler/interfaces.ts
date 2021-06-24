import CommandBase from '../../test-run/commands/base';

import {
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    IncomingMessageLikeInitOptions,
    RequestEvent,
    RequestFilterRule,
    RequestInfo,
    ResponseEvent,
    ResponseMock
} from 'testcafe-hammerhead';

import { Dictionary } from '../../configuration/interfaces';
import RequestHookMethodNames from '../../api/request-hooks/hook-method-names';
import Role from '../../role/role';

export interface TestRunLocator {
    testRunId: string;
}

export interface ExecuteActionArguments {
    id: string;
    apiMethodName: string;
    command: CommandBase;
    callsite: unknown;
}

export interface ExecuteCommandArguments {
    id: string;
    command: CommandBase;
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
}

export interface GetAssertionActualValueArguments extends TestRunLocator {
    commandId: string;
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
