import BaseTransform from '../base-transform';
import CommandBase from '../../../../../test-run/commands/base';
import { SerializedCommand } from '../../interfaces';
import { isObservationCommand } from '../../../../../test-run/commands/utils';
import AssertionCommand from '../../../../../test-run/commands/assertion';
import TestRun from '../../../../../test-run';
import { SetNativeDialogHandlerCommand } from '../../../../../test-run/commands/actions';
import COMMAND_CONSTRUCTORS from './command-constructors';
import { CommandConstructor, ObservationConstructor } from './types';

export default class CommandBaseTransform extends BaseTransform {
    public constructor () {
        super('ExecuteClientFunctionCommandBase');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof CommandBase;
    }

    private _createCommandInstance (CommandCtor: CommandConstructor, value: SerializedCommand): any {
        // NOTE: We should not validate the command creation here
        // since it was already done before action execution
        const testRunStub        = {};
        const validateProperties = false;

        if (isObservationCommand(value) && CommandCtor !== AssertionCommand)
            return new (CommandCtor as ObservationConstructor)(value, testRunStub as TestRun);

        else if (CommandCtor === SetNativeDialogHandlerCommand)
            return SetNativeDialogHandlerCommand.from(value);

        return new CommandCtor(value, testRunStub as TestRun, validateProperties);
    }

    public fromSerializable (value: SerializedCommand): any {
        const CommandCtor = COMMAND_CONSTRUCTORS.get(value.type);

        if (!CommandCtor)
            throw new Error(`An appropriate command constructor for "${value.type}" type was not found.`);

        return this._createCommandInstance(CommandCtor, value);
    }
}
