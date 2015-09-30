import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import movePlaybackAutomation from '../playback/move';
import async from '../../deps/async';

var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;
var nativeMethods    = hammerhead.nativeMethods;

var $             = testCafeCore.$;
var SETTINGS      = testCafeCore.SETTINGS;
var ERROR_TYPE    = testCafeCore.ERROR_TYPE;
var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;

var cursor        = testCafeUI.cursor;
var selectElement = testCafeUI.selectElement;


function getSelectChildElementIndex ($select, child) {
    var $allChildren = child.tagName.toLowerCase() === 'option' ? $select.find('option') : $select.find('optgroup');

    return $.inArray(child, $allChildren);
}

function clickOnSelectChildElement (childElement, clickOptions, actionCallback, errorCallback) {
    var isClickOnOption = childElement.tagName.toLowerCase() === 'option',
        select          = domUtils.getSelectParent(childElement);

    if (!select) {
        eventSimulator.click(childElement, clickOptions);
        actionCallback();
        return;
    }

    var $select              = $(select),
        selectedIndex        = select.selectedIndex,
        isOptionListExpanded = selectElement.isOptionListExpanded($select),
        childIndex           = getSelectChildElementIndex($select, childElement),
        targetElement        = null;

    if (!isOptionListExpanded) {
        var selectSizeValue = styleUtils.getSelectElementSize(select);

        if ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) && selectSizeValue <= 1) {
            errorCallback({
                code:    ERROR_TYPE.invisibleActionElement,
                element: domUtils.getElementDescription(childElement)
            });
            return;
        }

        targetElement = childElement;
    }
    else
        targetElement = selectElement.getEmulatedChildElement(childIndex, !isClickOnOption);

    async.series({
            moveCursorToElement: function (callback) {
                //NOTE: 'target' is option from emulated optionList or the point (x,y-coordinates) of real option element
                var target = null;

                if (isOptionListExpanded)
                    target = targetElement;
                else {
                    selectElement.scrollOptionListByChild(childElement);
                    target = selectElement.getSelectChildCenter(childElement);
                }

                movePlaybackAutomation(target, false, {}, function () {
                    window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
                });
            },

            click: function () {
                var clickLeadChanges = isClickOnOption && !targetElement.disabled;

                if (styleUtils.getSelectElementSize($select[0]) > 1) {
                    if (browserUtils.isMozilla) {
                        eventSimulator.mousedown(targetElement, clickOptions);

                        if (clickLeadChanges)
                            $select[0].selectedIndex = childIndex;

                        focusBlurSandbox.focus($select[0], function () {
                            window.setTimeout(function () {
                                eventSimulator.mouseup(targetElement, clickOptions);

                                if (isClickOnOption && $(childElement).index() !== selectedIndex)
                                    eventSimulator.change($select[0]);

                                eventSimulator.click(targetElement, clickOptions);
                                actionCallback();
                            }, browserUtils.hasTouchEvents ? 0 : automationSettings.CLICK_STEP_DELAY);
                        }, false, true);
                    }
                    else if (browserUtils.isIE) {
                        eventSimulator.mousedown($select[0], clickOptions);

                        focusBlurSandbox.focus($select[0], function () {
                            window.setTimeout(function () {
                                eventSimulator.mouseup($select[0], clickOptions);

                                if (clickLeadChanges)
                                    $select[0].selectedIndex = childIndex;

                                if (isClickOnOption && $(childElement).index() !== selectedIndex)
                                    eventSimulator.change($select[0]);

                                eventSimulator.click($select[0], clickOptions);
                                actionCallback();
                            }, browserUtils.hasTouchEvents ? 0 : automationSettings.CLICK_STEP_DELAY);
                        }, false, true);
                    }
                    else {
                        //NOTE: after mousedown in Chrome document.activeElement = select.
                        //But we need to raise blur and change event for previous active element during focus raising.
                        //That's why we should change event order and raise focus before mousedown.
                        focusBlurSandbox.focus($select[0], function () {
                            window.setTimeout(function () {
                                eventSimulator.mousedown(targetElement, clickOptions);

                                if (clickLeadChanges)
                                    $select[0].selectedIndex = childIndex;

                                eventSimulator.mouseup(targetElement, clickOptions);

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
        target              = positionUtils.isContainOffset(el, options.offsetX, options.offsetY) ?
                              el : automationUtil.getMouseActionPoint(el, options, false),
        notPrevented        = true,
        topElement          = null,
        isInvisibleElement  = false,
        currentTopElement   = null,
        skipClickSimulation = false;

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
                if ((isSVGElement && browserUtils.isOpera) || ($(el).is('tref')))
                    topElement = el; //NOTE: document.elementFromPoint can't find this element
                else {
                    screenPoint = automationUtil.getMouseActionPoint(el, options, true);
                    eventPoint  = automationUtil.getEventOptionCoordinates(el, screenPoint);

                    eventOptions = $.extend({
                        clientX: eventPoint.x,
                        clientY: eventPoint.y
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

        //NOTE: touch devices only
        touchstart: function (callback) {
            if (browserUtils.hasTouchEvents)
                eventSimulator.touchstart(topElement, eventOptions);
            callback();
        },

        //NOTE: touch devices only
        cursorTouchMouseDown: function (callback) {
            if (browserUtils.hasTouchEvents)
                cursor.lMouseDown(callback);
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
            if (!browserUtils.hasTouchEvents)
                cursor.lMouseDown(callback);
            else
                callback();
        },

        mousedown: function (callback) {
            //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
            // therefore we should handle it and hide the dropdown (B236416)
            var needHandleMousedown = (browserUtils.isWebKit || browserUtils.isIE) && domUtils.isSelectElement(el),
                wasPrevented        = null,
                blurRaised          = false,
                activeElement       = domUtils.getActiveElement(),
                //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
                needFocus           = !(browserUtils.isIE && activeElement === topElement),
                mouseDownCallback   = function () {
                    window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
                };

            if (needHandleMousedown) {
                var onmousedown = function (e) {
                    wasPrevented = e.defaultPrevented;
                    eventUtils.preventDefault(e);
                    nativeMethods.removeEventListener.call(el, 'mousedown', onmousedown, false);
                };

                nativeMethods.addEventListener.call(el, 'mousedown', onmousedown, false);
            }

            var onblur = function () {
                blurRaised = true;
                nativeMethods.removeEventListener.call(activeElement, 'blur', onblur, true);
            };
            nativeMethods.addEventListener.call(activeElement, 'blur', onblur, true);

            notPrevented = eventSimulator.mousedown(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint) {
                currentTopElement = automationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

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

            //NOTE: For contentEditable elements we should call focus directly for action's element because
            //option 'caretPos' is indicated for this element and topElement may be a child of this element
            automationUtil.focusAndSetSelection(domUtils.isContentEditableElement(el) ? el : topElement, options, needFocus, mouseDownCallback);
        },

        cursorMouseUp: function (callback) {
            cursor.mouseUp(callback);
        },

        mouseup: function (callback) {
            eventSimulator.mouseup(topElement, eventOptions);

            if (!isInvisibleElement && screenPoint)
                currentTopElement = automationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

            window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
        },

        click: function () {
            var $el = $(topElement);

            if ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) &&
                topElement.tagName.toLowerCase() === 'option') {
                runCallback();
                return;
            }

            if (topElement.tagName.toLowerCase() === 'option') {
                var select  = domUtils.getSelectParent(topElement),
                    $select = $(select);

                if (select && ((browserUtils.isWebKit && styleUtils.getSelectElementSize(select) <= 1) ||
                               (browserUtils.isIE && styleUtils.getSelectElementSize(select) > 1)))
                    eventSimulator.click($select[0], eventOptions);
                else
                    eventSimulator.click($el[0], eventOptions);

                if (select)
                    eventSimulator.change($select[0]);

                runCallback();
                return;
            }

            //NOTE: If the element under the cursor has changed after 'mousedown' event then we should not raise 'click' event
            if (!skipClickSimulation)
                eventSimulator.click(topElement, eventOptions);

            automationUtil.focusLabelChildElement(topElement);

            //NOTE: emulating click event on 'select' element doesn't expand dropdown with options (except chrome),
            // therefore we should emulate it.
            if ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) && domUtils.isSelectElement(topElement) &&
                styleUtils.getSelectElementSize(topElement) === 1 && notPrevented !== false) {
                //if this select already have options list
                if (selectElement.isOptionListExpanded($el))
                    selectElement.collapseOptionList();
                else
                    selectElement.expandOptionList(topElement);
            }

            runCallback();
        }
    });
};
