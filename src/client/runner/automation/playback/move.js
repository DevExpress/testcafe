import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { OffsetOptions, MoveOptions } from '../options';
import ScrollAutomation from './scroll';
import cursor from '../cursor';

import { underCursor as getElementUnderCursor } from '../get-element';
import getLineRectIntersection from '../../utils/get-line-rect-intersection';
import { sendRequestToFrame } from '../../utils/iframe';
import whilst from '../../utils/promise-whilst';
import nextTick from '../../utils/next-tick';

var Promise        = hammerhead.Promise;
var nativeMethods  = hammerhead.nativeMethods;
var browserUtils   = hammerhead.utils.browser;
var extend         = hammerhead.utils.extend;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var messageSandbox = hammerhead.eventSandbox.message;

var positionUtils = testCafeCore.positionUtils;
var domUtils      = testCafeCore.domUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;


const MOVE_REQUEST_CMD  = 'automation|move|request';
const MOVE_RESPONSE_CMD = 'automation|move|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === MOVE_REQUEST_CMD) {
        if (e.source.parent === window.self)
            MoveAutomation.onMoveToIframeRequest(e);
        else {
            hammerhead.on(hammerhead.EVENTS.beforeUnload, () => messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, e.source));

            MoveAutomation.onMoveOutRequest(e);
        }
    }
});

// Static
var lastHoveredElement = null;


export default class MoveAutomation {
    constructor (element, moveOptions) {
        this.DEFAULT_SPEED = 1000; // pixes/ms

        this.touchMode = browserUtils.hasTouchEvents;
        this.moveEvent = this.touchMode ? 'touchmove' : 'mousemove';

        this.dragMode    = moveOptions.dragMode;
        this.dragElement = this.dragMode ? getElementUnderCursor() : null;

        this.element       = element;
        this.offsetX       = moveOptions.offsetX;
        this.offsetY       = moveOptions.offsetY;
        this.speed         = moveOptions.speed || this.DEFAULT_SPEED;
        this.minMovingTime = moveOptions.minMovingTime || null;
        this.modifiers     = moveOptions.modifiers || {};

        this.endPoint = null;

        // moving state
        this.movingTime = null;
        this.x          = null;
        this.y          = null;
        this.startTime  = null;
        this.endTime    = null;
        this.distanceX  = null;
        this.distanceY  = null;
    }

    static onMoveToIframeRequest (e) {
        var iframePoint = {
            x: e.message.endX,
            y: e.message.endY
        };

        var iframeWin                   = e.source;
        var iframe                      = domUtils.findIframeInTopWindow(iframeWin);
        var iframeBorders               = styleUtils.getBordersWidth(iframe);
        var iframePadding               = styleUtils.getElementPadding(iframe);
        var iframeRectangle             = positionUtils.getIframeClientCoordinates(iframe);
        var iframePointRelativeToParent = positionUtils.getIframePointRelativeToParentFrame(iframePoint, iframeWin);
        var cursorPosition              = cursor.position;

        var intersectionPoint = positionUtils.isInRectangle(cursorPosition, iframeRectangle) ? cursorPosition :
                                getLineRectIntersection(cursorPosition, iframePointRelativeToParent, iframeRectangle);

        var intersectionRelatedToIframe = {
            x: intersectionPoint.x - iframeRectangle.left,
            y: intersectionPoint.y - iframeRectangle.top
        };

        var moveOptions = new MoveOptions({
            modifiers: e.message.modifiers,
            offsetX:   intersectionRelatedToIframe.x + iframeBorders.left + iframePadding.left,
            offsetY:   intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top
        }, false);

        var moveAutomation = new MoveAutomation(iframe, moveOptions);

        var responseMsg = {
            cmd: MOVE_RESPONSE_CMD,
            x:   intersectionRelatedToIframe.x,
            y:   intersectionRelatedToIframe.y
        };

        if (cursor.activeWindow !== iframeWin) {
            moveAutomation
                .run()
                .then(() => {
                    cursor.activeWindow = iframeWin;

                    messageSandbox.sendServiceMsg(responseMsg, iframeWin);
                });
        }
        else
            messageSandbox.sendServiceMsg(responseMsg, iframeWin);
    }

    static onMoveOutRequest (e) {
        var parentWin = e.source;

        var iframeRectangle = {
            left:   e.message.left,
            right:  e.message.right,
            top:    e.message.top,
            bottom: e.message.bottom
        };

        if (!e.message.iframeUnderCursor) {
            var { startX, startY } = e.message;

            var clientX = startX - iframeRectangle.left;
            var clientY = startY - iframeRectangle.top;

            eventSimulator.mouseout(lastHoveredElement, { clientX, clientY, relatedTarget: null });
            messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, parentWin);

            return;
        }

        var cursorPosition = cursor.position;

        var startPoint = {
            x: iframeRectangle.left + cursorPosition.x,
            y: iframeRectangle.top + cursorPosition.y
        };

        var endPoint          = { x: e.message.endX, y: e.message.endY };
        var intersectionPoint = getLineRectIntersection(startPoint, endPoint, iframeRectangle);

        var moveOptions = new MoveOptions({
            modifiers: e.message.modifiers,
            offsetX:   intersectionPoint.x - iframeRectangle.left,
            offsetY:   intersectionPoint.y - iframeRectangle.top
        }, false);

        var moveAutomation = new MoveAutomation(document.documentElement, moveOptions);

        moveAutomation
            .run()
            .then(() => {
                var responseMsg = {
                    cmd: MOVE_RESPONSE_CMD,
                    x:   intersectionPoint.x,
                    y:   intersectionPoint.y
                };

                cursor.activeWindow = parentWin;
                messageSandbox.sendServiceMsg(responseMsg, parentWin);
            });
    }

    _getTargetClientPoint () {
        var scroll = styleUtils.getElementScroll(this.element);

        if (domUtils.isHtmlElement(this.element)) {
            return {
                x: this.offsetX - scroll.left,
                y: this.offsetY - scroll.top
            };
        }

        var clientPosition = positionUtils.getClientPosition(this.element);
        var isDocumentBody = this.element.tagName && domUtils.isBodyElement(this.element);

        return {
            x: isDocumentBody ? clientPosition.x + this.offsetX : clientPosition.x + this.offsetX - scroll.left,
            y: isDocumentBody ? clientPosition.y + this.offsetY : clientPosition.y + this.offsetY - scroll.top
        };
    }

    _emulateEvents () {
        var currentElement = this.dragMode ? this.dragElement : getElementUnderCursor();
        var whichButton    = this.dragMode ? eventUtils.WHICH_PARAMETER.leftButton : eventUtils.WHICH_PARAMETER.noButton;
        var button         = this.dragMode ? eventUtils.BUTTONS_PARAMETER.leftButton : eventUtils.BUTTONS_PARAMETER.noButton;

        var eventOptions = {
            clientX: this.x,
            clientY: this.y,
            button:  0,
            which:   browserUtils.isWebKit ? whichButton : 1,
            buttons: button,
            ctrl:    this.modifiers.ctrl,
            alt:     this.modifiers.alt,
            shift:   this.modifiers.shift,
            meta:    this.modifiers.meta
        };

        // NOTE: if lastHoveredElement was in an iframe that has been removed, IE
        // raises an exception when we try to compare it with the current element
        var lastHoveredElementInDocument = lastHoveredElement &&
                                           domUtils.isElementInDocument(lastHoveredElement);

        var lastHoveredElementInRemovedIframe = lastHoveredElement &&
                                                domUtils.isElementInIframe(lastHoveredElement) &&
                                                !domUtils.getIframeByElement(lastHoveredElement);

        if (lastHoveredElementInRemovedIframe || !lastHoveredElementInDocument)
            lastHoveredElement = null;

        var currentElementChanged = currentElement !== lastHoveredElement;

        if (currentElementChanged && lastHoveredElement)
            eventSimulator.mouseout(lastHoveredElement, extend({ relatedTarget: currentElement }, eventOptions));

        // NOTE: the 'mousemove' event is raised before 'mouseover' in IE only (B236966)
        if (browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        if (currentElementChanged) {
            if (currentElement)
                eventSimulator.mouseover(currentElement, extend({ relatedTarget: lastHoveredElement }, eventOptions));

            lastHoveredElement = currentElement;
        }

        if (!browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
        // the client script requires several 'mousemove' events for an element (T246904)
        if (currentElementChanged && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);
    }

    _movingStep () {
        if (this.touchMode && !this.dragMode) {
            this.x = this.endPoint.x;
            this.y = this.endPoint.y;
        }
        else if (!this.startTime) {
            this.startTime = nativeMethods.dateNow();
            this.endTime   = this.startTime + this.movingTime;

            // NOTE: the mousemove event can't be simulated at the point where the cursor
            // was located at the start. Therefore, we add a minimal distance 1 px.
            this.x += this.distanceX > 0 ? 1 : -1;
            this.y += this.distanceY > 0 ? 1 : -1;
        }
        else {
            var currentTime = Math.min(nativeMethods.dateNow(), this.endTime);
            var progress    = (currentTime - this.startTime) / (this.endTime - this.startTime);

            this.x = Math.floor(this.startPoint.x + this.distanceX * progress);
            this.y = Math.floor(this.startPoint.y + this.distanceY * progress);
        }

        return cursor
            .move(this.x, this.y)
            .then(() => this._emulateEvents())
            .then(nextTick);
    }

    _isMovingFinished () {
        return this.x === this.endPoint.x && this.y === this.endPoint.y;
    }

    _move () {
        this.startPoint = cursor.position;
        this.x          = this.startPoint.x;
        this.y          = this.startPoint.y;

        this.distanceX = this.endPoint.x - this.startPoint.x;
        this.distanceY = this.endPoint.y - this.startPoint.y;

        this.movingTime = Math.max(Math.abs(this.distanceX), Math.abs(this.distanceY)) / this.speed;

        if (this.minMovingTime)
            this.movingTime = Math.max(this.movingTime, this.minMovingTime);

        return whilst(() => !this._isMovingFinished(), () => this._movingStep());
    }

    _scroll () {
        var scrollOptions    = new OffsetOptions({ offsetX: this.offsetX, offsetY: this.offsetY }, false);
        var scrollAutomation = new ScrollAutomation(this.element, scrollOptions);

        return scrollAutomation.run();
    }

    _moveToCurrentFrame () {
        if (cursor.active)
            return Promise.resolve();

        var { x, y }          = cursor.position;
        var activeWindow      = cursor.activeWindow;
        var iframe            = null;
        var iframeUnderCursor = null;
        var iframeRectangle   = null;

        var msg = {
            cmd:       MOVE_REQUEST_CMD,
            startX:    x,
            startY:    y,
            endX:      this.endPoint.x,
            endY:      this.endPoint.y,
            modifiers: this.modifiers
        };

        if (activeWindow.parent === window.self) {
            iframe            = domUtils.findIframeInTopWindow(activeWindow);
            iframeRectangle   = positionUtils.getIframeClientCoordinates(iframe);
            iframeUnderCursor = getElementUnderCursor() === iframe;

            msg.left              = iframeRectangle.left;
            msg.top               = iframeRectangle.top;
            msg.right             = iframeRectangle.right;
            msg.bottom            = iframeRectangle.bottom;
            msg.iframeUnderCursor = iframeUnderCursor;
        }

        return sendRequestToFrame(msg, MOVE_RESPONSE_CMD, activeWindow)
            .then(message => {
                cursor.activeWindow = window;

                if (iframeUnderCursor || window.top !== window.self)
                    return cursor.move(message.x, message.y);
            });
    }

    run () {
        return this
            ._scroll()
            .then(() => {
                var { x, y }     = this._getTargetClientPoint();
                var windowWidth  = styleUtils.getWidth(window);
                var windowHeight = styleUtils.getHeight(window);

                if (x >= 0 && x <= windowWidth && y >= 0 && y <= windowHeight) {
                    this.endPoint = { x, y };

                    return this
                        ._moveToCurrentFrame()
                        .then(() => this._move());
                }
            });
    }
}
