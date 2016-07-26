import {
    Click as ClickAutomation,
    DblClick as DblClickAutomation,
    DragToOffset as DragToOffsetAutomation,
    DragToElement as DragToElementAutomation,
    Hover as HoverAutomation,
    Press as PressAutomation,
    RClick as RClickAutomation,
    SelectText as SelectTextAutomation,
    SelectEditableContent as SelectEditableContentAutomation,
    Type as TypeAutomation,
    Upload as UploadAutomation
} from './deps/testcafe-automation';


const AUTOMATIONS_STORAGE_FLAG = 'runner|automations-storage-flag';

export function fill () {
    window[AUTOMATIONS_STORAGE_FLAG] = {
        Click:                 ClickAutomation,
        RClick:                RClickAutomation,
        DblClick:              DblClickAutomation,
        Hover:                 HoverAutomation,
        DragToOffset:          DragToOffsetAutomation,
        DragToElement:         DragToElementAutomation,
        SelectText:            SelectTextAutomation,
        SelectEditableContent: SelectEditableContentAutomation,
        Press:                 PressAutomation,
        Type:                  TypeAutomation,
        Upload:                UploadAutomation
    };
}


export function getAutomations (win) {
    return win[AUTOMATIONS_STORAGE_FLAG];
}
