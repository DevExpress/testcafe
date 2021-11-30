//import hammerhead from '../../deps/hammerhead';
//import testCafeCore from '../../deps/testcafe-core';
import { ScrollOptions, MoveOptions, Modifiers } from '../../../test-run/commands/options';
import cursor from '../cursor';
import AxisValues from '../../utils/values/axis-values';
import { whilst } from '../../utils/promise';


// TODO:
import { underCursor as getElementUnderCursor } from '../../get-element';
import getAutomationPoint from '../../utils/get-automation-point';
import getLineRectIntersection from '../../utils/get-line-rect-intersection';
import getDevicePoint from '../../utils/get-device-point';
import nextTick from '../../utils/next-tick';
import AutomationSettings from '../../settings';
import createEventSequence from './event-sequence/create-event-sequence';
import lastHoveredElementHolder from '../last-hovered-element-holder';
import isIframeWindow from '../../../../utils/is-window-in-iframe';

const Promise          = hammerhead.Promise;
const nativeMethods    = hammerhead.nativeMethods;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const messageSandbox   = hammerhead.eventSandbox.message;

const ScrollAutomation   = testCafeCore.ScrollAutomation;
const positionUtils      = testCafeCore.positionUtils;
const domUtils           = testCafeCore.domUtils;
const styleUtils         = testCafeCore.styleUtils;
const eventUtils         = testCafeCore.eventUtils;
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

export default class MoveAutomation<E> {
    protected readonly _touchMode: boolean;
    protected readonly _automationSettings: AutomationSettings;
    private readonly _moveEvent: string;
    private readonly _element: E;
    private readonly _offset: AxisValues<number>;
    private readonly _speed: number;
    private readonly _cursorSpeed: number;
    private readonly _minMovingTime: number;
    private readonly _modifiers: Partial<Modifiers>;
    private readonly _skipScrolling: boolean;
    private readonly _skipDefaultDragBehavior: boolean;
    private _firstMovingStepOccurred: boolean;

    constructor (element: E, moveOptions: MoveOptions) {
        this._touchMode = featureDetection.isTouchDevice;
        this._moveEvent = this._touchMode ? 'touchmove' : 'mousemove';

        this._automationSettings = new AutomationSettings(moveOptions.speed);

        const target = MoveAutomation.getTarget(element, moveOptions.offsetX, moveOptions.offsetY);

        this._element     = target.element;
        this._offset      = new AxisValues(target.offsetX, target.offsetY)
        this._speed       = moveOptions.speed;
        this._cursorSpeed = this._getCursorSpeed();

        this._minMovingTime            = moveOptions.minMovingTime || 0;
        this._modifiers                = moveOptions.modifiers || {};
        this._skipScrolling            = moveOptions.skipScrolling;
        this._skipDefaultDragBehavior  = moveOptions.skipDefaultDragBehavior;
        this._firstMovingStepOccurred  = false;
    }

    static getTarget (el, offsetX: number, offsetY: number) {
        // NOTE: if the target point (considering offsets) is out of
        // the element change the target element to the document element
        const relateToDocument = !positionUtils.containsOffset(el, offsetX, offsetY);
        const relatedPoint     = relateToDocument ? getAutomationPoint(el, offsetX, offsetY) : { x: offsetX, y: offsetY };

        return {
            element: relateToDocument ? document.documentElement : el,
            offsetX: relatedPoint.x,
            offsetY: relatedPoint.y,
        };
    }

    static onMoveToIframeRequest (e) {
        const iframePoint                 = new AxisValues(e.message.endX, e.message.endY);
        const iframeWin                   = e.source;
        const iframe                      = domUtils.findIframeByWindow(iframeWin);
        const iframeBorders               = styleUtils.getBordersWidth(iframe);
        const iframePadding               = styleUtils.getElementPadding(iframe);
        const iframeRectangle             = positionUtils.getIframeClientCoordinates(iframe);
        const iframePointRelativeToParent = positionUtils.getIframePointRelativeToParentFrame(iframePoint, iframeWin);
        const cursorPosition              = cursor.getPosition();

        const intersectionPoint = positionUtils.isInRectangle(cursorPosition, iframeRectangle) ? cursorPosition :
            getLineRectIntersection(cursorPosition, iframePointRelativeToParent, iframeRectangle);

        const intersectionRelatedToIframe = {
            x: intersectionPoint.x - iframeRectangle.left,
            y: intersectionPoint.y - iframeRectangle.top,
        };

        const moveOptions = new MoveOptions({
            modifiers: e.message._modifiers,
            offsetX:   intersectionRelatedToIframe.x + iframeBorders.left + iframePadding.left,
            offsetY:   intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top,
            speed:     e.message._speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true,
        }, false);

        const moveAutomation = new MoveAutomation(iframe, moveOptions);

        const responseMsg = {
            cmd: MOVE_RESPONSE_CMD,
            x:   intersectionRelatedToIframe.x,
            y:   intersectionRelatedToIframe.y,
        };

        if (cursor.getActiveWindow(window) !== iframeWin) {
            moveAutomation.run()
                .then(() => {
                    cursor.setActiveWindow(iframeWin);

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
            bottom: e.message.bottom,
        };

        if (!e.message.iframeUnderCursor) {
            const { startX, startY } = e.message;

            const clientX = startX - iframeRectangle.left;
            const clientY = startY - iframeRectangle.top;

            // NOTE: We should not emulate mouseout and mouseleave if iframe was reloaded.
            const element = lastHoveredElementHolder.get();

            if (element) {
                eventSimulator.mouseout(element, { clientX, clientY, relatedTarget: null });
                eventSimulator.mouseleave(element, { clientX, clientY, relatedTarget: null });
            }

            messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, parentWin);

            return;
        }

        const cursorPosition    = cursor.getPosition();
        const startPoint        = AxisValues.create(iframeRectangle).add(cursorPosition);
        const endPoint          = new AxisValues(e.message.endX, e.message.endY);
        const intersectionPoint = getLineRectIntersection(startPoint, endPoint, iframeRectangle);

        // NOTE: We should not move the cursor out of the iframe if
        // the cursor path does not intersect with the iframe borders.
        if (!intersectionPoint) {
            messageSandbox.sendServiceMsg({
                cmd: MOVE_RESPONSE_CMD,
                x:   iframeRectangle.left,
                y:   iframeRectangle.top,
            }, parentWin);

            return;
        }

        const moveOptions = new MoveOptions({
            modifiers: e.message._modifiers,
            offsetX:   intersectionPoint.x - iframeRectangle.left,
            offsetY:   intersectionPoint.y - iframeRectangle.top,
            speed:     e.message._speed,

            // NOTE: we should not perform scrolling because the active window was
            // already scrolled to the target element before the request (GH-847)
            skipScrolling: true,
        }, false);

        const moveAutomation = new MoveAutomation(document.documentElement, moveOptions);

        moveAutomation.run()
            .then(() => {
                const responseMsg = {
                    cmd: MOVE_RESPONSE_CMD,
                    x:   intersectionPoint.x,
                    y:   intersectionPoint.y,
                };

                cursor.setActiveWindow(parentWin);
                messageSandbox.sendServiceMsg(responseMsg, parentWin);
            });
    }

    protected _getCursorSpeed (): number {
        return this._automationSettings.cursorSpeed;
    }

    private _getTargetClientPoint (): AxisValues<number> {
        const scroll = styleUtils.getElementScroll(this._element);

        if (domUtils.isHtmlElement(this._element))
            return AxisValues.create(this._offset).sub(AxisValues.create(scroll));

        const clientPosition = positionUtils.getClientPosition(this._element);
        const isDocumentBody = this._element.tagName && domUtils.isBodyElement(this._element);

        const clientPoint = AxisValues.create(clientPosition).add(this._offset);

        if (!isDocumentBody)
            clientPoint.sub(AxisValues.create(scroll));

        return clientPoint.round(Math.floor);
    }

    protected _getEventSequenceOptions (currPosition: AxisValues<number>) {
        const button      = eventUtils.BUTTONS_PARAMETER.noButton;
        const devicePoint = getDevicePoint(currPosition);

        const eventOptions = {
            clientX: currPosition.x,
            clientY: currPosition.y,
            screenX: devicePoint.x,
            screenY: devicePoint.y,
            buttons: button,
            ctrl:    this._modifiers.ctrl,
            alt:     this._modifiers.alt,
            shift:   this._modifiers.shift,
            meta:    this._modifiers.meta,
        };

        return { eventOptions, eventSequenceOptions: { moveEvent: this._moveEvent } };
    }

    protected _runEventSequence (currentElement, { eventOptions, eventSequenceOptions }) {
        const eventSequence = createEventSequence(false, this._firstMovingStepOccurred, eventSequenceOptions);

        eventSequence.run(
            currentElement,
            lastHoveredElementHolder.get(),
            eventOptions,
            null,
            null
        );
    }

    private _emulateEvents (currentElement: E, currPosition: AxisValues<number>) {
        this._runEventSequence(currentElement, this._getEventSequenceOptions(currPosition));

        this._firstMovingStepOccurred = true;

        lastHoveredElementHolder.set(currentElement);
    }

    private _movingStep (currPosition: AxisValues<number>): Promise<void> {
        return cursor
            .move(currPosition)
            .then(getElementUnderCursor)
            // NOTE: in touch mode, events are simulated for the element for which mousedown was simulated (GH-372)
            .then(topElement => {
                const currentElement = this._getCorrectedTopElement(topElement);

                // NOTE: it can be null in IE
                if (!currentElement)
                    return null;

                return this._emulateEvents(currentElement, currPosition);
            })
            .then(nextTick);
    }

    protected _getCorrectedTopElement (topElement: E): E {
        return topElement;
    }

    private _move (endPoint: AxisValues<number>): Promise<void> {
        const startPoint = cursor.getPosition();
        const distance   = AxisValues.create(endPoint).sub(startPoint);
        const startTime  = nativeMethods.dateNow();
        const movingTime = Math.max(Math.max(Math.abs(distance.x), Math.abs(distance.y)) / this._cursorSpeed, this._minMovingTime);
        let currPosition = AxisValues.create(startPoint);
        let isFirstStep  = true;

        return whilst(() => !currPosition.eql(endPoint), () => {
            if (this._needMoveCursorImmediately())
                currPosition = AxisValues.create(endPoint);

            else if (isFirstStep) {
                isFirstStep = false;

                // NOTE: the mousemove event can't be simulated at the point where the cursor
                // was located at the start. Therefore, we add a minimal distance 1 px.
                currPosition.add({
                    x: distance.x > 0 ? 1 : -1,
                    y: distance.y > 0 ? 1 : -1,
                });
            }
            else {
                const progress = Math.min((nativeMethods.dateNow() - startTime) / movingTime, 1);

                currPosition = AxisValues.create(distance).mul(progress).add(startPoint).round(Math.floor);
            }

            return this._movingStep(currPosition);
        });
    }

    protected _needMoveCursorImmediately (): boolean {
        return this._touchMode;
    }

    private _scroll (): Promise<void> {
        if (this._skipScrolling)
            return Promise.resolve();

        const scrollOptions    = new ScrollOptions({ offsetX: this._offset.x, offsetY: this._offset.y }, false);
        const scrollAutomation = new ScrollAutomation(this._element, scrollOptions);

        return scrollAutomation.run();
    }

    private _moveToCurrentFrame (endPoint: AxisValues<number>): Promise<void> {
        if (cursor.isActive(window))
            return Promise.resolve();

        const { x, y }        = cursor.getPosition();
        const activeWindow    = cursor.getActiveWindow(window);
        let iframe            = null;
        let iframeUnderCursor = null;

        const msg = {
            cmd:       MOVE_REQUEST_CMD,
            startX:    x,
            startY:    y,
            endX:      endPoint.x,
            endY:      endPoint.y,
            modifiers: this._modifiers,
            speed:     this._speed,
        };

        if (activeWindow.parent === window) {
            iframe     = domUtils.findIframeByWindow(activeWindow);
            const rect = positionUtils.getIframeClientCoordinates(iframe);

            msg.left   = rect.left;
            msg.top    = rect.top;
            msg.right  = rect.right;
            msg.bottom = rect.bottom;
        }

        return getElementUnderCursor()
            .then(topElement => {
                iframeUnderCursor = topElement === iframe;

                if (activeWindow.parent === window)
                    msg.iframeUnderCursor = iframeUnderCursor;

                return sendRequestToFrame(msg, MOVE_RESPONSE_CMD, activeWindow);
            })
            .then(message => {
                cursor.setActiveWindow(window);

                if (iframeUnderCursor || isIframeWindow(window))
                    return cursor.move(message);

                return null;
            });
    }

    public run () {
        return this._scroll()
            .then(() => {
                const endPoint     = this._getTargetClientPoint();
                const windowWidth  = styleUtils.getWidth(window);
                const windowHeight = styleUtils.getHeight(window);

                if (endPoint.x >= 0 && endPoint.x <= windowWidth && endPoint.y >= 0 && endPoint.y <= windowHeight) {
                    return this._moveToCurrentFrame(endPoint)
                        .then(() => this._move(endPoint));
                }

                return null;
            });
    }
}
