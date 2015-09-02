import * as hammerheadAPI from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';

import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import scrollPlaybackAutomation from '../playback/scroll';
import async from '../../deps/async';

var browserUtils   = hammerheadAPI.Util.Browser;
var eventSimulator = hammerheadAPI.EventSandbox.EventSimulator;
var messageSandbox = hammerheadAPI.MessageSandbox;
var nativeMethods  = hammerheadAPI.NativeMethods;

var $                     = testCafeCore.$;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;
var styleUtils            = testCafeCore.styleUtils;
var eventUtils            = testCafeCore.eventUtils;

var cursor = testCafeUI.cursor;


export default function (to, inDragging, options, actionCallback, currentDocument, skipEvents, inSelect) {
    currentDocument = currentDocument || document;

    var targetPoint           = domUtils.isDomElement(to) ?
                                automationUtil.getMouseActionPoint(to, options, false) :
                                {
                                    x: Math.floor(to.x),
                                    y: Math.floor(to.y)
                                },

        isMovingInIFrame      = currentDocument !== document,
        targetScreenPoint     = null,
        startX                = null,
        startY                = null,
        dragElement           = null,

        // moving settings
        distanceX             = null,
        distanceY             = null,

        startTime             = null,
        endTime               = null,
        movingTime            = null,

        lastOverElement       = null,//B235842

        currentCursorPosition = cursor.getPosition(),

        $window               = $(window);

    // moving step
    function nextStep (movingStepCallback) {
        async.series({
            setPosition:   function (callback) {
                if (browserUtils.hasTouchEvents && !inDragging) {
                    currentCursorPosition = targetScreenPoint;
                    cursor.move(currentCursorPosition, movingStepCallback);
                    return;
                }

                if (!startTime) {
                    startTime = nativeMethods.dateNow();
                    endTime   = startTime + movingTime;
                }

                var currentTime = Math.min(nativeMethods.dateNow(), endTime),
                    progress    = (currentTime - startTime) / (endTime - startTime);

                currentCursorPosition = {
                    x: Math.round(startX + (distanceX * progress)),
                    y: Math.round(startY + (distanceY * progress))
                };

                //NOTE: mousemove event can't be simulated on the point when cursor was at the start. Therefore we increases
                // a minimal distance 1 px.
                if (currentCursorPosition.x === startX && currentCursorPosition.y === startY) {
                    if (inSelect) {
                        movingStepCallback();
                        return;
                    }

                    if (distanceX !== 0)
                        currentCursorPosition.x = currentCursorPosition.x + (distanceX > 0 ? 1 : -1);
                    else if (distanceY !== 0)
                        currentCursorPosition.y = currentCursorPosition.y + (distanceY > 0 ? 1 : -1);

                }

                cursor.move(currentCursorPosition, callback);
            },
            emulateEvents: function () {
                if (!skipEvents) {
                    // moving events
                    var currentElement = cursor.getElementUnderCursor(currentCursorPosition.x, currentCursorPosition.y),
                        eventPoint     = currentCursorPosition;

                    if (inDragging && !dragElement)
                        dragElement = currentElement;

                    if (currentElement)
                        eventPoint = automationUtil.getEventOptionCoordinates(currentElement, currentCursorPosition);

                    var eventOptions = $.extend({
                        clientX: eventPoint.x,
                        clientY: eventPoint.y,
                        button:  0,
                        which:   browserUtils.isWebKit ? (inDragging ? eventUtils.WHICH_PARAMETER.LEFT_BUTTON : eventUtils.WHICH_PARAMETER.NO_BUTTON) : 1,
                        buttons: inDragging ? eventUtils.BUTTONS_PARAMETER.LEFT : eventUtils.BUTTONS_PARAMETER.NO_BUTTON
                    }, options);

                    var currentElementChanged = true;

                    try {
                        //NOTE: when lastOverElement was in an iframe that removed, ie raises exception when we try to
                        // compare it with current element
                        currentElementChanged = currentElement !== lastOverElement;
                    }
                    catch (e) {
                        lastOverElement       = null;
                        currentElementChanged = true;
                    }

                    if (currentElementChanged && lastOverElement)
                        eventSimulator.mouseout(lastOverElement, $.extend({ relatedTarget: currentElement }, eventOptions));

                    var eventName = browserUtils.hasTouchEvents ? 'touchmove' : 'mousemove',
                        el        = browserUtils.hasTouchEvents ? dragElement : currentElement;

                    //NOTE: only in IE a 'mousemove' event is raised before a 'mouseover' one (B236966)
                    if (browserUtils.isIE && currentElement)
                        eventSimulator[eventName](el, eventOptions);

                    if (currentElementChanged) {
                        if (currentElement)
                            eventSimulator.mouseover(currentElement, $.extend({ relatedTarget: lastOverElement }, eventOptions));
                        lastOverElement = currentElement;
                    }

                    if (!browserUtils.isIE && currentElement)
                        eventSimulator[eventName](el, eventOptions);

                    //NOTE: we need add extra 'mousemove' if element was changed
                    // because sometimes client script require several 'mousemove' events for element (T246904)
                    if (currentElementChanged && currentElement)
                        eventSimulator[eventName](el, eventOptions);

                }
                movingStepCallback();
            }
        });
    }

    async.series({
        scrollToTarget: function (callback) {
            var elementOffset = domUtils.isDomElement(to) ? positionUtils.getOffsetPosition(to) : null;
            scrollPlaybackAutomation(domUtils.isDomElement(to) ? to : targetPoint, options, currentDocument, function () {
                if (domUtils.isDomElement(to)) {
                    var newElementOffset = positionUtils.getOffsetPosition(to),
                        elementScroll    = styleUtils.getElementScroll(to);

                    if (to !== document.documentElement) {
                        targetPoint.x += newElementOffset.left - elementOffset.left;
                        targetPoint.y += newElementOffset.top - elementOffset.top;
                    }

                    if (!/html/i.test(to.tagName) && styleUtils.hasScroll(to, currentDocument)) {
                        targetPoint.x -= elementScroll.left;
                        targetPoint.y -= elementScroll.top;
                    }
                }
                targetScreenPoint = positionUtils.offsetToClientCoords(targetPoint);
                callback();
            });
        },

        setCursor: function (callback) {
            if (targetPoint.x < 0 || targetScreenPoint.x > $window.width() ||
                targetScreenPoint.y < 0 || targetScreenPoint.y > $window.height) {
                actionCallback();
                return;
            }

            var windowTopResponse = null;

            if (window.top === window.self) {
                var curCursorPosition = cursor.getPosition(),
                    currentElement    = curCursorPosition ?
                                        cursor.getElementUnderCursor(curCursorPosition.x, curCursorPosition.y) : null;

                if (!currentElement || !(currentElement.tagName && currentElement.tagName.toLowerCase() === 'iframe')) {
                    cursor.ensureCursorPosition(targetScreenPoint, false, callback);
                    return;
                }

                var pageCursorPosition     = positionUtils.clientToOffsetCoord(curCursorPosition),
                    //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                    fixedPositionForIFrame = positionUtils.getFixedPositionForIFrame(pageCursorPosition, currentElement.contentWindow);

                if (fixedPositionForIFrame.x <= 0 || fixedPositionForIFrame.y <= 0)
                    cursor.ensureCursorPosition(targetScreenPoint, false, callback);

                messageSandbox.pingIFrame(currentElement, CROSS_DOMAIN_MESSAGES.MOVE_CURSOR_IN_IFRAME_PING, function (err) {
                    if (!err) {
                        //NOTE: move over iframe then move above top document
                        windowTopResponse = function (e) {
                            if (e.message.cmd === CROSS_DOMAIN_MESSAGES.MOVE_FROM_IFRAME_RESPONSE_CMD) {
                                messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                                if (!e.message.point)
                                    cursor.ensureCursorPosition(targetScreenPoint, false, callback);
                                else if (cursor.getPosition()) {
                                    cursor.setPosition(positionUtils.getFixedPosition(e.message.point, currentElement.contentWindow, true));
                                    window.setTimeout(callback, 0);
                                }
                                else
                                    cursor.ensureCursorPosition(positionUtils.getFixedPosition(e.message.point, currentElement.contentWindow, true), true, callback);
                            }
                        };

                        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);


                        messageSandbox.sendServiceMsg({
                            cmd:            CROSS_DOMAIN_MESSAGES.MOVE_FROM_IFRAME_REQUEST_CMD,
                            rectangle:      positionUtils.getIFrameCoordinates(currentElement.contentWindow),
                            startPoint:     positionUtils.clientToOffsetCoord(targetScreenPoint),
                            endPoint:       pageCursorPosition,
                            //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                            cursorPosition: positionUtils.getFixedPositionForIFrame(pageCursorPosition, currentElement.contentWindow)
                        }, currentElement.contentWindow);
                    }
                    else {
                        cursor.ensureCursorPosition(targetScreenPoint, false, callback);
                        return;
                    }
                }, true);
            }
            else {
                //NOTE: move over top document than move above iframe
                windowTopResponse = function (e) {
                    if (e.message.cmd === CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_RESPONSE_CMD) {
                        messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                        if (!e.message.point ||
                            (e.message.point.x === targetScreenPoint.x && e.message.point.y === targetScreenPoint.y))
                            cursor.ensureCursorPosition(targetScreenPoint, false, callback);
                        else if (cursor.getPosition()) {
                            cursor.setPosition(e.message.point);
                            window.setTimeout(callback, 0);
                        }
                        else
                            cursor.ensureCursorPosition(e.message.point, true, callback);
                    }
                };

                messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                messageSandbox.sendServiceMsg({
                    cmd:   CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_REQUEST_CMD,
                    point: targetScreenPoint
                }, window.top);
            }
        },

        moveToTarget: function (callback) {
            currentCursorPosition = cursor.getPosition();

            if (!currentCursorPosition) {
                actionCallback();
                return;
            }

            startX    = currentCursorPosition.x;
            startY    = currentCursorPosition.y;
            distanceX = targetScreenPoint.x - startX;
            distanceY = targetScreenPoint.y - startY;

            if (isMovingInIFrame) {
                startX -= $(currentDocument).scrollLeft();
                startY -= $(currentDocument).scrollTop();
            }

            movingTime = Math.max(Math.abs(distanceX), Math.abs(distanceY)) /
                         (inDragging ? automationSettings.MOVING_SPEED_IN_DRAGGING : automationSettings.MOVING_SPEED);

            if (inDragging)
                movingTime = Math.max(movingTime, automationSettings.MINIMUM_MOVING_TIME);

            async.whilst(
                //is cursor in the target
                function () {
                    if (isMovingInIFrame)
                        return (currentCursorPosition.x + $(currentDocument).scrollLeft()) !== targetScreenPoint.x ||
                               (currentCursorPosition.y + $(currentDocument).scrollTop()) !== targetScreenPoint.y;

                    return currentCursorPosition.x !== targetScreenPoint.x ||
                           currentCursorPosition.y !== targetScreenPoint.y;
                },

                //moving step
                function (movingCallback) {
                    window.setTimeout(function () {
                        nextStep(movingCallback);
                    }, 0);
                },

                //save cursor position
                function (err) {
                    if (err)
                        return;
                    callback();
                }
            );
        },


        callback: function () {
            actionCallback();
        }
    });
};
