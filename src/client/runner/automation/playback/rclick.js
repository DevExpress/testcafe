import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import movePlaybackAutomation from '../playback/move';
import async from '../../deps/async';

var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var SETTINGS      = testCafeCore.SETTINGS;
var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var eventUtils    = testCafeCore.eventUtils;

var cursor = testCafeUI.cursor;


export default function (el, options, actionCallback) {
    options = {
        ctrl:     options.ctrl,
        alt:      options.alt,
        shift:    options.shift,
        meta:     options.meta,
        offsetX:  options.offsetX,
        offsetY:  options.offsetY,
        caretPos: options.caretPos
    };

    var isSVGElement       = domUtils.isSVGElement(el),
        target             = positionUtils.isContainOffset(el, options.offsetX, options.offsetY) ?
                             el : automationUtil.getMouseActionPoint(el, options, false),

        notPrevented       = true,
        screenPoint        = null,
        eventPoint         = null,
        eventOptions       = null,
        topElement         = null,
        isInvisibleElement = false,
        currentTopElement  = null;

    if (options.offsetX)
        options.offsetX = Math.round(options.offsetX);
    if (options.offsetY)
        options.offsetY = Math.round(options.offsetY);

    async.series({
        moveCursorToElement: function (callback) {
            if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(el)) {
                topElement = el;

                window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
                return;
            }

            movePlaybackAutomation(target, false, options, function () {
                if ((isSVGElement && browserUtils.isOpera) || el.tagName.toLowerCase() === 'tref')
                    topElement = el; //NOTE: document.elementFromPoint can't find this element
                else {
                    screenPoint = automationUtil.getMouseActionPoint(el, options, true);
                    eventPoint  = automationUtil.getEventOptionCoordinates(el, screenPoint);

                    eventOptions = hammerhead.utils.extend({
                        clientX: eventPoint.x,
                        clientY: eventPoint.y,
                        button:  eventUtils.BUTTON.right,
                        which:   eventUtils.WHICH_PARAMETER.rightButton,
                        buttons: eventUtils.BUTTONS_PARAMETER.rightButton
                    }, options);

                    topElement = automationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                    if (!topElement) {
                        isInvisibleElement = true;
                        topElement         = el;
                    }
                }
                window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
            });
        },

        cursorMouseDown: function (callback) {
            cursor.rMouseDown(callback);
        },

        mousedown: function (callback) {
            var activeElement = domUtils.getActiveElement(),
                //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
                needFocus     = !(browserUtils.isIE && activeElement === topElement);

            notPrevented = eventSimulator.mousedown(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint) {
                currentTopElement = automationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                if (currentTopElement)
                    topElement = currentTopElement;
            }

            if (notPrevented === false) {
                callback();
                return;
            }

            //NOTE: For contentEditable elements we should call focus directly for action's element because
            //option 'caretPos' is indicated this element and topElement may be a child of this element
            automationUtil.focusAndSetSelection(domUtils.isContentEditableElement(el) ? el : topElement, options, needFocus, callback);
        },

        cursorMouseUp: function (callback) {
            cursor.mouseUp(callback);
        },

        mouseup: function (callback) {
            eventSimulator.mouseup(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint) {
                currentTopElement = cursor.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                if (currentTopElement)
                    topElement = currentTopElement;
            }
            window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
        },

        contextmenu: function () {
            eventSimulator.contextmenu(topElement, eventOptions);
            automationUtil.focusLabelChildElement(topElement);

            actionCallback();
        }
    });
};
