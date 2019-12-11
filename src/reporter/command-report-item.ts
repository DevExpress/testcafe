import { Dictionary } from '../configuration/interfaces';
import { ExecuteSelectorCommand, ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import { NavigateToCommand, SetNativeDialogHandlerCommand, UseRoleCommand } from '../test-run/commands/actions';

interface Command {
    type: string;
    _getAssignableProperties(): { name: string }[];
}

export class CommandReportItem implements Dictionary<any> {
    [key: string]: any;

    public constructor (command: Command & Dictionary<any>) {
        this.type = command.type;

        if (command instanceof ExecuteSelectorCommand)
            this.selector = this._prepareSelector(command);
        else if (command instanceof ExecuteClientFunctionCommand)
            this.clientFn = this._prepareClientFunction(command);
        else if (command instanceof UseRoleCommand)
            this.role = this._prepareRole(command);
        else if (command instanceof NavigateToCommand)
            this.url = this._prepareUrl(command);
        else if (command instanceof SetNativeDialogHandlerCommand)
            this.dialogHandler = this._prepareDialogHandler(command);
        else
            this._prepareProperties(command);
    }

    private _prepareSelector (selector: ExecuteSelectorCommand): string {
        const selectorChain = (selector as any).apiFnChain as string[];

        return selectorChain.join('');
    }

    private _prepareClientFunction (fn: ExecuteClientFunctionCommand & Dictionary<any>): any {
        return {
            code: fn.fnCode,
            args: fn.args[0]
        };
    }

    private _prepareDialogHandler (command: Dictionary<any>): any {
        return this._prepareClientFunction(command.dialogHandler);
    }

    private _prepareRole (roleCommand: UseRoleCommand & Dictionary<any>): any {
        const { loginPage, opts, phase } = roleCommand.role;

        return { loginPage, options: opts, phase };
    }

    private _prepareUrl (navigateCommand: NavigateToCommand & Dictionary<any>): any {
        return navigateCommand.url;
    }


    private _prepareProperties (command: Command & Dictionary<any>): void {
        if (!command._getAssignableProperties)
            return;

        const sourceProperties = command._getAssignableProperties().map(prop => prop.name);

        sourceProperties.forEach((key: string) => {
            const prop = command[key];

            if (prop instanceof ExecuteSelectorCommand)
                this[key] = this._prepareSelector(prop);
            else
                this[key] = prop;
        });
    }
}
