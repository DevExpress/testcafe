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
    RecorderCommand,
    GetCookiesCommand,
    SetCookiesCommand,
    DeleteCookiesCommand,
    ScrollCommand,
    RequestCommand,
    GetProxyUrlCommand,
} from './actions';

import { AssertionCommand } from './assertion';

import {
    TakeScreenshotCommand,
    TakeElementScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand,
} from './browser-manipulation';

import { WaitCommand, DebugCommand } from './observation';
import { isNil as isNullOrUndefined } from 'lodash';

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

        case TYPE.getCookies:
            return GetCookiesCommand;

        case TYPE.setCookies:
            return SetCookiesCommand;

        case TYPE.deleteCookies:
            return DeleteCookiesCommand;

        case TYPE.scroll:
            return ScrollCommand;

        case TYPE.request:
            return RequestCommand;

        case TYPE.getProxyUrl:
            return GetProxyUrlCommand;

        default:
            return null;
    }
}

const STUDIO_PROPERTY_NAMES = {
    studio:   'studio',
    selector: 'selector',
    note:     'note',
    callsite: 'callsite',
};

function removeStudioRelatedProperties (commandObj) {
    delete commandObj[STUDIO_PROPERTY_NAMES.studio];
    delete commandObj[STUDIO_PROPERTY_NAMES.note];
    delete commandObj[STUDIO_PROPERTY_NAMES.callsite];

    const selectorValue = commandObj[STUDIO_PROPERTY_NAMES.selector];

    if (!isNullOrUndefined(selectorValue))
        return;

    delete commandObj['selector'];
}

// Create command from object
export default function createCommandFromObject (obj, testRun) {
    const CmdCtor = getCmdCtor(obj.type);

    // NOTE: TestCafe Studio adds additional fields to the command object in RAW tests.
    // They do not affect the execution of the command. Therefore, we should remove them before validation.
    // We should change this mechanism in TestCafe Studio in the future to not add these properties to RAW tests.
    removeStudioRelatedProperties(obj);

    return CmdCtor && new CmdCtor(obj, testRun);
}
