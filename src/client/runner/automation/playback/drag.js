import * as hammerheadAPI from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import movePlaybackAutomation from '../playback/move';
import async from '../../deps/async';

var browserUtils   = hammerheadAPI.Util.Browser;
var eventSimulator = hammerheadAPI.EventSandbox.EventSimulator;
var focusBlur      = hammerheadAPI.EventSandbox.FocusBlur;

var $               = testCafeCore.$;
var SETTINGS        = testCafeCore.SETTINGS;
var contentEditable = testCafeCore.contentEditable;
var positionUtils   = testCafeCore.positionUtils;
var domUtils        = testCafeCore.domUtils;

var cursor = testCafeUI.cursor;


export default function (el, to, options, runCallback) {
    var target            = positionUtils.isContainOffset(el, options.offsetX, options.offsetY) ?
                            el : automationUtil.getMouseActionPoint(el, options, false),

        screenPointFrom   = null,
        eventPointFrom    = null,
        eventOptionsStart = null,
        topElement        = null,
        skipDragEmulation = SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(el),
        oldOffset         = null,
        currentDocument   = domUtils.findDocument(el),
        pointTo           = null,
        startPosition     = null,
        screenPointTo     = null,
        eventPointTo      = null,
        eventOptionsEnd   = null;

    if (options.offsetX)
        options.offsetX = Math.round(options.offsetX);
    if (options.offsetY)
        options.offsetY = Math.round(options.offsetY);

    if (skipDragEmulation) {
        runCallback(el);
        return;
    }

    async.series({
        moveCursorToElement: function (callback) {
            movePlaybackAutomation(target, false, options, function () {
                startPosition   = automationUtil.getMouseActionPoint(el, options, false);
                screenPointFrom = positionUtils.offsetToClientCoords(startPosition);
                eventPointFrom  = automationUtil.getEventOptionCoordinates(el, screenPointFrom);

                eventOptionsStart = $.extend({
                    clientX: eventPointFrom.x,
                    clientY: eventPointFrom.y
                }, options);

                if (domUtils.isDomElement(to))
                    pointTo = positionUtils.findCenter(to);
                else
                    pointTo = automationUtil.getDragEndPoint(startPosition, to, currentDocument);

                topElement = cursor.getElementUnderCursor(screenPointFrom.x, screenPointFrom.y);

                if (!topElement) {
                    runCallback(el);
                    return;
                }

                window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
            });
        },

        cursorMouseDown: function (callback) {
            cursor.lMouseDown(callback);
        },

        take: function (callback) {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchstart(topElement, eventOptionsStart);
            else
                eventSimulator.mousedown(topElement, eventOptionsStart);

            //NOTE: For contentEditable elements we should call focus directly for action's element
            focusBlur.focus(domUtils.isContentEditableElement(el) ? contentEditable.findContentEditableParent(el) : topElement, function () {
                window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
            }, false, true);
        },

        drag: function (callback) {
            oldOffset = {
                x: options.offsetX,
                y: options.offsetY
            };

            delete options.offsetX;
            delete options.offsetY;

            movePlaybackAutomation(domUtils.isDomElement(to) ? to : pointTo, true, options, function () {
                options.offsetX = oldOffset.x;
                options.offsetY = oldOffset.y;

                window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
            }, currentDocument);
        },


        cursorMouseUp: function (callback) {
            if (pointTo)
                screenPointTo = positionUtils.offsetToClientCoords(pointTo);
            else {
                var offsetPos = positionUtils.getOffsetPosition(el);

                screenPointTo = positionUtils.offsetToClientCoords({
                    x: offsetPos.left,
                    y: offsetPos.top
                });
            }

            eventPointTo = automationUtil.getEventOptionCoordinates(el, screenPointTo);

            if (domUtils.isElementInIframe(el)) {
                var currentIFrame = domUtils.getIFrameByElement(el);
                if (currentIFrame) {
                    var screenPointToInIFrame = {
                        x: screenPointTo.x - $(currentIFrame.contentWindow).scrollLeft(),
                        y: screenPointTo.y - $(currentIFrame.contentWindow).scrollTop()
                    };

                    topElement = cursor.getElementUnderCursor(screenPointToInIFrame.x, screenPointToInIFrame.y);
                }
            }
            else
                topElement = cursor.getElementUnderCursor(screenPointTo.x, screenPointTo.y);

            if (!topElement) {
                runCallback();
                return;
            }

            eventOptionsEnd = $.extend({
                clientX: eventPointTo.x,
                clientY: eventPointTo.y
            }, options);

            cursor.mouseUp(callback);
        },

        mouseUp: function (callback) {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchend(topElement, eventOptionsEnd);
            else
                eventSimulator.mouseup(topElement, eventOptionsEnd);

            callback();
        },

        click: function () {
            //B231323
            if (cursor.getElementUnderCursor(screenPointTo.x, screenPointTo.y) === topElement)
                eventSimulator.click(topElement, eventOptionsEnd);

            runCallback();
        }
    });
};
