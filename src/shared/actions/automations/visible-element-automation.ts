import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import getDevicePoint from '../utils/get-device-point';
import { getOffsetOptions } from '../utils/offsets';
import getElementFromPoint from '../../../shared/actions/get-element';
import AUTOMATION_ERROR_TYPES from '../../../shared/errors/automation-errors';
import AutomationSettings from '../../../shared/actions/automations/settings';
import MoveAutomation from './move';
import { SharedWindow } from '../../types';
import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';
import Cursor from '../cursor';
import delay from '../../utils/delay';
import SharedEventEmitter from '../../../shared/utils/event-emitter';

import {
    MoveOptions,
    ScrollOptions,
    OffsetOptions,
} from '../../../test-run/commands/options';

// @ts-ignore
import { utils } from '../../../client/core/deps/hammerhead';
import * as domUtils from '../../../client/core/utils/dom';
import * as positionUtils from '../../../client/core/utils/position';
import ScrollAutomation from '../../../client/core/scroll';
import { Dictionary } from '../../../configuration/interfaces';
import ensureMouseEventAfterScroll from '../../../client/automation/utils/ensure-mouse-event-after-scroll';


interface ElementStateArgsBase<E> {
    element: E | null;
    clientPoint: AxisValues<number> | null;
    screenPoint: AxisValues<number> | null;
    devicePoint?: AxisValues<number> | null;
}

interface ElementStateArgs<E> extends ElementStateArgsBase<E> {
    isTarget: boolean;
    inMoving: boolean;
}

class ElementState<E> implements ElementStateArgs<E> {
    public element: E | null;
    public clientPoint: AxisValues<number> | null;
    public screenPoint: AxisValues<number> | null;
    public devicePoint: AxisValues<number> | null;
    public isTarget: boolean;
    public inMoving: boolean;

    protected constructor ({ element = null, clientPoint = null, screenPoint = null, isTarget = false, inMoving = false, devicePoint = null }: ElementStateArgs<E>) {
        this.element     = element;
        this.clientPoint = clientPoint;
        this.screenPoint = screenPoint;
        this.devicePoint = devicePoint;
        this.isTarget    = isTarget;
        this.inMoving    = inMoving;
    }

    public static async create<E> ({ element, clientPoint, screenPoint, isTarget, inMoving }: ElementStateArgs<E>): Promise<ElementState<E>> {
        let devicePoint = null;

        if (clientPoint)
            devicePoint = await getDevicePoint(clientPoint);

        const state = new ElementState<E>({ element, clientPoint, screenPoint, isTarget, inMoving, devicePoint });

        return state;
    }
}

export interface MouseEventArgs<E> {
    point: AxisValuesData<number> | null;
    screenPoint: AxisValuesData<number> | null;
    element: E | null;
    options: {
        clientX: number;
        clientY: number;
        screenX: number;
        screenY: number;
        ctrl: boolean;
        alt: boolean;
        shift: boolean;
        meta: boolean;
        timeStamp: unknown;
    } | null;
}

export default class VisibleElementAutomation<E, Window extends SharedWindow> extends SharedEventEmitter {
    protected element: Element;
    public window: Window;
    public cursor: Cursor<Window>
    private readonly TARGET_ELEMENT_FOUND_EVENT: string;
    protected automationSettings: AutomationSettings;
    private readonly options: OffsetOptions;

    protected constructor (element: Element, offsetOptions: OffsetOptions, win: Window, cursor: Cursor<Window>) {
        super();

        this.TARGET_ELEMENT_FOUND_EVENT = 'automation|target-element-found-event';

        this.element            = element;
        this.options            = offsetOptions;
        this.automationSettings = new AutomationSettings(offsetOptions.speed || 1);

        this.window  = win;
        this.cursor  = cursor;

        // NOTE: only for legacy API
        this._ensureWindowAndCursorForLegacyTests(this);
    }

    private _ensureWindowAndCursorForLegacyTests (automation: VisibleElementAutomation<E, Window>): void {
        automation.window = automation.window || window; // eslint-disable-line no-undef
        automation.cursor = this.cursor;
    }

    protected async _getElementForEvent (eventArgs: MouseEventArgs<Element>): Promise<Element | null> {
        const expectedElement = await positionUtils.containsOffset(this.element, this.options.offsetX, this.options.offsetY) ? this.element : null;

        return getElementFromPoint(eventArgs.point as AxisValuesData<number>, this.window, expectedElement);
    }

    private async _moveToElement (): Promise<void> {
        const moveOptions    = new MoveOptions(utils.extend({ skipScrolling: true }, this.options), false);
        const moveAutomation = await MoveAutomation.create(this.element, moveOptions, this.window, this.cursor);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    private _scrollToElement (): Promise<boolean> {
        let wasScrolled        = false;
        const scrollOptions    = new ScrollOptions(this.options, false);
        const scrollAutomation = new ScrollAutomation(this.element, scrollOptions);

        return scrollAutomation.run()
            .then((scrollWasPerformed: boolean | Dictionary<any>) => {
                wasScrolled = !!scrollWasPerformed;

                return delay(this.automationSettings.mouseActionStepDelay);
            })
            .then(() => getElementFromPoint(this.cursor.getPosition(), this.window))
            .then((currentElement: Element) => {
                return ensureMouseEventAfterScroll(currentElement, this.element, wasScrolled);
            })
            .then(() => {
                return wasScrolled;
            });
    }

    private async _getElementOffset (): Promise<{ offsetX: number; offsetY: number }> {
        const defaultOffsets = await getOffsetOptions(this.element);

        let { offsetX, offsetY } = this.options;

        offsetX = offsetX || offsetX === 0 ? offsetX : defaultOffsets.offsetX;
        offsetY = offsetY || offsetY === 0 ? offsetY : defaultOffsets.offsetY;

        return { offsetX, offsetY };
    }

    private async _wrapAction (action: () => Promise<unknown>): Promise<ElementState<Element>> {
        const { offsetX: x, offsetY: y } = await this._getElementOffset();
        const screenPointBeforeAction    = await getAutomationPoint(this.element, { x, y });
        const clientPositionBeforeAction = await positionUtils.getClientPosition(this.element);

        await action();

        const screenPointAfterAction    = await getAutomationPoint(this.element, { x, y });
        const clientPositionAfterAction = await positionUtils.getClientPosition(this.element);
        const clientPoint               = await screenPointToClient(this.element, screenPointAfterAction);
        const expectedElement           = await positionUtils.containsOffset(this.element, x, y) ? this.element : null;

        const element = await getElementFromPoint(clientPoint, this.window, expectedElement);

        if (!element) {
            return ElementState.create<Element>({
                element:     null,
                clientPoint: null,
                screenPoint: null,
                isTarget:    false,
                inMoving:    false,
            });
        }

        let isTarget = !expectedElement || element === expectedElement || element === this.element;

        if (!isTarget) {
            // NOTE: perform an operation with searching in dom only if necessary
            isTarget = await this._contains(this.element, element);
        }

        const offsetPositionChanged = screenPointBeforeAction.x !== screenPointAfterAction.x ||
                                    screenPointBeforeAction.y !== screenPointAfterAction.y;
        const clientPositionChanged = clientPositionBeforeAction.x !== clientPositionAfterAction.x ||
                                    clientPositionBeforeAction.y !== clientPositionAfterAction.y;

        // NOTE: We consider the element moved if its offset position and client position
        // are changed both. If only client position was changed it means the page was
        // scrolled and the element keeps its position on the page. If only offset position was
        // changed it means the element is fixed on the page (it can be implemented via script).
        const targetElementIsMoving = offsetPositionChanged && clientPositionChanged;

        return ElementState.create({
            element,
            clientPoint,
            screenPoint: screenPointAfterAction,
            isTarget,
            inMoving:    targetElementIsMoving,
        });
    }

    private static _checkElementState<E> (state: ElementState<E>, useStrictElementCheck: boolean): ElementState<E> {
        if (!state.element)
            throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

        if (useStrictElementCheck && (!state.isTarget || state.inMoving))
            throw new Error(AUTOMATION_ERROR_TYPES.foundElementIsNotTarget);

        return state;
    }

    protected _ensureElement (useStrictElementCheck: boolean, skipCheckAfterMoving = false, skipMoving = false): Promise<ElementStateArgsBase<Element>> {
        return this
            ._wrapAction(() => this._scrollToElement())
            .then(state => VisibleElementAutomation._checkElementState(state, useStrictElementCheck))
            .then(state => {
                return skipMoving ? state : this._wrapAction(() => this._moveToElement());
            })
            .then(state => {
                if (!skipCheckAfterMoving)
                    VisibleElementAutomation._checkElementState(state, useStrictElementCheck);

                return state;
            })
            .then(state => {
                this.emit(this.TARGET_ELEMENT_FOUND_EVENT, { element: state?.element || null });

                return {
                    element:     state?.element || null,
                    clientPoint: state?.clientPoint || null,
                    screenPoint: state?.screenPoint || null,
                    devicePoint: state?.devicePoint || null,
                };
            });
    }

    private async _contains (parent: Element, child: Element): Promise<boolean> {
        const parents = await domUtils.getParents(child);

        for (const el of parents) {
            if (el === parent)
                return true;
        }

        return false;
    }
}
