'use strict';

exports.__esModule = true;
exports.default = createCommandFromObject;

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _actions = require('./actions');

var _assertion = require('./assertion');

var _assertion2 = _interopRequireDefault(_assertion);

var _browserManipulation = require('./browser-manipulation');

var _observation = require('./observation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create command from object
function createCommandFromObject(obj) {
    switch (obj.type) {
        case _type2.default.click:
            return new _actions.ClickCommand(obj);

        case _type2.default.rightClick:
            return new _actions.RightClickCommand(obj);

        case _type2.default.doubleClick:
            return new _actions.DoubleClickCommand(obj);

        case _type2.default.hover:
            return new _actions.HoverCommand(obj);

        case _type2.default.drag:
            return new _actions.DragCommand(obj);

        case _type2.default.dragToElement:
            return new _actions.DragToElementCommand(obj);

        case _type2.default.typeText:
            return new _actions.TypeTextCommand(obj);

        case _type2.default.selectText:
            return new _actions.SelectTextCommand(obj);

        case _type2.default.selectTextAreaContent:
            return new _actions.SelectTextAreaContentCommand(obj);

        case _type2.default.selectEditableContent:
            return new _actions.SelectEditableContentCommand(obj);

        case _type2.default.pressKey:
            return new _actions.PressKeyCommand(obj);

        case _type2.default.wait:
            return new _observation.WaitCommand(obj);

        case _type2.default.navigateTo:
            return new _actions.NavigateToCommand(obj);

        case _type2.default.setFilesToUpload:
            return new _actions.SetFilesToUploadCommand(obj);

        case _type2.default.clearUpload:
            return new _actions.ClearUploadCommand(obj);

        case _type2.default.takeScreenshot:
            return new _browserManipulation.TakeScreenshotCommand(obj);

        case _type2.default.takeElementScreenshot:
            return new _browserManipulation.TakeElementScreenshotCommand(obj);

        case _type2.default.resizeWindow:
            return new _browserManipulation.ResizeWindowCommand(obj);

        case _type2.default.resizeWindowToFitDevice:
            return new _browserManipulation.ResizeWindowToFitDeviceCommand(obj);

        case _type2.default.maximizeWindow:
            return new _browserManipulation.MaximizeWindowCommand(obj);

        case _type2.default.switchToIframe:
            return new _actions.SwitchToIframeCommand(obj);

        case _type2.default.switchToMainWindow:
            return new _actions.SwitchToMainWindowCommand();

        case _type2.default.setNativeDialogHandler:
            return new _actions.SetNativeDialogHandlerCommand(obj);

        case _type2.default.setTestSpeed:
            return new _actions.SetTestSpeedCommand(obj);

        case _type2.default.setPageLoadTimeout:
            return new _actions.SetPageLoadTimeoutCommand(obj);

        case _type2.default.assertion:
            return new _assertion2.default(obj);

        case _type2.default.debug:
            return new _observation.DebugCommand(obj);
    }

    return null;
}
module.exports = exports['default'];