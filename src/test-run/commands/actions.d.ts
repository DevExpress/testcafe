import CommandBase from './base';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './observation';

import {
    ActionOptions,
    ClickOptions,
    DragToElementOptions,
    MouseOptions,
    PressOptions,
    TypeOptions
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

export class GetCurrentWindowsCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
}

export class SwitchToWindowCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public windowId: string;
}

export class SwitchToWindowByPredicateCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public findWindow: Function;
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

export class DragToElementCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public destinationSelector: ExecuteClientFunctionCommand;
    public options: DragToElementOptions;
}

export class SelectEditableContentCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public startSelector: ExecuteClientFunctionCommand;
    public endSelector: ExecuteClientFunctionCommand;
    public options: ActionOptions;
}

export class HoverCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector: ExecuteClientFunctionCommand;
    public options: MouseOptions;
}
