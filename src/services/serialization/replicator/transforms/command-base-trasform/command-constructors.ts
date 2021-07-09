import CommandType from '../../../../../test-run/commands/type';

import {
    ExecuteClientFunctionCommand,
    ExecuteSelectorCommand,
    WaitCommand
} from '../../../../../test-run/commands/observation';

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
    TypeTextCommand,
    UseRoleCommand
} from '../../../../../test-run/commands/actions';

import AssertionCommand from '../../../../../test-run/commands/assertion';
import { CommandConstructor } from './types';


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
    [CommandType.hover, HoverCommand],
    [CommandType.assertion, AssertionCommand],
    [CommandType.useRole, UseRoleCommand]
]);

export default COMMAND_CONSTRUCTORS;
