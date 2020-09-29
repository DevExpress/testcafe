import { isEmpty } from 'lodash';
import { ExecuteSelectorCommand, ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import {
    NavigateToCommand,
    SetNativeDialogHandlerCommand,
    UseRoleCommand
} from '../../test-run/commands/actions';

import { createReplicator, SelectorNodeTransform } from '../../client-functions/replicator';
import {
    Command,
    FormattedCommand,
    SelectorInfo
} from './interfaces';

import { Dictionary } from '../../configuration/interfaces';
import diff from '../../utils/diff';

import {
    ActionOptions,
    ResizeToFitDeviceOptions,
    AssertionOptions
} from '../../test-run/commands/options';


function isCommandOptions (obj: object): boolean {
    return obj instanceof ActionOptions || obj instanceof ResizeToFitDeviceOptions || obj instanceof AssertionOptions;
}

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
        const expression    = selectorChain.join('');

        const result: SelectorInfo = { expression };

        let element = null;

        if (this._result)
            element = this._getElementByPropertyName(propertyName);

        if (element)
            result.element = element;

        if (command.timeout)
            result.timeout = command.timeout;

        return result;
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
        const { loginUrl, opts, phase } = command.role;

        return { loginUrl, options: opts, phase };
    }

    private _prepareUrl (command: Command): string {
        return command.url;
    }

    private _assignProperties (command: Command, formattedCommand: FormattedCommand): void {
        if (!this._command._getAssignableProperties)
            return;

        const sourceProperties = this._command._getAssignableProperties().map(prop => prop.name);

        sourceProperties.forEach((key: string) => {
            const property = this._command[key];

            if (property instanceof ExecuteSelectorCommand)
                formattedCommand[key] = this._prepareSelector(property, key);
            else if (isCommandOptions(property)) {
                const modifiedOptions = CommandFormatter._getModifiedOptions(property);

                if (!isEmpty(modifiedOptions))
                    formattedCommand[key] = modifiedOptions;
            }
            else
                formattedCommand[key] = property;
        });
    }

    private _ensureSelectorElements (): void {
        if (!this._result || this._elements.length)
            return;

        const decoded = createReplicator(new SelectorNodeTransform()).decode(this._result);

        this._elements = Array.isArray(decoded) ? decoded : [decoded];
    }

    private static _getModifiedOptions (commandOptions: object): Dictionary<object> | null {
        const constructor    = commandOptions.constructor as ObjectConstructor;
        const defaultOptions = new constructor();

        return diff(defaultOptions as Dictionary<object>, commandOptions as Dictionary<object>);
    }
}
