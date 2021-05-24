import CommandBase from './base';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './observation';
import { PressOptions, TypeOptions } from './options';
import Role from '../../role/role';

export class SetNativeDialogHandlerCommand extends CommandBase {
    public dialogHandler: ExecuteClientFunctionCommand;
}

export class NavigateToCommand extends CommandBase {
    public url: string;
    public stateSnapshot: string;
    public forceReload: boolean;
}

export class PressKeyCommand extends CommandBase {
    public keys: string;
    public options: PressOptions;
}

export class TypeTextCommand extends CommandBase {
    public selector: ExecuteSelectorCommand | unknown;
    public text: string;
    public options: TypeOptions;
}

export class UseRoleCommand extends CommandBase {
    public role: Role;
}

export class GetCurrentWindowsCommand extends CommandBase { }

export class SwitchToWindowCommand extends CommandBase {
    public windowId: string;
}

export class SwitchToWindowByPredicateCommand extends CommandBase {
    public findWindow: Function;
}
