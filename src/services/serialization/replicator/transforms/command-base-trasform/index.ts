import BaseTransform from '../base-transform';
import { CommandBase } from '../../../../../test-run/commands/base';
import { SerializedCommand } from '../../interfaces';
import { isAssertionCommand, isObservationCommand } from '../../../../../test-run/commands/utils';
import TestRun from '../../../../../test-run';
import { ExecuteExpressionCommand, SetNativeDialogHandlerCommand } from '../../../../../test-run/commands/actions';
import COMMAND_CONSTRUCTORS from './command-constructors';
import ASSERTION_COMMAND_CONSTRUCTORS from './assertion-command-constructors';
import { CommandConstructor, ObservationConstructor } from './types';

const OBSERVABLE_COMMAND_CONSTRUCTORS_WITH_SKIPPED_ARGUMENT_VALIDATION = [
    ExecuteExpressionCommand,
];

export default class CommandBaseTransform extends BaseTransform {
    public constructor () {
        super('CommandBase');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof CommandBase;
    }

    private _skipArgumentValidation (CommandCtor: CommandConstructor, value: SerializedCommand): boolean {
        return isObservationCommand(value) &&
            !isAssertionCommand(value) &&
            !OBSERVABLE_COMMAND_CONSTRUCTORS_WITH_SKIPPED_ARGUMENT_VALIDATION.includes(CommandCtor);
    }

    private _createCommandInstance (CommandCtor: CommandConstructor, value: SerializedCommand): any {
        // NOTE: We should not validate the command creation here
        // since it was already done before action execution
        const testRunStub        = {};
        const validateProperties = false;

        if (this._skipArgumentValidation(CommandCtor, value))
            return new (CommandCtor as ObservationConstructor)(value, testRunStub as TestRun);

        else if (CommandCtor === SetNativeDialogHandlerCommand)
            return SetNativeDialogHandlerCommand.from(value);

        return new CommandCtor(value, testRunStub as TestRun, validateProperties);
    }

    public fromSerializable (value: SerializedCommand): any {
        const CommandCtor = value.assertionType
            ? ASSERTION_COMMAND_CONSTRUCTORS.get(value.assertionType)
            : COMMAND_CONSTRUCTORS.get(value.type);

        if (!CommandCtor)
            throw new Error(`An appropriate command constructor for "${value.type}" type was not found.`);

        return this._createCommandInstance(CommandCtor, value);
    }
}
