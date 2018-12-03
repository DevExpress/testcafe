import hammerhead from '../deps/hammerhead';
import { delay, positionUtils, domUtils, arrayUtils, serviceUtils } from '../deps/testcafe-core';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import getDevicePoint from '../utils/get-device-point';
import { getOffsetOptions } from '../utils/offsets';
import { fromPoint as getElementFromPoint } from '../get-element';
import AUTOMATION_ERROR_TYPES from '../errors';
import AutomationSettings from '../settings';
import ScrollAutomation from './scroll';
import MoveAutomation from './move';
import { MoveOptions, ScrollOptions } from '../../../test-run/commands/options';

const extend = hammerhead.utils.extend;

class ElementState {
    constructor ({ element = null, clientPoint = null, screenPoint = null, isTarget = false, inMoving = false }) {
        this.element     = element;
        this.clientPoint = clientPoint;
        this.screenPoint = screenPoint;
        this.isTarget    = isTarget;
        this.inMoving    = inMoving;
        this.devicePoint = getDevicePoint(clientPoint);
    }
}

export default class VisibleElementAutomation extends serviceUtils.EventEmitter {
    constructor (element, offsetOptions) {
        super();

        this.TARGET_ELEMENT_FOUND_EVENT = 'automation|target-element-found-event';

        this.element            = element;
        this.options            = offsetOptions;
        this.automationSettings = new AutomationSettings(offsetOptions.speed);
    }

    _getElementForEvent (eventArgs) {
        const { x, y }        = eventArgs.point;
        const expectedElement = positionUtils.containsOffset(this.element, this.options.offsetX, this.options.offsetY) ? this.element : null;

        return getElementFromPoint(x, y, expectedElement).then(({ element }) => element);
    }

    _moveToElement () {
        const moveOptions    = new MoveOptions(extend({ skipScrolling: true }, this.options), false);
        const moveAutomation = new MoveAutomation(this.element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _scrollToElement () {
        const scrollAutomation = new ScrollAutomation(this.element, new ScrollOptions(this.options));

        return scrollAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _getElementOffset () {
        const defaultOffsets = getOffsetOptions(this.element);

        let { offsetX, offsetY } = this.options;

        offsetX = offsetX || offsetX === 0 ? offsetX : defaultOffsets.offsetX;
        offsetY = offsetY || offsetY === 0 ? offsetY : defaultOffsets.offsetY;

        return { offsetX, offsetY };
    }

    _wrapAction (action) {
        const { offsetX, offsetY } = this._getElementOffset();

        const screenPointBeforeAction    = getAutomationPoint(this.element, offsetX, offsetY);
        const clientPositionBeforeAction = positionUtils.getClientPosition(this.element);

        return action()
            .then(() => {
                const screenPointAfterAction    = getAutomationPoint(this.element, offsetX, offsetY);
                const clientPositionAfterAction = positionUtils.getClientPosition(this.element);
                const clientPoint               = screenPointToClient(this.element, screenPointAfterAction);
                const expectedElement           = positionUtils.containsOffset(this.element, offsetX, offsetY) ? this.element : null;

                return getElementFromPoint(clientPoint.x, clientPoint.y, expectedElement)
                    .then(({ element, corrected }) => {
                        const foundElement = element;

                        if (!foundElement)
                            return new ElementState({});

                        let isTarget = !expectedElement || corrected || foundElement === this.element;

                        if (!isTarget) {
                            // NOTE: perform an operation with searching in dom only if necessary
                            isTarget = arrayUtils.indexOf(domUtils.getParents(foundElement), this.element) > -1;
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

                        return new ElementState({
                            element,
                            clientPoint,
                            screenPoint: screenPointAfterAction,
                            isTarget,
                            inMoving:    targetElementIsMoving
                        });
                    });
            });
    }

    static _checkElementState (state, useStrictElementCheck) {
        if (!state.element)
            throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

        if (useStrictElementCheck && (!state.isTarget || state.inMoving))
            throw new Error(AUTOMATION_ERROR_TYPES.foundElementIsNotTarget);
    }

    _ensureElement (useStrictElementCheck, skipCheckAfterMoving) {
        return this
            ._wrapAction(() => this._scrollToElement())
            .then(state => VisibleElementAutomation._checkElementState(state, useStrictElementCheck))
            .then(() => this._wrapAction(() => this._moveToElement()))
            .then(state => {
                if (!skipCheckAfterMoving)
                    VisibleElementAutomation._checkElementState(state, useStrictElementCheck);

                return state;
            })
            .then(state => {
                this.emit(this.TARGET_ELEMENT_FOUND_EVENT, {});

                return {
                    element:     state.element,
                    clientPoint: state.clientPoint,
                    screenPoint: state.screenPoint,
                    devicePoint: state.devicePoint
                };
            });
    }
}
