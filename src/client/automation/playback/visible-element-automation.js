import { delay, positionUtils, domUtils, arrayUtils, serviceUtils } from '../deps/testcafe-core';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import whilst from '../utils/promise-whilst';
import { fromPoint as getElementFromPoint } from '../get-element';
import AUTOMATION_ERROR_TYPES from '../errors';
import AutomationSettings from '../settings';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';

const CHECK_ELEMENT_MOVING_DELAY = 25;

export default class VisibleElementAutomation extends serviceUtils.EventEmitter {
    constructor (element, offsetOptions) {
        super();

        this.WAITING_FOR_ELEMENT_STARTED_EVENT  = 'automation|waiting-element-started-event';
        this.WAITING_FOR_ELEMENT_FINISHED_EVENT = 'automation|waiting-element-finished-event';

        this.element            = element;
        this.options            = offsetOptions;
        this.automationSettings = new AutomationSettings(offsetOptions.speed);
    }

    _getElementForEvent (eventArgs) {
        var { x, y }        = eventArgs.point;
        var expectedElement = positionUtils.containsOffset(this.element, this.options.offsetX, this.options.offsetY) ? this.element : null;

        return getElementFromPoint(x, y, expectedElement).then(({ element }) => element);
    }

    _moveToElement () {
        var moveOptions    = new MoveOptions(this.options, false);
        var moveAutomation = new MoveAutomation(this.element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _findElement () {
        var offsetX               = this.options.offsetX;
        var offsetY               = this.options.offsetY;
        var initialScreenPoint    = getAutomationPoint(this.element, offsetX, offsetY);
        var initialClientPosition = positionUtils.getClientPosition(this.element);

        return this
            ._moveToElement()
            .then(() => {
                var screenPointAfterMove = getAutomationPoint(this.element, offsetX, offsetY);
                var isTarget             = null;
                var foundElement         = null;

                var clientPoint               = screenPointToClient(this.element, screenPointAfterMove);
                var expectedElement           = positionUtils.containsOffset(this.element, offsetX, offsetY) ? this.element : null;
                var clientPositionBeforeDelay = positionUtils.getClientPosition(this.element);

                return getElementFromPoint(clientPoint.x, clientPoint.y, expectedElement)
                    .then(({ element, corrected }) => {
                        foundElement = element;

                        if (foundElement) {
                            isTarget = !expectedElement || corrected || foundElement === this.element;

                            if (!isTarget) {
                                // NOTE: perform an operation with searching in dom only if necessary
                                isTarget = arrayUtils.indexOf(domUtils.getParents(foundElement), this.element) > -1;
                            }
                        }

                        // NOTE: check is element in moving
                        return delay(CHECK_ELEMENT_MOVING_DELAY);
                    })
                    .then(() => {
                        var clientPositionAfterDelay         = positionUtils.getClientPosition(this.element);
                        var offsetPositionChangedAfterMoving = initialScreenPoint.x !== screenPointAfterMove.x ||
                                                               initialScreenPoint.y !== screenPointAfterMove.y;
                        var clientPositionChangedAfterMoving = initialClientPosition.x !== clientPositionBeforeDelay.x ||
                                                               initialClientPosition.y !== clientPositionAfterDelay.y;
                        var clientPositionChangedAfterDelay  = clientPositionBeforeDelay.x !== clientPositionAfterDelay.x ||
                                                               clientPositionBeforeDelay.y !== clientPositionAfterDelay.y;

                        // NOTE: The page may be scrolled during moving. We consider the element moved if its offset
                        // position and client position are changed both. If only client position was changed it means
                        // the page was scrolled and the element keeps its position on the page. If only offset position
                        // was changed it means the element is fixed on the page (it can be implemented via script).
                        var targetElementIsMoving = offsetPositionChangedAfterMoving && clientPositionChangedAfterMoving ||
                                                    clientPositionChangedAfterDelay;

                        return {
                            element:     foundElement,
                            clientPoint,
                            screenPoint: screenPointAfterMove,
                            isTarget,
                            targetElementIsMoving
                        };
                    });
            });
    }

    _ensureElement (timeout, checkInterval) {
        var element               = null;
        var clientPoint           = null;
        var screenPoint           = null;
        var timeoutExpired        = false;
        var targetElementFound    = false;
        var targetElementIsMoving = false;

        delay(timeout).then(() => {
            timeoutExpired = true;
        });

        var condition = () => !timeoutExpired && (!targetElementFound || targetElementIsMoving);
        var iterator  = () => {
            return this
                ._findElement()
                .then(res => {
                    element               = res.element;
                    clientPoint           = res.clientPoint;
                    screenPoint           = res.screenPoint;
                    targetElementFound    = res.isTarget;
                    targetElementIsMoving = res.targetElementIsMoving;

                    return targetElementFound ? null : delay(checkInterval);
                });
        };

        this.emit(this.WAITING_FOR_ELEMENT_STARTED_EVENT, {});

        return whilst(condition, iterator)
            .then(() => {
                this.emit(this.WAITING_FOR_ELEMENT_FINISHED_EVENT, { element });

                if (!element)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return { element, clientPoint, screenPoint };
            });
    }
}
