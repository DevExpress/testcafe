import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import { fromPoint as getElementFromPoint } from '../get-element';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import MoveAutomation from '../playback/move';
import MoveOptions from '../options/move';
import async from '../../deps/async';
import cursor from '../cursor';

const DRAGGING_SPEED = 4; // pixels/ms
const MIN_MOVING_TIME = 25;

var browserUtils     = hammerhead.utils.browser;
var extend           = hammerhead.utils.extend;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var SETTINGS        = testCafeCore.SETTINGS;
var contentEditable = testCafeCore.contentEditable;
var positionUtils   = testCafeCore.positionUtils;
var domUtils        = testCafeCore.domUtils;
var styleUtils      = testCafeCore.styleUtils;


export default function (el, to, options, runCallback) {
    var dragElement = positionUtils.isContainOffset(el, options.offsetX, options.offsetY);

    var target            = dragElement ? el : automationUtil.getMouseActionPoint(el, options, false),
        targetElement     = dragElement ? el : document.documentElement,
        screenPointFrom   = null,
        eventPointFrom    = null,
        eventOptionsStart = null,
        topElement        = null,
        skipDragEmulation = SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(el),
        currentDocument   = domUtils.findDocument(el),
        pointTo           = null,
        startPosition     = null,
        screenPointTo     = null,
        eventPointTo      = null,
        eventOptionsEnd   = null,

        offsets           = dragElement ? automationUtil.getDefaultAutomationOffsets(el) : {
            offsetX: target.x,
            offsetY: target.y
        },

        modifiers         = {
            ctrl:  options.ctrl,
            shift: options.shift,
            alt:   options.alt,
            meta:  options.meta
        };

    if (dragElement) {
        if (typeof options.offsetX === 'number')
            offsets.offsetX = Math.round(options.offsetX);
        if (typeof options.offsetY === 'number')
            offsets.offsetY = Math.round(options.offsetY);
    }

    if (skipDragEmulation) {
        runCallback(el);
        return;
    }

    async.series({
        moveCursorToElement: function (callback) {
            var moveOptions = new MoveOptions();

            moveOptions.offsetX   = offsets.offsetX;
            moveOptions.offsetY   = offsets.offsetY;
            moveOptions.modifiers = modifiers;

            var moveAutomation = new MoveAutomation(targetElement, moveOptions);

            moveAutomation
                .run()
                .then(()=> {
                    startPosition   = automationUtil.getMouseActionPoint(el, options, false);
                    screenPointFrom = positionUtils.offsetToClientCoords(startPosition);
                    eventPointFrom  = automationUtil.getEventOptionCoordinates(el, screenPointFrom);

                    eventOptionsStart = extend({
                        clientX: eventPointFrom.x,
                        clientY: eventPointFrom.y
                    }, options);

                    if (domUtils.isDomElement(to))
                        pointTo = positionUtils.findCenter(to);
                    else
                        pointTo = automationUtil.getDragEndPoint(startPosition, to, currentDocument);

                    topElement = getElementFromPoint(screenPointFrom.x, screenPointFrom.y);

                    if (!topElement) {
                        runCallback(el);
                        return;
                    }

                    window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
                });
        },
        cursorMouseDown:     function (callback) {
            cursor
                .leftButtonDown()
                .then(() => callback());
        },

        take: function (callback) {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchstart(topElement, eventOptionsStart);
            else
                eventSimulator.mousedown(topElement, eventOptionsStart);

            //NOTE: For contentEditable elements we should call focus directly for action's element
            focusBlurSandbox.focus(domUtils.isContentEditableElement(el) ? contentEditable.findContentEditableParent(el) : topElement, function () {
                window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
            }, false, true);
        },

        drag: function (callback) {
            var isDomElement = domUtils.isDomElement(to);
            var targetTo     = isDomElement ? to : document.documentElement;

            var offsetsTo = isDomElement ? automationUtil.getDefaultAutomationOffsets(to) : {
                offsetX: pointTo.x,
                offsetY: pointTo.y
            };

            var moveOptions = new MoveOptions();

            moveOptions.offsetX       = offsetsTo.offsetX;
            moveOptions.offsetY       = offsetsTo.offsetY;
            moveOptions.modifiers     = modifiers;
            moveOptions.speed         = DRAGGING_SPEED;
            moveOptions.minMovingTime = MIN_MOVING_TIME;
            moveOptions.dragMode      = true;

            var moveAutomation = new MoveAutomation(targetTo, moveOptions);

            moveAutomation
                .run()
                .then(() => window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY));
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
                var currentIFrame = domUtils.getIframeByElement(el);
                if (currentIFrame) {
                    var screenPointToInIFrame = {
                        x: screenPointTo.x - styleUtils.getScrollLeft(currentIFrame.contentWindow),
                        y: screenPointTo.y - styleUtils.getScrollTop(currentIFrame.contentWindow)
                    };

                    topElement = getElementFromPoint(screenPointToInIFrame.x, screenPointToInIFrame.y);
                }
            }
            else
                topElement = getElementFromPoint(screenPointTo.x, screenPointTo.y);

            if (!topElement) {
                runCallback();
                return;
            }

            eventOptionsEnd = extend({
                clientX: eventPointTo.x,
                clientY: eventPointTo.y
            }, options);

            cursor
                .buttonUp()
                .then(() => callback());
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
            if (getElementFromPoint(screenPointTo.x, screenPointTo.y) === topElement)
                eventSimulator.click(topElement, eventOptionsEnd);

            runCallback();
        }
    });
};
