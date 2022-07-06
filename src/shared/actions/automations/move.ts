import { adapter } from '../../adapter';

import nextTick from '../../utils/next-tick';
import AutomationSettings from './settings';
import {
    Modifiers,
    MoveOptions,
    ScrollOptions,
} from '../../../test-run/commands/options';
import lastHoveredElementHolder from './last-hovered-element-holder';
// @ts-ignore
import { nativeMethods } from '../../../client/driver/deps/hammerhead';

const MOVE_REQUEST_CMD  = 'automation|move|request';
const MOVE_RESPONSE_CMD = 'automation|move|response';

import getAutomationPoint from '../utils/get-automation-point';
import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';
import { SharedWindow } from '../../types';
import Cursor from '../cursor';
import { whilst } from '../../utils/promise';
import getDevicePoint from '../utils/get-device-point';

interface MoveAutomationTarget<E> {
    element: E;
    offset: AxisValuesData<number>;
}

export default class MoveAutomation<E, W extends SharedWindow> {
    private touchMode: boolean;
    private moveEvent: string;

    private automationSettings: AutomationSettings;

    private element: E;
    private window: W;
    private offset: AxisValuesData<number>;
    private cursor: Cursor<W>;
    private speed: number;
    private cursorSpeed: number;

    private minMovingTime: number;
    private modifiers: Modifiers;
    private skipScrolling: boolean;
    private skipDefaultDragBehavior: boolean;
    private firstMovingStepOccured: boolean;

    protected constructor (el: E, offset: AxisValuesData<number>, moveOptions: MoveOptions, win: W, cursor: Cursor<W>) {
        this.touchMode = adapter.featureDetection.isTouchDevice;
        this.moveEvent = this.touchMode ? 'touchmove' : 'mousemove';

        this.automationSettings = new AutomationSettings(moveOptions.speed);

        this.cursorSpeed = this._getCursorSpeed();

        this.element = el;
        this.window  = win;
        this.offset  = offset;
        this.cursor  = cursor;

        this.minMovingTime           = moveOptions.minMovingTime || 0;
        this.modifiers               = moveOptions.modifiers || {};
        this.skipScrolling           = moveOptions.skipScrolling;
        this.skipDefaultDragBehavior = moveOptions.skipDefaultDragBehavior;
        this.speed                   = moveOptions.speed;

        this.firstMovingStepOccured  = false;
    }

    public static async create<E, W extends SharedWindow> (el: E, moveOptions: MoveOptions, win: W, cursor: Cursor<W>): Promise<MoveAutomation<E, W>> {
        const { element, offset } = await MoveAutomation.getTarget(el, win, new AxisValues(moveOptions.offsetX, moveOptions.offsetY));

        return new MoveAutomation(element, offset, moveOptions, win, cursor);
    }

    private static getTarget<E, W> (element: E, window: W, offset: AxisValuesData<number>): Promise<MoveAutomationTarget<E>> {
        // NOTE: if the target point (considering offsets) is out of
        // the element change the target element to the document element
        return adapter.PromiseCtor.resolve(adapter.position.containsOffset(element, offset.x, offset.y))
            .then(containsOffset => {
                if (!containsOffset) {
                    return Promise.all([
                        getAutomationPoint(element, offset),
                        adapter.dom.getDocumentElement(window),
                    ])
                        .then(([point, docEl]) => ({ element: docEl, offset: point }));
                }

                return { element, offset };
            });
    }

    private _getCursorSpeed (): number {
        return this.automationSettings.cursorSpeed;
    }

    private _getTargetClientPoint (): Promise<AxisValues<number>> {
        return adapter.PromiseCtor.resolve(adapter.style.getElementScroll(this.element))
            .then(scroll => {
                if (adapter.dom.isHtmlElement(this.element)) {
                    return AxisValues.create(this.offset)
                        .sub(AxisValues.create(scroll))
                        .round(Math.round);
                }

                return adapter.PromiseCtor.resolve(adapter.position.getClientPosition(this.element))
                    .then(clientPosition => {
                        const isDocumentBody = adapter.dom.isBodyElement(this.element);
                        const clientPoint    = AxisValues.create(clientPosition).add(this.offset);

                        if (!isDocumentBody)
                            clientPoint.sub(AxisValues.create(scroll));

                        return clientPoint.round(Math.floor);
                    });
            });
    }

    private _getEventSequenceOptions (currPosition: AxisValues<number>): Promise<any> {
        const button = adapter.event.BUTTONS_PARAMETER.noButton;

        return getDevicePoint(currPosition)
            .then(devicePoint => {
                const eventOptions = {
                    clientX: currPosition.x,
                    clientY: currPosition.y,
                    screenX: devicePoint?.x,
                    screenY: devicePoint?.y,
                    buttons: button,
                    ctrl:    this.modifiers.ctrl,
                    alt:     this.modifiers.alt,
                    shift:   this.modifiers.shift,
                    meta:    this.modifiers.meta,
                };

                return { eventOptions, eventSequenceOptions: { moveEvent: this.moveEvent } };
            });
    }

    private async _runEventSequence (currentElement: Element, { eventOptions, eventSequenceOptions }: any): Promise<any> {
        const eventSequence = await adapter.createEventSequence(false, this.firstMovingStepOccured, eventSequenceOptions);

        return eventSequence.run(
            currentElement,
            lastHoveredElementHolder.get(),
            eventOptions,
            null,
            null
        );
    }

    private _emulateEvents (currentElement: Element, currPosition: AxisValues<number>): Promise<void> {
        return this._getEventSequenceOptions(currPosition)
            .then(options => {
                return this._runEventSequence(currentElement, options);
            })
            .then(() => {
                this.firstMovingStepOccured = true;

                lastHoveredElementHolder.set(currentElement);
            });
    }

    private _movingStep (currPosition: AxisValues<number>): Promise<void> {
        return this.cursor.move(currPosition)
            .then(() => adapter.getElementExceptUI(this.cursor.getPosition()))
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

    private _getCorrectedTopElement (topElement: Element): Element {
        return topElement;
    }

    private _move (endPoint: AxisValues<number>): Promise<void> {
        const startPoint = this.cursor.getPosition();
        const distance   = AxisValues.create(endPoint).sub(startPoint);
        const startTime  = nativeMethods.dateNow();
        const movingTime = Math.max(Math.max(Math.abs(distance.x), Math.abs(distance.y)) / this.cursorSpeed, this.minMovingTime);
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
    //
    private _needMoveCursorImmediately (): boolean {
        return this.touchMode;
    }

    private _scroll (): Promise<boolean> {
        if (this.skipScrolling)
            return adapter.PromiseCtor.resolve(false);

        const scrollOptions = new ScrollOptions({ offsetX: this.offset.x, offsetY: this.offset.y }, false);

        return adapter.scroll(this.element, scrollOptions);
    }

    private _moveToCurrentFrame (endPoint: AxisValues<number>): Promise<void> {
        if (this.cursor.isActive(this.window))
            return adapter.PromiseCtor.resolve();

        const { x, y }        = this.cursor.getPosition();
        const activeWindow    = this.cursor.getActiveWindow(this.window);
        let iframe: any       = null;
        let iframeUnderCursor: boolean | null = null;

        const msg: any = {
            cmd:       MOVE_REQUEST_CMD,
            startX:    x,
            startY:    y,
            endX:      endPoint.x,
            endY:      endPoint.y,
            modifiers: this.modifiers,
            speed:     this.speed,
        };

        return adapter.PromiseCtor.resolve()
            .then(() => {
                if (activeWindow.parent === this.window) {
                    return adapter.PromiseCtor.resolve(adapter.dom.findIframeByWindow(activeWindow))
                        .then(frame => {
                            iframe = frame;

                            return adapter.PromiseCtor.resolve(adapter.position.getIframeClientCoordinates(frame))
                                .then(rect => {
                                    msg.left   = rect.left;
                                    msg.top    = rect.top;
                                    msg.right  = rect.right;
                                    msg.bottom = rect.bottom;
                                });
                        });
                }

                return void 0;
            })
            .then(() => {
                return adapter.getElementExceptUI(this.cursor.getPosition());
            })
            .then(topElement => {
                iframeUnderCursor = topElement === iframe;

                if (activeWindow.parent === this.window)
                    msg.iframeUnderCursor = iframeUnderCursor;

                return adapter.sendRequestToFrame(msg, MOVE_RESPONSE_CMD, activeWindow);
            })
            .then(message => {
                this.cursor.setActiveWindow(this.window);

                if (iframeUnderCursor || adapter.dom.isIframeWindow(this.window))
                    return this.cursor.move(message);

                return void 0;
            });
    }

    public run (): Promise<void> {
        return this._scroll()
            .then(() => Promise.all([
                this._getTargetClientPoint(),
                adapter.style.getWindowDimensions(this.window),
            ]))
            .then(([endPoint, boundary]) => {
                if (!boundary.contains(endPoint))
                    return void 0;

                return this._moveToCurrentFrame(endPoint)
                    .then(() => this._move(endPoint));
            });
    }
}
