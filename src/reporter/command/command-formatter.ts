import { ExecuteSelectorCommand, ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import { NavigateToCommand, SetNativeDialogHandlerCommand, UseRoleCommand } from '../../test-run/commands/actions';
import { createReplicator, SelectorNodeTransform } from '../../client-functions/replicator';
import { Command, FormattedCommand, SelectorInfo } from './interfaces';

export class CommandFormatter {
    private _elements: HTMLElement[] = [];
    private readonly _command: Command;
    private readonly _result: unknown;

    public constructor (command: Command, result: unknown) {
        this._command = command;
        this._result = result;
    }

    public format (): FormattedCommand {
        const formattedCommand: FormattedCommand = { type: this._command.type };

        if (this._command instanceof ExecuteSelectorCommand)
            formattedCommand.selector = this._prepareSelector(this._command, 'selector');
        else if (this._command instanceof ExecuteClientFunctionCommand)
            formattedCommand.clientFn = this._prepareClientFunction(this._command);
        else if (this._command instanceof UseRoleCommand)
            formattedCommand.role = this._prepareRole(this._command);
        else if (this._command instanceof NavigateToCommand)
            formattedCommand.url = this._prepareUrl(this._command);
        else if (this._command instanceof SetNativeDialogHandlerCommand)
            formattedCommand.dialogHandler = this._prepareDialogHandler(this._command);
        else
            this._assignProperties(this._command, formattedCommand);

        return formattedCommand;
    }

    private _getElementByPropertyName (propertyName: string): HTMLElement {
        this._ensureSelectorElements();

        switch (propertyName) {
            case 'selector':
            case 'startSelector':
                return this._elements[0];
            case 'endSelector':
            case 'destinationSelector':
                return this._elements[1];
        }

        return this._elements[0];
    }

    private _prepareSelector (command: Command, propertyName: string): SelectorInfo {
        const selectorChain = command.apiFnChain as string[];

        const expression = selectorChain.join('');

        let element = null;

        if (this._result)
            element = this._getElementByPropertyName(propertyName);

        if (element)
            return { expression, element };

        return { expression };
    }

    private _prepareClientFunction (command: Command): object {
        return {
            code: command.fnCode,
            args: command.args[0]
        };
    }

    private _prepareDialogHandler (command: Command): object {
        return this._prepareClientFunction(command.dialogHandler);
    }

    private _prepareRole (command: Command): object {
        const { loginPage, opts, phase } = command.role;

        return { loginPage, options: opts, phase };
    }

    private _prepareUrl (command: Command): string {
        return command.url;
    }

    private _assignProperties (command: Command, formattedCommand: FormattedCommand): void {
        if (!this._command._getAssignableProperties)
            return;

        const sourceProperties = this._command._getAssignableProperties().map(prop => prop.name);

        sourceProperties.forEach((key: string) => {
            const prop = this._command[key];

            if (prop instanceof ExecuteSelectorCommand)
                formattedCommand[key] = this._prepareSelector(prop, key);
            else
                formattedCommand[key] = prop;
        });
    }

    private _ensureSelectorElements (): void {
        if (!this._result || this._elements.length)
            return;

        const decoded = createReplicator(new SelectorNodeTransform()).decode(this._result);

        this._elements = Array.isArray(decoded) ? decoded : [decoded];
    }
}
