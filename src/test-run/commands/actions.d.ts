import CommandBase from './base';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './observation';

import {
    ActionOptions,
    ClickOptions,
    DragToElementOptions,
    MouseOptions,
    PressOptions,
    TypeOptions,
} from './options';

import Role from '../../role/role';
import TestRun from '../index';


export class SetNativeDialogHandlerCommand extends CommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public dialogHandler: ExecuteClientFunctionCommand;
    public static from (val: object): SetNativeDialogHandlerCommand;
}

export class NavigateToCommand extends CommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public url: string;
    public stateSnapshot: string;
    public forceReload: boolean;
}

export class PressKeyCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public keys: string;
    public options: PressOptions;
}

export class TypeTextCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteSelectorCommand;
    public text: string;
    public options: TypeOptions;
}

export class UseRoleCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public role: Role;
}

export class OpenWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public url: string;
}

export class CloseWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public windowId: string;
}

export class GetCurrentWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class GetCurrentWindowsCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SwitchToWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public windowId: string;
}

export interface CheckWindowPredicateData {
    url: URL;
    title: string;
}

export class SwitchToWindowByPredicateCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public id: string;
    public checkWindow(w: CheckWindowPredicateData): boolean;
}

export class SwitchToParentWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SwitchToPreviousWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SetTestSpeedCommand extends CommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public speed: number;
}

export class SetPageLoadTimeoutCommand extends CommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public duration: number;
}

export class SwitchToIframeCommand extends CommandBase {
    public constructor(obj: object, testRun?: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
}

export class SwitchToMainWindowCommand extends CommandBase { }

export class ClickCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class RightClickCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class DoubleClickCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ClickOptions;
}

export class DragCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public dragOffsetX: number;
    public dragOffsetY: number;
    public options: DragToElementOptions;
}

export class DragToElementCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public destinationSelector: ExecuteClientFunctionCommand;
    public options: DragToElementOptions;
}

export class SelectTextCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public startPos: number;
    public endPos: number;
    public options: ActionOptions;
}

export class SelectEditableContentCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public startSelector: ExecuteClientFunctionCommand;
    public endSelector: ExecuteClientFunctionCommand;
    public options: ActionOptions;
}

export class SelectTextAreaContentCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public startLine: number;
    public startPos: number;
    public endLine: number;
    public endPos: number;
    public options: ActionOptions;
}

export class HoverCommand extends CommandBase {
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

export class SetFilesToUploadCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public filePath: string | string[];
}

export class ClearUploadCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
}

export class DispatchEventCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public eventName: string;
    public options: ActionOptions;
    public relatedTarget: ExecuteClientFunctionCommand;
}

export class ScrollCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public position: string;
    public x: number;
    public y: number;
    public options: ActionOptions;
}

export class ScrollByCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public byX: number;
    public byY: number;
    public options: ActionOptions;
}

export class ScrollIntoViewCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: ActionOptions;
}
