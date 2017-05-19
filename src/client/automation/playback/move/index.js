import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { OffsetOptions, MoveOptions } from '../../../../test-run/commands/options';
import ScrollAutomation from '../scroll';
import cursor from '../../cursor';

import { underCursor as getElementUnderCursor } from '../../get-element';
import getAutomationPoint from '../../utils/get-automation-point';
import getLineRectIntersection from '../../utils/get-line-rect-intersection';
import whilst from '../../utils/promise-whilst';
import nextTick from '../../utils/next-tick';
import AutomationSettings from '../../settings';

var Promise        = hammerhead.Promise;
var nativeMethods  = hammerhead.nativeMethods;
var browserUtils   = hammerhead.utils.browser;
var extend         = hammerhead.utils.extend;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var messageSandbox = hammerhead.eventSandbox.message;
var DataTransfer   = hammerhead.eventSandbox.DataTransfer;
var DragDataStore  = hammerhead.eventSandbox.DragDataStore;

var positionUtils      = testCafeCore.positionUtils;
var domUtils           = testCafeCore.domUtils;
var styleUtils         = testCafeCore.styleUtils;
var eventUtils         = testCafeCore.eventUtils;
var sendRequestToFrame = testCafeCore.sendRequestToFrame;


const MOVE_REQUEST_CMD  = 'automation|move|request';
const MOVE_RESPONSE_CMD = 'automation|move|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === MOVE_REQUEST_CMD) {
        if (e.source.parent === window)
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
        this.touchMode = browserUtils.isTouchDevice;
        this.moveEvent = this.touchMode ? 'touchmove' : 'mousemove';

        this.holdLeftButton = moveOptions.holdLeftButton;
        this.dragElement    = null;

        this.dataTransfer    = null;
        this.dragDataStore   = null;
        this.dragAndDropMode = false;
        this.dropAllowed     = false;

        this.automationSettings = new AutomationSettings(moveOptions.speed);

        var target = MoveAutomation.getTarget(element, moveOptions.offsetX, moveOptions.offsetY);

        this.element       = target.element;
        this.offsetX       = target.offsetX;
        this.offsetY       = target.offsetY;
        this.speed         = moveOptions.speed;
        this.cursorSpeed   = this.holdLeftButton ? this.automationSettings.draggingSpeed : this.automationSettings.cursorSpeed;

        this.minMovingTime = moveOptions.minMovingTime || null;
        this.modifiers     = moveOptions.modifiers || {};
        this.skipScrolling = moveOptions.skipScrolling;

        this.endPoint = null;

        // moving state
        this.movingTime = null;
        this.x          = null;
        this.y          = null;
        this.startTime  = null;
        this.endTime    = null;
        this.distanceX  = null;
        this.distanceY  = null;

        this.firstMovingStepOccured = false;
    }

    static getTarget (el, offsetX, offsetY) {
        // NOTE: if the target point (considering offsets) is out of
        // the element change the target element to the document element
        var relateToDocument = !positionUtils.containsOffset(el, offsetX, offsetY);
        var relatedPoint     = relateToDocument ? getAutomationPoint(el, offsetX, offsetY) : { x: offsetX, y: offsetY };

        return {
            element: relateToDocument ? document.documentElement : el,
            offsetX: relatedPoint.x,
            offsetY: relatedPoint.y
        };
    }

    static onMoveToIframeRequest (e) {
        var iframePoint = {
            x: e.message.endX,
            y: e.message.endY
        };

        var iframeWin                   = e.source;
        var iframe                      = domUtils.findIframeByWindow(iframeWin);
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
            offsetY:   intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top,
            speed:     e.message.speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true
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

            // NOTE: We should not emulate mouseout if iframe was reloaded.
            if (lastHoveredElement)
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

        // NOTE: We should not move the cursor out of the iframe if
        // the cursor path does not intersect with the iframe borders.
        if (!intersectionPoint) {
            messageSandbox.sendServiceMsg({
                cmd: MOVE_RESPONSE_CMD,
                x:   iframeRectangle.left,
                y:   iframeRectangle.top
            }, parentWin);

            return;
        }

        var moveOptions = new MoveOptions({
            modifiers: e.message.modifiers,
            offsetX:   intersectionPoint.x - iframeRectangle.left,
            offsetY:   intersectionPoint.y - iframeRectangle.top,
            speed:     e.message.speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true
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

    get _eventOptions () {
        var whichButton = this.holdLeftButton ? eventUtils.WHICH_PARAMETER.leftButton : eventUtils.WHICH_PARAMETER.noButton;
        var button      = this.holdLeftButton ? eventUtils.BUTTONS_PARAMETER.leftButton : eventUtils.BUTTONS_PARAMETER.noButton;

        return {
            clientX:      this.x,
            clientY:      this.y,
            button:       0,
            which:        browserUtils.isWebKit ? whichButton : 1,
            buttons:      button,
            ctrl:         this.modifiers.ctrl,
            alt:          this.modifiers.alt,
            shift:        this.modifiers.shift,
            meta:         this.modifiers.meta,
            dataTransfer: this.dataTransfer
        };
    }

    _emulateMoveEvents (currentElement, currentElementChanged) {
        var eventOptions = this._eventOptions;
        //--- 1

        if (currentElementChanged && lastHoveredElement)
            eventSimulator.mouseout(lastHoveredElement, extend({ relatedTarget: currentElement }, eventOptions));

        //--- 2

        // NOTE: the 'mousemove' event is raised before 'mouseover' in IE only (B236966)
        if (browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        //--- 3

        // --- 4

        if (currentElementChanged) {
            if (currentElement && domUtils.isElementInDocument(currentElement))
                eventSimulator.mouseover(currentElement, extend({ relatedTarget: lastHoveredElement }, eventOptions));

            lastHoveredElement = domUtils.isElementInDocument(currentElement) ? currentElement : null;
        }

        // --- 5

        if (!browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        // --- 6

        // NOTE: we need to add an extra 'mousemove' if the element was changed because sometimes
        // the client script requires several 'mousemove' events for an element (T246904)
        if (currentElementChanged && currentElement && domUtils.isElementInDocument(currentElement))
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        // --- 7


        // --- 8

    }

    _emulateDragAndDropFirstMoveEvents (currentElement, currentElementChanged) {
        this.firstMovingStepOccured = true;

        var eventOptions     = this._eventOptions;
        var dragenterElement = null;

        //--- 1

        if (currentElementChanged && lastHoveredElement)
            eventSimulator.mouseout(lastHoveredElement, extend({ relatedTarget: currentElement }, eventOptions));

        //--- 2

        // NOTE: the 'mousemove' event is raised before 'mouseover' in IE only (B236966)
        if (browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        //--- 3

        if (currentElement && domUtils.isElementInDocument(currentElement))
            dragenterElement = currentElement;

        // --- 4

        if (currentElementChanged)
            lastHoveredElement = domUtils.isElementInDocument(currentElement) ? currentElement : null;

        // --- 5

        if (!browserUtils.isIE && currentElement)
            eventSimulator[this.moveEvent](currentElement, eventOptions);

        // --- 6


        // --- 7

        var draggingAllowed = eventSimulator.dragstart(this.dragElement, eventOptions);

        if (!draggingAllowed) {
            this.dragAndDropMode = false;
            return;
        }

        // --- 8
        eventSimulator.drag(this.dragElement, eventOptions);

        if (dragenterElement)
            eventSimulator.dragenter(dragenterElement, eventOptions);

        this.dropAllowed = !eventSimulator.dragover(currentElement, eventOptions);
    }

    _emulateDragAndDropEvents (currentElement, currentElementChanged) {
        var eventOptions     = this._eventOptions;
        var dragenterElement = null;
        var dragleaveElement = null;

        //--- 1

        if (currentElementChanged && lastHoveredElement)
            dragleaveElement = lastHoveredElement;

        //--- 2


        //--- 3

        if (currentElementChanged && currentElement && domUtils.isElementInDocument(currentElement))
            dragenterElement = currentElement;

        // --- 4

        if (currentElementChanged)
            lastHoveredElement = domUtils.isElementInDocument(currentElement) ? currentElement : null;

        // --- 5

        // --- 6

        // --- 7

        // --- 8

        eventSimulator.drag(this.dragElement, eventOptions);

        if (dragenterElement)
            eventSimulator.dragenter(dragenterElement, eventOptions);

        if (dragleaveElement)
            eventSimulator.dragleave(dragleaveElement, eventOptions);

        this.dropAllowed = !eventSimulator.dragover(currentElement, eventOptions);
    }

    _emulateEvents (currentElement) {
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

        if (this.dragAndDropMode) {
            if (!this.firstMovingStepOccured)
                this._emulateDragAndDropFirstMoveEvents(currentElement, currentElementChanged);
            else
                this._emulateDragAndDropEvents(currentElement, currentElementChanged);
        }
        else
            this._emulateMoveEvents(currentElement, currentElementChanged);
    }

    _movingStep () {
        if (this.touchMode && !this.holdLeftButton) {
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
            .then(getElementUnderCursor)
            // NOTE: in touch mode, events are simulated for the element for which mousedown was simulated (GH-372)
            .then(topElement => this._emulateEvents(this.holdLeftButton &&
                                                    this.touchMode ? this.dragElement : topElement))
            .then(() => {
                this.firstMovingStepOccured = true;
                return nextTick();
            });
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

        this.movingTime = Math.max(Math.abs(this.distanceX), Math.abs(this.distanceY)) / this.cursorSpeed;

        if (this.minMovingTime)
            this.movingTime = Math.max(this.movingTime, this.minMovingTime);

        return whilst(() => !this._isMovingFinished(), () => this._movingStep());
    }

    _scroll () {
        if (this.skipScrolling)
            return Promise.resolve();

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
            modifiers: this.modifiers,
            speed:     this.speed
        };

        if (activeWindow.parent === window) {
            iframe          = domUtils.findIframeByWindow(activeWindow);
            iframeRectangle = positionUtils.getIframeClientCoordinates(iframe);

            msg.left   = iframeRectangle.left;
            msg.top    = iframeRectangle.top;
            msg.right  = iframeRectangle.right;
            msg.bottom = iframeRectangle.bottom;
        }

        return getElementUnderCursor()
            .then(topElement => {
                iframeUnderCursor = topElement === iframe;

                if (activeWindow.parent === window)
                    msg.iframeUnderCursor = iframeUnderCursor;

                return sendRequestToFrame(msg, MOVE_RESPONSE_CMD, activeWindow);
            })
            .then(message => {
                cursor.activeWindow = window;

                if (iframeUnderCursor || window.top !== window)
                    return cursor.move(message.x, message.y);

                return null;
            });
    }

    // API
    get dragAndDropState () {

    }

    run () {
        return getElementUnderCursor()
            .then(topElement => {
                this.dragElement = this.holdLeftButton ? topElement : null;

                var parentNode = this.dragElement;

                while (parentNode && !this.dragAndDropMode) {
                    if (parentNode.draggable) {
                        this.dragAndDropMode = true;
                        this.dragElement     = parentNode;
                    }
                    else
                        parentNode = parentNode.parentNode;
                }

                if (this.dragAndDropMode) {
                    this.dragDataStore = new DragDataStore();
                    this.dataTransfer  = new DataTransfer(this.dragDataStore);
                }

                return this._scroll();
            })
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

                return null;
            });
    }
}
