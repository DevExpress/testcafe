import { ExecuteSelectorCommand, ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import { NavigateToCommand, SetNativeDialogHandlerCommand, UseRoleCommand } from '../test-run/commands/actions';

interface Command {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    type: string;
    _getAssignableProperties(): { name: string }[];
}

interface SelectorInfo {
    expression: string;
    element?: HTMLElement;
}

export class CommandReportItem {
    [key: string]: object|string;

    public constructor (command: Command, elements: HTMLElement[]) {
        this.type = command.type;

        if (command instanceof ExecuteSelectorCommand)
            this.selector = this._prepareSelector('selector', command, elements);
        else if (command instanceof ExecuteClientFunctionCommand)
            this.clientFn = this._prepareClientFunction(command);
        else if (command instanceof UseRoleCommand)
            this.role = this._prepareRole(command);
        else if (command instanceof NavigateToCommand)
            this.url = this._prepareUrl(command);
        else if (command instanceof SetNativeDialogHandlerCommand)
            this.dialogHandler = this._prepareDialogHandler(command);
        else
            this._prepareProperties(command, elements);
    }

    private _getElementByPropertyName (propertyName: string, elements: HTMLElement[]): HTMLElement {
        switch (propertyName) {
            case 'selector':
            case 'startSelector':
                return elements[0];
            case 'endSelector':
            case 'destinationSelector':
                return elements[1];
        }

        return elements[0];
    }

    private _prepareSelector (propertyName: string, selector: Command, elements: HTMLElement[]): SelectorInfo {
        const selectorChain = selector.apiFnChain as string[];

        const expression = selectorChain.join('');

        let element = null;

        if (elements)
            element = this._getElementByPropertyName(propertyName, elements);

        if (element)
            return { expression, element };

        return { expression };
    }

    private _prepareClientFunction (fn: Command): object {
        return {
            code: fn.fnCode,
            args: fn.args[0]
        };
    }

    private _prepareDialogHandler (command: Command): object {
        return this._prepareClientFunction(command.dialogHandler);
    }

    private _prepareRole (roleCommand: Command): object {
        const { loginPage, opts, phase } = roleCommand.role;

        return { loginPage, options: opts, phase };
    }

    private _prepareUrl (navigateCommand: Command): string {
        return navigateCommand.url;
    }

    private _prepareProperties (command: Command, elements: HTMLElement[]): void {
        if (!command._getAssignableProperties)
            return;

        const sourceProperties = command._getAssignableProperties().map(prop => prop.name);

        sourceProperties.forEach((key: string) => {
            const prop = command[key];

            if (prop instanceof ExecuteSelectorCommand)
                this[key] = this._prepareSelector(key, prop, elements);
            else
                this[key] = prop;
        });
    }
}
