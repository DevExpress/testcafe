import TYPE from './type';

import {
    ClickCommand,
    RightClickCommand,
    DoubleClickCommand,
    HoverCommand,
    DragCommand,
    DragToElementCommand,
    TypeTextCommand,
    SelectTextCommand,
    SelectTextAreaContentCommand,
    SelectEditableContentCommand,
    PressKeyCommand,
    NavigateToCommand,
    SetFilesToUploadCommand,
    ClearUploadCommand,
    SwitchToIframeCommand,
    SwitchToMainWindowCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand,
    ExecuteExpressionCommand,
    ExecuteAsyncExpressionCommand,
    RecorderCommand
} from './actions';

import AssertionCommand from './assertion';

import {
    TakeScreenshotCommand,
    TakeElementScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand
} from './browser-manipulation';

import { WaitCommand, DebugCommand } from './observation';

function getCmdCtor (type) {
    switch (type) {
        case TYPE.click:
            return ClickCommand;

        case TYPE.rightClick:
            return RightClickCommand;

        case TYPE.doubleClick:
            return DoubleClickCommand;

        case TYPE.hover:
            return HoverCommand;

        case TYPE.drag:
            return DragCommand;

        case TYPE.dragToElement:
            return DragToElementCommand;

        case TYPE.typeText:
            return TypeTextCommand;

        case TYPE.selectText:
            return SelectTextCommand;

        case TYPE.selectTextAreaContent:
            return SelectTextAreaContentCommand;

        case TYPE.selectEditableContent:
            return SelectEditableContentCommand;

        case TYPE.pressKey:
            return PressKeyCommand;

        case TYPE.wait:
            return WaitCommand;

        case TYPE.navigateTo:
            return NavigateToCommand;

        case TYPE.setFilesToUpload:
            return SetFilesToUploadCommand;

        case TYPE.clearUpload:
            return ClearUploadCommand;

        case TYPE.takeScreenshot:
            return TakeScreenshotCommand;

        case TYPE.takeElementScreenshot:
            return TakeElementScreenshotCommand;

        case TYPE.resizeWindow:
            return ResizeWindowCommand;

        case TYPE.resizeWindowToFitDevice:
            return ResizeWindowToFitDeviceCommand;

        case TYPE.maximizeWindow:
            return MaximizeWindowCommand;

        case TYPE.switchToIframe:
            return SwitchToIframeCommand;

        case TYPE.switchToMainWindow:
            return SwitchToMainWindowCommand;

        case TYPE.setNativeDialogHandler:
            return SetNativeDialogHandlerCommand;

        case TYPE.setTestSpeed:
            return SetTestSpeedCommand;

        case TYPE.setPageLoadTimeout:
            return SetPageLoadTimeoutCommand;

        case TYPE.assertion:
            return AssertionCommand;

        case TYPE.debug:
            return DebugCommand;

        case TYPE.executeExpression:
            return ExecuteExpressionCommand;

        case TYPE.executeAsyncExpression:
            return ExecuteAsyncExpressionCommand;

        case TYPE.recorder:
            return RecorderCommand;

        default:
            return null;
    }
}

// Create command from object
export default function createCommandFromObject (obj, testRun) {
    const CmdCtor = getCmdCtor(obj.type);

    return CmdCtor && new CmdCtor(obj, testRun);
}
