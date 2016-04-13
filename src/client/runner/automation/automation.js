import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
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


var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var listeners      = hammerhead.eventSandbox.listeners;

var SETTINGS   = testCafeCore.SETTINGS;
var eventUtils = testCafeCore.eventUtils;
var domUtils   = testCafeCore.domUtils;
var styleUtils = testCafeCore.styleUtils;
var arrayUtils = testCafeCore.arrayUtils;


const REAL_ACTION_EVENTS_REGEXP = /blur|focus|(dbl)?click|contextmenu|key|mouse|pointer/i;


export var AUTOMATIONS = 'runner|automations';

//NOTE: when test is run we should block real events (from mouse, keyboard), because it may lead to
// unexpected test result.
var preventRealEvtHandler = function (e, dispatched, preventDefault) {
    var target = e.target || e.srcElement;

    if (REAL_ACTION_EVENTS_REGEXP.test(e.type) && !dispatched &&
        (!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) &&
        !(SETTINGS.get().PLAYBACK && domUtils.isShadowUIElement(target))) {
        //If an element loses focus because of becoming invisible, a blur event is raised. We must not prevent this blur event.
        //In the IE an element loses focus only if css display property is set to 'none', other ways of making
        // element invisible don't lead to blurring (in MSEdge focus/blur is sync)
        if (e.type === 'blur') {
            if (browserUtils.isIE && browserUtils.version < 12) {
                var isElementInvisible = !domUtils.isWindow(target) &&
                                         styleUtils.get(target, 'display') === 'none';
                var elementParents     = null;
                var invisibleParents   = false;

                if (!isElementInvisible) {
                    elementParents   = domUtils.getParents(target);
                    invisibleParents = arrayUtils.filter(elementParents, parent => styleUtils.get(parent, 'display') ===
                                                                                   'none');
                }

                if (isElementInvisible || invisibleParents.length) {
                    //B254768 - reason of setTimeout method using
                    window.setTimeout(() => {
                        eventSimulator.blur(target);
                    }, 0);
                }
            }
            //NOTE: fix for jQuery bug. An exception raises when call .is(':visible') for window or document on page loading (e.ownerDocument is null)
            else if (target !== window && target !== window.document && !styleUtils.hasDimensions(target))
                return;
        }

        preventDefault();
    }
};

var initialized = false;

export function init () {
    if (initialized)
        return;

    listeners.initElementListening(window, eventUtils.RECORDING_LISTENED_EVENTS);
    listeners.addFirstInternalHandler(window, eventUtils.RECORDING_LISTENED_EVENTS, preventRealEvtHandler);

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
    TypeAutomation:                  TypeAutomation
};
