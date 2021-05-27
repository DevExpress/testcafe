import CommandType from '../../../../test-run/commands/type';
import BaseTransform from './base-transform';
import { SerializedCommand } from '../interfaces';
import CommandBase from '../../../../test-run/commands/base';

import {
    ExecuteSelectorCommand,
    ExecuteClientFunctionCommand,
    WaitCommand
} from '../../../../test-run/commands/observation';

import {
    ClickCommand,
    DragToElementCommand,
    HoverCommand,
    NavigateToCommand,
    PressKeyCommand,
    SelectEditableContentCommand,
    SetNativeDialogHandlerCommand,
    SetPageLoadTimeoutCommand,
    SetTestSpeedCommand,
    SwitchToIframeCommand,
    TypeTextCommand
} from '../../../../test-run/commands/actions';

import TestRun from '../../../../test-run';
import { isObservationCommand } from '../../../../test-run/commands/utils';

type ObservationConstructor = (new (init: object, testRun: TestRun) => any);
type ActionConstructor = (new (init: object, testRun: TestRun, validateProperties: boolean) => any);
type CommandConstructor = ObservationConstructor | ActionConstructor;

const COMMAND_CONSTRUCTORS = new Map<string, CommandConstructor>([
    [CommandType.executeSelector, ExecuteSelectorCommand],
    [CommandType.executeClientFunction, ExecuteClientFunctionCommand],
    [CommandType.wait, WaitCommand],
    [CommandType.click, ClickCommand],
    [CommandType.navigateTo, NavigateToCommand],
    [CommandType.typeText, TypeTextCommand],
    [CommandType.setNativeDialogHandler, SetNativeDialogHandlerCommand],
    [CommandType.switchToIframe, SwitchToIframeCommand],
    [CommandType.setTestSpeed, SetTestSpeedCommand],
    [CommandType.setPageLoadTimeout, SetPageLoadTimeoutCommand],
    [CommandType.pressKey, PressKeyCommand],
    [CommandType.dragToElement, DragToElementCommand],
    [CommandType.selectEditableContent, SelectEditableContentCommand],
    [CommandType.hover, HoverCommand]
]);

export default class CommandBaseTransform extends BaseTransform {
    public constructor () {
        super('ExecuteClientFunctionCommandBase');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof CommandBase;
    }

    private _createCommandInstance (CommandConstructor: CommandConstructor, value: SerializedCommand): any {
        // NOTE: We should not validate the command creation here
        // since it was already done before action execution
        const testRunStub        = {};
        const validateProperties = false;

        if (isObservationCommand(value))
            return new (CommandConstructor as ObservationConstructor)(value, testRunStub as TestRun);

        else if (CommandConstructor === SetNativeDialogHandlerCommand)
            return SetNativeDialogHandlerCommand.from(value);

        return new CommandConstructor(value, testRunStub as TestRun, validateProperties);
    }

    public fromSerializable (value: SerializedCommand): any {
        const CommandConstructor = COMMAND_CONSTRUCTORS.get(value.type);

        if (!CommandConstructor)
            throw new Error(`An appropriate command constructor for "${value.type}" type was not found.`);

        return this._createCommandInstance(CommandConstructor, value);
    }
}
