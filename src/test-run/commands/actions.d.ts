import { ActionCommandBase, CommandBase } from './base';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './execute-client-function';

import {
    ActionOptions,
    ClickOptions,
    DragToElementOptions,
    MouseOptions,
    PressOptions,
    TypeOptions,
    CookieOptions,
    GetProxyUrlOptions,
} from './options';

import Role from '../../role/role';
import TestRun from '../index';
import { SkipJsErrorsOptionsObject } from '../../configuration/interfaces';
import RequestHook from '../../api/request-hooks/hook';


export class SetNativeDialogHandlerCommand extends ActionCommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public dialogHandler: ExecuteClientFunctionCommand;
    public static from (val: object): SetNativeDialogHandlerCommand;
}

export class NavigateToCommand extends ActionCommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public url: string;
    public stateSnapshot: string;
    public forceReload: boolean;
}

export class PressKeyCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public keys: string;
    public options: PressOptions;
}

export class TypeTextCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteSelectorCommand;
    public text: string;
    public options: TypeOptions;
}

export class UseRoleCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public role: Role;
}

export class OpenWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public url: string;
}

export class CloseWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public windowId: string;
}

export class GetCurrentWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class GetCurrentWindowsCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class GetCurrentCDPSessionCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SwitchToWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public windowId: string;
}

export interface CheckWindowPredicateData {
    url: URL;
    title: string;
}

export class SwitchToWindowByPredicateCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public id: string;
    public checkWindow(w: CheckWindowPredicateData): boolean;
}

export class SwitchToParentWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SwitchToPreviousWindowCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class GetNativeDialogHistoryCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class GetBrowserConsoleMessagesCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SetTestSpeedCommand extends ActionCommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public speed: number;
}

export class SetPageLoadTimeoutCommand extends ActionCommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public duration: number;
}

export class SwitchToIframeCommand extends ActionCommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public selector: ExecuteSelectorCommand;
}

export class SwitchToMainWindowCommand extends ActionCommandBase { }

export class ClickCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class RightClickCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class DoubleClickCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class DragCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public dragOffsetX: number;
    public dragOffsetY: number;
    public options: DragToElementOptions;
}

export class DragToElementCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public destinationSelector: ExecuteClientFunctionCommand;
    public options: DragToElementOptions;
}

export class SelectTextCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public startPos: number;
    public endPos: number;
    public options: ActionOptions;
}

export class SelectEditableContentCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public startSelector: ExecuteClientFunctionCommand;
    public endSelector: ExecuteClientFunctionCommand;
    public options: ActionOptions;
}

export class SelectTextAreaContentCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public startLine: number;
    public startPos: number;
    public endLine: number;
    public endPos: number;
    public options: ActionOptions;
}

export class HoverCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: MouseOptions;
}

export class ExecuteExpressionCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public expression: string;
    public resultVariableName: string;
}

export class ExecuteAsyncExpressionCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public expression: string;
}

export class SetFilesToUploadCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public filePath: string | string[];
}

export class ClearUploadCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
}

export class DispatchEventCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public eventName: string;
    public options: ActionOptions;
    public relatedTarget: ExecuteClientFunctionCommand;
}

export class ScrollCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public position: string;
    public x: number;
    public y: number;
    public options: ActionOptions;
}

export class ScrollByCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public byX: number;
    public byY: number;
    public options: ActionOptions;
}

export class ScrollIntoViewCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ActionOptions;
}

export class GetCookiesCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties: boolean);
    public urls: string[];
    public cookies: CookieOptions[];
}

export class SetCookiesCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties: boolean);
    public url: string;
    public cookies: CookieOptions[];
}

export class DeleteCookiesCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties: boolean);
    public urls: string[];
    public cookies: CookieOptions[];
}

export class RequestCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties: boolean);
    public url: string | URL;
    public options: RequestOptions;
}

export class GetProxyUrlCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties: boolean);
    public url: string;
    public options: GetProxyUrlOptions;
}

export class SkipJsErrorsCommand extends ActionCommandBase {
    public constructor (obj: object, testRun: TestRun, validateProperties: boolean);
    public options: SkipJsErrorsOptionsObject | SkipJsErrorsCallbackWithOptionsObject | boolean;
}

export class AddRequestHooksCommand extends ActionCommandBase {
    public constructor (obj: object, testRun: TestRun, validateProperties: boolean);
    public hooks: RequestHook[];
}

export class RemoveRequestHooksCommand extends ActionCommandBase {
    public constructor (obj: object, testRun: TestRun, validateProperties: boolean);
    public hooks: RequestHook[];
}

export class RunCustomActionCommand extends ActionCommandBase {
    public constructor (obj: object, testRun: TestRun, validateProperties: boolean);
    public fn: Function;
    public name: string;
    public args: any;
}

export class ReportCommand extends ActionCommandBase {
    public constructor (obj: object, testRun: TestRun, validateProperties: boolean);
    public args: any[];
}

