import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
import movePlaybackAutomation from './playback/move';

var messageSandbox = hammerhead.eventSandbox.message;

var SETTINGS              = testCafeCore.SETTINGS;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;

var cursor = testCafeUI.cursor;


function onMessage (e) {
    var message           = e.message,

        iFrameRectangle   = null,
        intersectionPoint = null;

    switch (message.cmd) {
        case CROSS_DOMAIN_MESSAGES.CURSOR_START_REQUEST_CMD:
            if (!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) {
                cursor.start(message.position, function () {
                    messageSandbox.sendServiceMsg({ cmd: CROSS_DOMAIN_MESSAGES.CURSOR_START_RESPONSE_CMD }, e.source);
                }, e.source);
            }
            break;

        case CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_REQUEST_CMD:
            var curCursorPosition = cursor.getPosition();

            if (!curCursorPosition) {
                messageSandbox.sendServiceMsg({
                    cmd:   CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_RESPONSE_CMD,
                    point: null
                }, e.source);
                return;
            }

            var fixedPoint         = positionUtils.getFixedPosition(message.point, e.source),
                pageCursorPosition = positionUtils.clientToOffsetCoord(curCursorPosition);

            iFrameRectangle = positionUtils.getIFrameCoordinates(e.source);

            if (checkPresenceInRectangle(pageCursorPosition, iFrameRectangle) &&
                checkPresenceInRectangle(fixedPoint, iFrameRectangle)) {
                messageSandbox.sendServiceMsg({
                    cmd:   CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_RESPONSE_CMD,
                    point: message.point
                }, e.source);
            }
            else {
                intersectionPoint = findLineAndRectangelIntersection(pageCursorPosition, fixedPoint, iFrameRectangle);

                movePlaybackAutomation(intersectionPoint, false, {}, function () {
                    messageSandbox.sendServiceMsg({
                        cmd:   CROSS_DOMAIN_MESSAGES.MOVE_TO_IFRAME_RESPONSE_CMD,
                        point: positionUtils.getFixedPositionForIFrame(intersectionPoint, e.source)
                    }, e.source);
                });
            }

            break;

        case CROSS_DOMAIN_MESSAGES.MOVE_CURSOR_IN_IFRAME_PING:
            if (message.isPingRequest) {
                messageSandbox.sendServiceMsg({
                    cmd:            CROSS_DOMAIN_MESSAGES.MOVE_CURSOR_IN_IFRAME_PING,
                    isPingResponse: true
                }, e.source);
            }
            break;

        case CROSS_DOMAIN_MESSAGES.MOVE_FROM_IFRAME_REQUEST_CMD:
            var frameDoc               = document.documentElement,
                iFrameVerticalScroll   = frameDoc.scrollHeight >
                                         frameDoc.clientHeight ? domUtils.getScrollbarSize() : 0,
                iFrameHorizontalScroll = frameDoc.scrollWidth > frameDoc.clientWidth ? domUtils.getScrollbarSize() : 0;

            iFrameRectangle = {
                left:   message.rectangle.left,
                right:  message.rectangle.right - iFrameVerticalScroll,
                top:    message.rectangle.top,
                bottom: message.rectangle.bottom - iFrameHorizontalScroll
            };

            if (!checkPresenceInRectangle(message.endPoint, iFrameRectangle)) {
                messageSandbox.sendServiceMsg({
                    cmd:   CROSS_DOMAIN_MESSAGES.MOVE_FROM_IFRAME_RESPONSE_CMD,
                    point: null
                }, e.source);
            }
            else {
                //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                cursor.setPosition(message.cursorPosition);

                intersectionPoint = findLineAndRectangelIntersection(message.startPoint, message.endPoint, iFrameRectangle);

                //NOTE: convert for IFrame
                intersectionPoint = {
                    x: intersectionPoint.x - iFrameRectangle.left,
                    y: intersectionPoint.y - iFrameRectangle.top
                };

                movePlaybackAutomation(positionUtils.clientToOffsetCoord(intersectionPoint), false, {}, function () {
                    messageSandbox.sendServiceMsg({
                        cmd:   CROSS_DOMAIN_MESSAGES.MOVE_FROM_IFRAME_RESPONSE_CMD,
                        point: intersectionPoint
                    }, e.source);
                });
            }

            break;

        case CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_REQUEST_CMD:
            var iFrame = domUtils.getIframeByWindow(e.source);

            var msg = {
                scroll:        styleUtils.getElementScroll(domUtils.findDocument(document)),
                iFrameOffset:  positionUtils.getOffsetPosition(iFrame),
                iFrameBorders: styleUtils.getBordersWidth(iFrame),
                iFramePadding: styleUtils.getElementPadding(iFrame),
                cmd:           CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_RESPONSE_CMD
            };

            messageSandbox.sendServiceMsg(msg, e.source);
            break;
    }
}

function checkPresenceInRectangle (point, rectangle) {
    return point.x >= rectangle.left && point.x <= rectangle.right && point.y >= rectangle.top &&
           point.y <= rectangle.bottom;
}

function findLineAndRectangelIntersection (pointStart, pointEnd, rectangle) {
    var points = [];

    var getLineYByXCoord = function (x) {
        if (pointEnd.x - pointStart.x === 0)
            return null;

        return pointStart.y + (x * (pointEnd.y - pointStart.y) + pointStart.x * (pointStart.y - pointEnd.y)) /
                              (pointEnd.x - pointStart.x);
    };

    var getLineXByYCoord = function (y) {
        if (pointEnd.y - pointStart.y === 0)
            return null;

        return pointStart.x + (y * (pointEnd.x - pointStart.x) + pointStart.y * (pointStart.x - pointEnd.x)) /
                              (pointEnd.y - pointStart.y);
    };

    var getDistanceBetweenPoints = function (start, end) {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    };

    var findTransfer = function (coord, isHorizontalSide) {
        var intersection = isHorizontalSide ? getLineXByYCoord(coord) : getLineYByXCoord(coord),
            hasTransfer  = intersection &&
                           (isHorizontalSide ? (intersection >= rectangle.left && intersection <= rectangle.right) :
                            (intersection >= rectangle.top && intersection <= rectangle.bottom));

        if (hasTransfer) {
            points.push({
                x: isHorizontalSide ? Math.round(intersection) : Math.round(coord),
                y: isHorizontalSide ? Math.round(coord) : Math.round(intersection)
            });
        }
    };

    for (var prop in rectangle) {
        if (rectangle.hasOwnProperty(prop))
            findTransfer(rectangle[prop], /top|bottom/.test(prop));
    }

    return points.length === 1 ||
           getDistanceBetweenPoints(pointStart, points[0]) < getDistanceBetweenPoints(pointStart, points[1]) ?
           points[0] : points[1];
}

export function init () {
    messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
}

export function destroy () {
    messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, onMessage);
}
