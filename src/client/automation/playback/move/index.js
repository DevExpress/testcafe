import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { ScrollOptions, MoveOptions } from '../../../../test-run/commands/options';
import ScrollAutomation from '../scroll';
import cursor from '../../cursor';

import { underCursor as getElementUnderCursor } from '../../get-element';
import getAutomationPoint from '../../utils/get-automation-point';
import getLineRectIntersection from '../../utils/get-line-rect-intersection';
import getDevicePoint from '../../utils/get-device-point';
import nextTick from '../../utils/next-tick';
import AutomationSettings from '../../settings';
import DragAndDropState from '../drag/drag-and-drop-state';
import createEventSequence from './event-sequence/create-event-sequence';

const Promise          = hammerhead.Promise;
const nativeMethods    = hammerhead.nativeMethods;
const featureDetection = hammerhead.utils.featureDetection;
const htmlUtils        = hammerhead.utils.html;
const urlUtils         = hammerhead.utils.url;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const messageSandbox   = hammerhead.eventSandbox.message;
const DataTransfer     = hammerhead.eventSandbox.DataTransfer;
const DragDataStore    = hammerhead.eventSandbox.DragDataStore;

const positionUtils      = testCafeCore.positionUtils;
const domUtils           = testCafeCore.domUtils;
const styleUtils         = testCafeCore.styleUtils;
const eventUtils         = testCafeCore.eventUtils;
const promiseUtils       = testCafeCore.promiseUtils;
const sendRequestToFrame = testCafeCore.sendRequestToFrame;


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

// Utils
function findDraggableElement (element) {
    let parentNode = element;

    while (parentNode) {
        if (parentNode.draggable)
            return parentNode;

        parentNode = nativeMethods.nodeParentNodeGetter.call(parentNode);
    }

    return null;
}

// Static
let lastHoveredElement = null;


export default class MoveAutomation {
    constructor (element, moveOptions) {
        this.touchMode = featureDetection.isTouchDevice;
        this.moveEvent = this.touchMode ? 'touchmove' : 'mousemove';

        this.holdLeftButton = moveOptions.holdLeftButton;
        this.dragElement    = null;

        this.dragAndDropState = new DragAndDropState();

        this.automationSettings = new AutomationSettings(moveOptions.speed);

        const target = MoveAutomation.getTarget(element, moveOptions.offsetX, moveOptions.offsetY);

        this.element     = target.element;
        this.offsetX     = target.offsetX;
        this.offsetY     = target.offsetY;
        this.speed       = moveOptions.speed;
        this.cursorSpeed = this.holdLeftButton ? this.automationSettings.draggingSpeed : this.automationSettings.cursorSpeed;

        this.minMovingTime           = moveOptions.minMovingTime || null;
        this.modifiers               = moveOptions.modifiers || {};
        this.skipScrolling           = moveOptions.skipScrolling;
        this.skipDefaultDragBehavior = moveOptions.skipDefaultDragBehavior;

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
        const relateToDocument = !positionUtils.containsOffset(el, offsetX, offsetY);
        const relatedPoint     = relateToDocument ? getAutomationPoint(el, offsetX, offsetY) : { x: offsetX, y: offsetY };

        return {
            element: relateToDocument ? document.documentElement : el,
            offsetX: relatedPoint.x,
            offsetY: relatedPoint.y
        };
    }

    static onMoveToIframeRequest (e) {
        const iframePoint = {
            x: e.message.endX,
            y: e.message.endY
        };

        const iframeWin                   = e.source;
        const iframe                      = domUtils.findIframeByWindow(iframeWin);
        const iframeBorders               = styleUtils.getBordersWidth(iframe);
        const iframePadding               = styleUtils.getElementPadding(iframe);
        const iframeRectangle             = positionUtils.getIframeClientCoordinates(iframe);
        const iframePointRelativeToParent = positionUtils.getIframePointRelativeToParentFrame(iframePoint, iframeWin);
        const cursorPosition              = cursor.position;

        const intersectionPoint = positionUtils.isInRectangle(cursorPosition, iframeRectangle) ? cursorPosition :
            getLineRectIntersection(cursorPosition, iframePointRelativeToParent, iframeRectangle);

        const intersectionRelatedToIframe = {
            x: intersectionPoint.x - iframeRectangle.left,
            y: intersectionPoint.y - iframeRectangle.top
        };

        const moveOptions = new MoveOptions({
            modifiers: e.message.modifiers,
            offsetX:   intersectionRelatedToIframe.x + iframeBorders.left + iframePadding.left,
            offsetY:   intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top,
            speed:     e.message.speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true
        }, false);

        const moveAutomation = new MoveAutomation(iframe, moveOptions);

        const responseMsg = {
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
        const parentWin = e.source;

        const iframeRectangle = {
            left:   e.message.left,
            right:  e.message.right,
            top:    e.message.top,
            bottom: e.message.bottom
        };

        if (!e.message.iframeUnderCursor) {
            const { startX, startY } = e.message;

            const clientX = startX - iframeRectangle.left;
            const clientY = startY - iframeRectangle.top;

            // NOTE: We should not emulate mouseout and mouseleave if iframe was reloaded.
            if (lastHoveredElement) {
                eventSimulator.mouseout(lastHoveredElement, { clientX, clientY, relatedTarget: null });
                eventSimulator.mouseleave(lastHoveredElement, { clientX, clientY, relatedTarget: null });
            }

            messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, parentWin);

            return;
        }

        const cursorPosition = cursor.position;

        const startPoint = {
            x: iframeRectangle.left + cursorPosition.x,
            y: iframeRectangle.top + cursorPosition.y
        };

        const endPoint          = { x: e.message.endX, y: e.message.endY };
        const intersectionPoint = getLineRectIntersection(startPoint, endPoint, iframeRectangle);

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

        const moveOptions = new MoveOptions({
            modifiers: e.message.modifiers,
            offsetX:   intersectionPoint.x - iframeRectangle.left,
            offsetY:   intersectionPoint.y - iframeRectangle.top,
            speed:     e.message.speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true
        }, false);

        const moveAutomation = new MoveAutomation(document.documentElement, moveOptions);

        moveAutomation
            .run()
            .then(() => {
                const responseMsg = {
                    cmd: MOVE_RESPONSE_CMD,
                    x:   intersectionPoint.x,
                    y:   intersectionPoint.y
                };

                cursor.activeWindow = parentWin;
                messageSandbox.sendServiceMsg(responseMsg, parentWin);
            });
    }

    _getTargetClientPoint () {
        const scroll = styleUtils.getElementScroll(this.element);

        if (domUtils.isHtmlElement(this.element)) {
            return {
                x: Math.floor(this.offsetX - scroll.left),
                y: Math.floor(this.offsetY - scroll.top)
            };
        }

        const clientPosition = positionUtils.getClientPosition(this.element);
        const isDocumentBody = this.element.tagName && domUtils.isBodyElement(this.element);

        return {
            x: Math.floor(isDocumentBody ? clientPosition.x + this.offsetX : clientPosition.x + this.offsetX -
                                                                             scroll.left),
            y: Math.floor(isDocumentBody ? clientPosition.y + this.offsetY : clientPosition.y + this.offsetY -
                                                                             scroll.top)
        };
    }

    _emulateEvents (currentElement) {
        const button      = this.holdLeftButton ? eventUtils.BUTTONS_PARAMETER.leftButton : eventUtils.BUTTONS_PARAMETER.noButton;
        const devicePoint = getDevicePoint({ x: this.x, y: this.y });

        const eventOptions = {
            clientX:      this.x,
            clientY:      this.y,
            screenX:      devicePoint.x,
            screenY:      devicePoint.y,
            buttons:      button,
            ctrl:         this.modifiers.ctrl,
            alt:          this.modifiers.alt,
            shift:        this.modifiers.shift,
            meta:         this.modifiers.meta,
            dataTransfer: this.dragAndDropState.dataTransfer
        };

        const eventSequenceOptions = { moveEvent: this.moveEvent, holdLeftButton: this.holdLeftButton };
        const eventSequence        = createEventSequence(this.dragAndDropState.enabled, this.firstMovingStepOccured, eventSequenceOptions);

        const { dragAndDropMode, dropAllowed } = eventSequence.run(
            currentElement,
            lastHoveredElement,
            eventOptions,
            this.dragElement,
            this.dragAndDropState.dataStore
        );

        this.firstMovingStepOccured       = true;
        this.dragAndDropState.enabled     = dragAndDropMode;
        this.dragAndDropState.dropAllowed = dropAllowed;

        lastHoveredElement = currentElement;
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
            const currentTime = Math.min(nativeMethods.dateNow(), this.endTime);
            const progress    = (currentTime - this.startTime) / (this.endTime - this.startTime);

            this.x = Math.floor(this.startPoint.x + this.distanceX * progress);
            this.y = Math.floor(this.startPoint.y + this.distanceY * progress);
        }

        return cursor
            .move(this.x, this.y)
            .then(getElementUnderCursor)
            // NOTE: in touch mode, events are simulated for the element for which mousedown was simulated (GH-372)
            .then(topElement => {
                const currentElement = this.holdLeftButton && this.touchMode ? this.dragElement : topElement;

                // NOTE: it can be null in IE
                if (!currentElement)
                    return null;

                return this._emulateEvents(currentElement);
            })
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

        this.movingTime = Math.max(Math.abs(this.distanceX), Math.abs(this.distanceY)) / this.cursorSpeed;

        if (this.minMovingTime)
            this.movingTime = Math.max(this.movingTime, this.minMovingTime);

        return promiseUtils.whilst(() => !this._isMovingFinished(), () => this._movingStep());
    }

    _scroll () {
        if (this.skipScrolling)
            return Promise.resolve();

        const scrollOptions    = new ScrollOptions({ offsetX: this.offsetX, offsetY: this.offsetY }, false);
        const scrollAutomation = new ScrollAutomation(this.element, scrollOptions);

        return scrollAutomation.run();
    }

    _moveToCurrentFrame () {
        if (cursor.active)
            return Promise.resolve();

        const { x, y }          = cursor.position;
        const activeWindow      = cursor.activeWindow;
        let iframe            = null;
        let iframeUnderCursor = null;
        let iframeRectangle   = null;

        const msg = {
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

    run () {
        return getElementUnderCursor()
            .then(topElement => {
                this.dragElement = this.holdLeftButton ? topElement : null;

                const draggable = findDraggableElement(this.dragElement);

                // NOTE: we should skip simulating drag&drop's native behavior if the mousedown event was prevented (GH - 2529)
                if (draggable && featureDetection.hasDataTransfer && !this.skipDefaultDragBehavior) {
                    this.dragAndDropState.enabled      = true;
                    this.dragElement                   = draggable;
                    this.dragAndDropState.element      = this.dragElement;
                    this.dragAndDropState.dataStore    = new DragDataStore();
                    this.dragAndDropState.dataTransfer = new DataTransfer(this.dragAndDropState.dataStore);

                    const isLink = domUtils.isAnchorElement(this.dragElement);

                    if (isLink || domUtils.isImgElement(this.dragElement)) {
                        const srcAttr   = isLink ? 'href' : 'src';
                        const parsedUrl = urlUtils.parseProxyUrl(this.dragElement[srcAttr]);
                        const src       = parsedUrl ? parsedUrl.destUrl : this.dragElement[srcAttr];
                        const outerHTML = htmlUtils.cleanUpHtml(nativeMethods.elementOuterHTMLGetter.call(this.dragElement));

                        this.dragAndDropState.dataTransfer.setData('text/plain', src);
                        this.dragAndDropState.dataTransfer.setData('text/uri-list', src);
                        this.dragAndDropState.dataTransfer.setData('text/html', outerHTML);
                    }
                }

                return this._scroll();
            })
            .then(() => {
                const { x, y }     = this._getTargetClientPoint();
                const windowWidth  = styleUtils.getWidth(window);
                const windowHeight = styleUtils.getHeight(window);

                if (x >= 0 && x <= windowWidth && y >= 0 && y <= windowHeight) {
                    this.endPoint = { x, y };

                    return this
                        ._moveToCurrentFrame()
                        .then(() => this._move());
                }

                return null;
            })
            .then(() => this.dragAndDropState);
    }
}
