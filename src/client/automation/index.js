import hammerhead from './deps/hammerhead';
import ScrollAutomation from './playback/scroll';
import ClickAutomation from './playback/click';
import SelectChildClickAutomation from './playback/click/select-child';
import DblClickAutomation from './playback/dblclick';
import DragToOffsetAutomation from './playback/drag/to-offset';
import DragToElementAutomation from './playback/drag/to-element';
import HoverAutomation from './playback/hover';
import PressAutomation from './playback/press';
import RClickAutomation from './playback/rclick';
import SelectTextAutomation from './playback/select/select-text';
import SelectEditableContentAutomation from './playback/select/select-editable-content';
import TypeAutomation from './playback/type';
import UploadAutomation from './playback/upload';
import {
    MouseOptions,
    ClickOptions,
    TypeOptions
} from '../../test-run/commands/options';
import AutomationSettings from './settings';
import { getOffsetOptions } from './utils/offsets';
import calculateSelectTextArguments from './playback/select/calculate-select-text-arguments';
import ERROR_TYPES from './errors';
import cursor from './cursor';


exports.Scroll                = ScrollAutomation;
exports.Click                 = ClickAutomation;
exports.SelectChildClick      = SelectChildClickAutomation;
exports.DblClick              = DblClickAutomation;
exports.DragToOffset          = DragToOffsetAutomation;
exports.DragToElement         = DragToElementAutomation;
exports.Hover                 = HoverAutomation;
exports.Press                 = PressAutomation;
exports.RClick                = RClickAutomation;
exports.SelectText            = SelectTextAutomation;
exports.SelectEditableContent = SelectEditableContentAutomation;
exports.Type                  = TypeAutomation;
exports.Upload                = UploadAutomation;
exports.MouseOptions          = MouseOptions;
exports.ClickOptions          = ClickOptions;
exports.TypeOptions           = TypeOptions;

exports.ERROR_TYPES                  = ERROR_TYPES;
exports.AutomationSettings           = AutomationSettings;
exports.getOffsetOptions             = getOffsetOptions;
exports.calculateSelectTextArguments = calculateSelectTextArguments;
exports.cursor                       = cursor;

exports.get = require;

hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeAutomation%', {
    configurable: true,
    value:        exports
});

/* eslint-disable no-undef */
hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeAutomation(e.iframe.contentWindow, true));
/* eslint-enable no-undef */
