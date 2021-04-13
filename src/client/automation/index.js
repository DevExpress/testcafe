import hammerhead from './deps/hammerhead';
import DispatchEventAutomation from './playback/dispatch-event';
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
import { getNextFocusableElement } from './playback/press/utils';
import SHORTCUT_TYPE from './playback/press/shortcut-type';
import { getSelectionCoordinatesByPosition } from './playback/select/utils';
import { fromPoint as getElementFromPoint } from './get-element';
import calculateSelectTextArguments from './playback/select/calculate-select-text-arguments';
import ERROR_TYPES from './errors';
import cursor from './cursor';


const exports = {};

exports.DispatchEvent         = DispatchEventAutomation;
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
exports.getNextFocusableElement      = getNextFocusableElement;
exports.SHORTCUT_TYPE                = SHORTCUT_TYPE;

exports.getSelectionCoordinatesByPosition = getSelectionCoordinatesByPosition;

exports.getElementFromPoint = getElementFromPoint;

const nativeMethods    = hammerhead.nativeMethods;
const evalIframeScript = hammerhead.EVENTS.evalIframeScript;

nativeMethods.objectDefineProperty(window, '%testCafeAutomation%', { configurable: true, value: exports });

// eslint-disable-next-line no-undef
hammerhead.on(evalIframeScript, e => initTestCafeAutomation(nativeMethods.contentWindowGetter.call(e.iframe), true));
