import { preventRealEvents } from '../deps/testcafe-core';
import ClickAutomation from './playback/click';
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

export var AUTOMATIONS = 'runner|automations';

var initialized = false;

export function init () {
    if (initialized)
        return;

    preventRealEvents();

    initialized = true;
}

//Running
window[AUTOMATIONS] = {
    ClickAutomation:                 ClickAutomation,
    RClickAutomation:                RClickAutomation,
    DblClickAutomation:              DblClickAutomation,
    HoverAutomation:                 HoverAutomation,
    DragToOffsetAutomation:          DragToOffsetAutomation,
    DragToElementAutomation:         DragToElementAutomation,
    SelectTextAutomation:            SelectTextAutomation,
    SelectEditableContentAutomation: SelectEditableContentAutomation,
    PressAutomation:                 PressAutomation,
    TypeAutomation:                  TypeAutomation,
    UploadAutomation:                UploadAutomation
};
