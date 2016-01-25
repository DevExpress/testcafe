import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import { fromPoint as getElementFromPoint } from '../get-element';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import * as automationSelectUtil from './select-util';
import MoveAutomation from '../playback/move';
import ScrollAutomation from '../playback/scroll';
import OffsetOptions from '../options/offset';
import MoveOptions from '../options/move';
import async from '../../deps/async';
import cursor from '../cursor';

var browserUtils     = hammerhead.utils.browser;
var extend           = hammerhead.utils.extend;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var SETTINGS        = testCafeCore.SETTINGS;
var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var eventUtils      = testCafeCore.eventUtils;


export default function (el, options, runCallback) {
    var isTextarea        = el.tagName.toLowerCase() === 'textarea',
        isTextEditable    = domUtils.isTextEditableElement(el),
        isContentEditable = domUtils.isContentEditableElement(el),
        topElement        = null,
        currentTopElement = null,

        startPosition     = null,
        endPosition       = null,

        pointFrom         = null,
        pointTo           = null,
        screenPointTo     = null,

        screenPointFrom   = null,
        eventPointTo      = null,
        eventPointFrom    = null,
        eventOptionsStart = null,
        eventOptionsEnd   = null,
        notPrevented      = true,
        point             = null,

        //NOTE: options to get right selection position to mouse movement
        correctOptions    = null,

        modifiers         = {
            ctrl:  options.ctrl,
            shift: options.shift,
            alt:   options.alt,
            meta:  options.meta
        };

    //determination of selection positions by arguments
    var processedOptions = automationSelectUtil.getProcessedOptions(el, options);

    startPosition = processedOptions.startPosition;
    endPosition   = processedOptions.endPosition;

    if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(el)) {
        topElement = el;

        window.setTimeout(runCallback, automationSettings.ACTION_STEP_DELAY);
        return;
    }

    async.series({
        scrollToElement: function (callback) {
            var elementRectangle = positionUtils.getElementRectangle(el);
            var scrollOptions    = new OffsetOptions();

            scrollOptions.offsetX = Math.round(elementRectangle.width / 2);
            scrollOptions.offsetY = Math.round(elementRectangle.height / 2);

            var scrollAutomation = new ScrollAutomation(el, scrollOptions);

            scrollAutomation
                .run()
                .then(() => {
                    automationSelectUtil.getCorrectOptions(el, function (opt) {
                        correctOptions = opt;
                        callback();
                    });
                });
        },

        moveToStart: function (callback) {
            if ((isTextEditable && el.value.length > 0) ||
                (isContentEditable && contentEditable.getContentEditableValue(el).length)) {
                pointFrom = automationSelectUtil.getSelectPositionCoordinates(el, startPosition, endPosition, true, correctOptions);
                pointTo   = automationSelectUtil.getSelectPositionCoordinates(el, startPosition, endPosition, false, correctOptions);
            }
            else {
                pointFrom = positionUtils.findCenter(el);
                pointTo   = pointFrom;
            }

            automationSelectUtil.scrollElementByPoint(el, pointFrom);

            point = automationSelectUtil.updatePointByScrollElement(el, pointFrom);

            var moveOptions = new MoveOptions();

            moveOptions.offsetX   = point.x;
            moveOptions.offsetY   = point.y;
            moveOptions.modifiers = modifiers;

            var moveAutomation = new MoveAutomation(document.documentElement, moveOptions);

            moveAutomation
                .run()
                .then(() => {
                    screenPointFrom = positionUtils.offsetToClientCoords(point);
                    eventPointFrom  = automationUtil.getEventOptionCoordinates(el, screenPointFrom);

                    eventOptionsStart = extend({
                        clientX: eventPointFrom.x,
                        clientY: eventPointFrom.y
                    }, options);

                    topElement = getElementFromPoint(screenPointFrom.x, screenPointFrom.y);

                    if (!topElement) {
                        runCallback();
                        return;
                    }

                    isTextEditable = domUtils.isTextEditableElement(topElement);
                    isTextarea     = topElement.tagName.toLowerCase() === 'textarea';

                    window.setTimeout(callback, automationSettings.DRAG_ACTION_STEP_DELAY);
                });
        },

        cursorMousseDown: function (callback) {
            cursor
                .leftButtonDown()
                .then(() => callback());
        },

        mousedown: function (callback) {
            //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
            // therefore we should handle it and hide the dropdown (B236416)
            var needHandleMousedown = (browserUtils.isWebKit || browserUtils.isIE) && domUtils.isSelectElement(el),
                wasPrevented        = null;

            if (needHandleMousedown) {
                var onmousedown = function (e) {
                    wasPrevented = e.defaultPrevented;
                    eventUtils.preventDefault(e);
                    eventUtils.unbind(el, 'mousedown', onmousedown);
                };

                eventUtils.bind(el, 'mousedown', onmousedown);
            }

            if (browserUtils.hasTouchEvents)
                notPrevented = eventSimulator.touchstart(topElement, eventOptionsStart);
            else
                notPrevented = eventSimulator.mousedown(topElement, eventOptionsStart);

            currentTopElement = getElementFromPoint(screenPointFrom.x, screenPointFrom.y);

            if (currentTopElement)
                topElement = currentTopElement;

            if (notPrevented === false) {
                if (needHandleMousedown && !wasPrevented)
                    notPrevented = true;
                else {
                    callback();
                    return;
                }
            }

            //NOTE: For contentEditable elements we should call focus directly for action's element because
            //option 'caretPos' is indicated for this element and topElement may be a child of this element
            if (isContentEditable)
                topElement = el;

            focusBlurSandbox.focus(isContentEditable ? contentEditable.findContentEditableParent(topElement) : topElement, function () {
                pointTo = automationSelectUtil.getSelectPositionCoordinates(topElement, startPosition, endPosition, false, correctOptions);

                if (isContentEditable && !pointTo) {
                    pointTo = automationSelectUtil.getSelectionLastVisiblePosition(el, startPosition, endPosition, correctOptions) ||
                              positionUtils.findCenter(el);
                }

                automationSelectUtil.scrollElementByPoint(topElement, pointTo);
                pointTo = automationSelectUtil.updatePointByScrollElement(topElement, pointTo);

                var moveOptions = new MoveOptions();

                moveOptions.offsetX   = pointTo.x;
                moveOptions.offsetY   = pointTo.y;
                moveOptions.modifiers = modifiers;


                var moveAutomation = new MoveAutomation(document.documentElement, moveOptions);

                moveAutomation
                    .run()
                    .then(callback);
            }, false, true);
        },

        getCorrectOptions: function (callback) {
            if ((isTextEditable && topElement.value.length > 0) ||
                (isContentEditable && contentEditable.getContentEditableValue(topElement).length)) {
                if (pointTo) {
                    point = pointTo;
                    callback();
                    return;
                }

                automationSelectUtil.getCorrectOptions(topElement, function (opt) {
                    point = automationSelectUtil.getSelectPositionCoordinates(topElement, startPosition, endPosition, false, opt);
                    callback();
                });
            }
            else
                callback();
        },

        setFinalSelection: function (callback) {
            if (!point)
                point = positionUtils.findCenter(topElement);

            automationSelectUtil.scrollElementByPoint(topElement, point);
            point = automationSelectUtil.updatePointByScrollElement(topElement, point);

            screenPointTo = positionUtils.offsetToClientCoords(point);
            eventPointTo  = automationUtil.getEventOptionCoordinates(topElement, screenPointTo);

            eventOptionsEnd = extend({
                clientX: eventPointTo.x,
                clientY: eventPointTo.y
            }, options);

            if ((isTextEditable || isContentEditable) && notPrevented !== false) {
                //NOTE: The same cursor position may correspond to different nodes
                //only if we know which nodes should be selected in result we should select it directly
                if (isContentEditable && options.startNode && options.endNode)
                    automationSelectUtil.selectContentEditableByOptions(el, startPosition, endPosition, options);
                else
                    textSelection.select(topElement, startPosition, endPosition);
            }
            callback();
        },

        cursorMouseUp: function (callback) {
            cursor
                .buttonUp()
                .then(() => callback());
        },

        mouseup: function () {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchend(topElement, eventOptionsEnd);
            else
                eventSimulator.mouseup(topElement, eventOptionsEnd);
            runCallback();
        }
    });
};
