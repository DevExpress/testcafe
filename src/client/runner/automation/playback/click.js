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

var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var SETTINGS      = testCafeCore.SETTINGS;
var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;
var arrayUtils    = testCafeCore.arrayUtils;

var selectElement = testCafeUI.selectElement;


function getSelectChildElementIndex (select, child) {
    var children = select.querySelectorAll(child.tagName);

    return arrayUtils.indexOf(children, child);
}

function clickOnSelectChildElement (childElement, clickOptions, actionCallback, errorCallback) {
    var isClickOnOption = childElement.tagName.toLowerCase() === 'option';
    var select          = domUtils.getSelectParent(childElement);

    if (!select) {
        eventSimulator.click(childElement, clickOptions);
        actionCallback();
        return;
    }

    var selectedIndex        = select.selectedIndex;
    var isOptionListExpanded = selectElement.isOptionListExpanded(select);
    var childIndex           = getSelectChildElementIndex(select, childElement);
    var targetElement        = isOptionListExpanded ? selectElement.getEmulatedChildElement(childIndex, !isClickOnOption) : childElement;

    async.series({
            moveCursorToElement: function (callback) {
                //NOTE: 'target' is option from emulated optionList or the point (x,y-coordinates) of real option element
                var target            = null;
                var offsets           = null;
                var selectChildCenter = null;

                if (isOptionListExpanded) {
                    target  = targetElement;
                    offsets = automationUtil.getDefaultAutomationOffsets(target);
                }
                else {
                    selectElement.scrollOptionListByChild(childElement);
                    target            = document.documentElement;
                    selectChildCenter = selectElement.getSelectChildCenter(childElement);
                    offsets           = {
                        offsetX: selectChildCenter.x,
                        offsetY: selectChildCenter.y
                    };
                }

                var moveOptions = new MoveOptions();

                moveOptions.offsetX = offsets.offsetX;
                moveOptions.offsetY = offsets.offsetY;

                var moveAutomation = new MoveAutomation(target, moveOptions);

                moveAutomation
                    .run()
                    .then(() => window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY));
            },

            click: function () {
                var clickCausesChange = isClickOnOption && !targetElement.disabled && childIndex !== selectedIndex;

                if (styleUtils.getSelectElementSize(select) > 1) {
                    if (browserUtils.isFirefox) {
                        eventSimulator.mousedown(targetElement, clickOptions);

                        if (clickCausesChange)
                            select.selectedIndex = childIndex;

                        focusBlurSandbox.focus(select, function () {
                            window.setTimeout(function () {
                                eventSimulator.mouseup(targetElement, clickOptions);

                                if (clickCausesChange)
                                    eventSimulator.change(select);

                                eventSimulator.click(targetElement, clickOptions);

                                actionCallback();
                            }, browserUtils.hasTouchEvents ? 0 : automationSettings.CLICK_STEP_DELAY);
                        }, false, true);
                    }
                    else if (browserUtils.isIE) {
                        eventSimulator.mousedown(select, clickOptions);

                        focusBlurSandbox.focus(select, function () {
                            window.setTimeout(function () {
                                eventSimulator.mouseup(select, clickOptions);

                                if (clickCausesChange)
                                    select.selectedIndex = childIndex;

                                if (clickCausesChange)
                                    eventSimulator.change(select);

                                eventSimulator.click(select, clickOptions);

                                actionCallback();
                            }, browserUtils.hasTouchEvents ? 0 : automationSettings.CLICK_STEP_DELAY);
                        }, false, true);
                    }
                    else {
                        //NOTE: after mousedown in Chrome document.activeElement = select.
                        //But we need to raise blur and change event for previous active element during focus raising.
                        //That's why we should change event order and raise focus before mousedown.
                        focusBlurSandbox.focus(select, function () {
                            window.setTimeout(function () {
                                eventSimulator.mousedown(targetElement, clickOptions);

                                if (clickCausesChange)
                                    select.selectedIndex = childIndex;

                                eventSimulator.mouseup(targetElement, clickOptions);

                                if (browserUtils.isSafari && clickCausesChange)
                                    eventSimulator.change(select);

                                eventSimulator.click(targetElement, clickOptions);

                                actionCallback();
                            }, browserUtils.hasTouchEvents ? 0 : automationSettings.CLICK_STEP_DELAY);
                        }, false, true);
                    }
                }
                else {
                    eventSimulator.click(targetElement, clickOptions);
                    actionCallback();

                }
            }
        }
    );
}

export default function (el, options, runCallback, errorCallback) {
    options = {
        ctrl:     options.ctrl,
        alt:      options.alt,
        shift:    options.shift,
        meta:     options.meta,
        offsetX:  options.offsetX,
        offsetY:  options.offsetY,
        caretPos: options.caretPos
    };

    if (el.tagName.toLowerCase() === 'option' || el.tagName.toLowerCase() === 'optgroup') {
        clickOnSelectChildElement(el, options, runCallback, errorCallback);

        return;
    }

    var isSVGElement        = domUtils.isSVGElement(el),
        screenPoint         = null,
        eventPoint          = null,
        eventOptions        = null,
        clickOnElement      = positionUtils.isContainOffset(el, options.offsetX, options.offsetY),
        target              = clickOnElement ? el : automationUtil.getMouseActionPoint(el, options, false),
        targetElement       = clickOnElement ? el : document.documentElement,
        notPrevented        = true,
        topElement          = null,
        isInvisibleElement  = false,
        currentTopElement   = null,
        skipClickSimulation = false,

        offsets             = clickOnElement ? automationUtil.getDefaultAutomationOffsets(el) : {
            offsetX: target.x,
            offsetY: target.y
        },

        modifiers           = {
            ctrl:  options.ctrl,
            shift: options.shift,
            alt:   options.alt,
            meta:  options.meta
        };

    if (clickOnElement) {
        if (typeof options.offsetX === 'number')
            offsets.offsetX = Math.round(options.offsetX);
        if (typeof options.offsetY === 'number')
            offsets.offsetY = Math.round(options.offsetY);
    }

    async.series({
        moveCursorToElement: function (callback) {
            if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(el)) {
                topElement = el;

                window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
                return;
            }

            var moveOptions = new MoveOptions();

            moveOptions.offsetX   = offsets.offsetX;
            moveOptions.offsetY   = offsets.offsetY;
            moveOptions.modifiers = modifiers;

            var moveAutomation = new MoveAutomation(targetElement, moveOptions);

            moveAutomation
                .run()
                .then(() => {
                    if ((isSVGElement && browserUtils.isOpera) || el.tagName.toLowerCase() === 'tref')
                        topElement = el; //NOTE: document.elementFromPoint can't find this element
                    else {
                        screenPoint = automationUtil.getMouseActionPoint(el, options, true);
                        eventPoint  = automationUtil.getEventOptionCoordinates(el, screenPoint);

                        eventOptions = hammerhead.utils.extend({
                            clientX: eventPoint.x,
                            clientY: eventPoint.y
                        }, options);

                        topElement = getElementFromPoint(screenPoint.x, screenPoint.y, target);

                        if (!topElement) {
                            isInvisibleElement = true;
                            topElement         = el;
                        }
                    }
                    window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
                });
        },

        //NOTE: touch devices only
        touchstart: function (callback) {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchstart(topElement, eventOptions);
            callback();
        },

        //NOTE: touch devices only
        cursorTouchMouseDown: function (callback) {
            if (browserUtils.hasTouchEvents) {
                cursor
                    .leftButtonDown()
                    .then(() => callback());
            }
            else
                callback();
        },

        //NOTE: touch devices only
        touchend: function (callback) {
            if (browserUtils.hasTouchEvents) {
                eventSimulator.touchend(topElement, eventOptions);

                window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
            }
            else
                callback();
        },

        cursorMouseDown: function (callback) {
            if (!browserUtils.hasTouchEvents) {
                cursor
                    .leftButtonDown()
                    .then(() => callback());
            }
            else
                callback();
        },

        mousedown: function (callback) {
            //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
            // therefore we should handle it and hide the dropdown (B236416)
            var needHandleMousedown = (browserUtils.isWebKit || browserUtils.isIE) && domUtils.isSelectElement(el);
            var wasPrevented        = null;
            var blurRaised          = false;
            var activeElement       = domUtils.getActiveElement();

            //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
            var isContentEditableBody = topElement.tagName.toLowerCase() === 'body' &&
                                        domUtils.isContentEditableElement(topElement);
            var needFocus             = !browserUtils.isIE || activeElement !== topElement || isContentEditableBody;

            var mouseDownCallback = () => window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);

            if (needHandleMousedown) {
                var onmousedown = function (e) {
                    wasPrevented = e.defaultPrevented;
                    eventUtils.preventDefault(e);
                    eventUtils.unbind(el, 'mousedown', onmousedown);
                };

                eventUtils.bind(el, 'mousedown', onmousedown);
            }

            var onblur = function () {
                blurRaised = true;
                eventUtils.unbind(activeElement, 'blur', onblur, true);
            };

            eventUtils.bind(activeElement, 'blur', onblur, true);

            notPrevented = eventSimulator.mousedown(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint) {
                currentTopElement = getElementFromPoint(screenPoint.x, screenPoint.y, target);

                if (currentTopElement && currentTopElement !== topElement) {
                    skipClickSimulation = true;
                    topElement          = currentTopElement;
                }
            }

            //In some cases (B239273, B253520) mousedown may lead to active element changing. Browsers raise blur in this cases.
            //We simulate blur event if active element was changed after mousedown and blur event was not raised automatically
            if (domUtils.getActiveElement() !== activeElement && !blurRaised)
                if (browserUtils.isIE && browserUtils.version < 12)
                //All ways to blur element from client script raise blur event asynchronously in IE (in MSEdge focus/blur is sync)
                    window.setTimeout(function () {
                        if (!blurRaised)
                            eventSimulator.blur(activeElement);
                    }, 0);
                else
                    eventSimulator.blur(activeElement);

            if (notPrevented === false) {
                if (needHandleMousedown && !wasPrevented)
                    notPrevented = true;
                else {
                    mouseDownCallback();
                    return;
                }
            }

            // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
            // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
            // element, a selection position may be calculated incorrectly (by using the caretPos option).
            automationUtil
                .focusAndSetSelection(domUtils.isContentEditableElement(el) ? el : topElement, needFocus, options.caretPos)
                .then(mouseDownCallback);
        },

        cursorMouseUp: function (callback) {
            cursor
                .buttonUp()
                .then(() => callback());
        },

        mouseup: function (callback) {
            eventSimulator.mouseup(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint)
                currentTopElement = getElementFromPoint(screenPoint.x, screenPoint.y, target);

            window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
        },

        click: function () {
            if ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) &&
                topElement.tagName.toLowerCase() === 'option') {
                runCallback();
                return;
            }

            if (topElement.tagName.toLowerCase() === 'option') {
                var select = domUtils.getSelectParent(topElement);

                if (select && ((browserUtils.isWebKit && styleUtils.getSelectElementSize(select) <= 1) ||
                               (browserUtils.isIE && styleUtils.getSelectElementSize(select) > 1)))
                    eventSimulator.click(select, eventOptions);
                else
                    eventSimulator.click(topElement, eventOptions);

                if (select)
                    eventSimulator.change(select);

                runCallback();
                return;
            }

            //NOTE: If the element under the cursor has changed after 'mousedown' event then we should not raise 'click' event
            if (!skipClickSimulation)
                eventSimulator.click(topElement, eventOptions);

            if (!domUtils.isElementFocusable(topElement))
                automationUtil.focusByRelatedElement(topElement);

            //NOTE: emulating click event on 'select' element doesn't expand dropdown with options (except chrome),
            // therefore we should emulate it.
            if ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) && domUtils.isSelectElement(topElement) &&
                styleUtils.getSelectElementSize(topElement) === 1 && notPrevented !== false) {
                //if this select already have options list
                if (selectElement.isOptionListExpanded(topElement))
                    selectElement.collapseOptionList();
                else
                    selectElement.expandOptionList(topElement);
            }

            runCallback();
        }
    });
};
