import { delay, positionUtils, domUtils, arrayUtils, serviceUtils } from '../deps/testcafe-core';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import whilst from '../utils/promise-whilst';
import { fromPoint as getElementFromPoint } from '../get-element';
import AUTOMATION_ERROR_TYPES from '../errors';
import AutomationSettings from '../settings';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';


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
        return this
            ._moveToElement()
            .then(() => {
                var offsetX      = this.options.offsetX;
                var offsetY      = this.options.offsetY;
                var screenPoint  = getAutomationPoint(this.element, offsetX, offsetY);
                var isTarget     = null;
                var foundElement = null;

                var clientPoint     = screenPointToClient(this.element, screenPoint);
                var expectedElement = positionUtils.containsOffset(this.element, offsetX, offsetY) ? this.element : null;
                var firstPosition   = positionUtils.getClientPosition(this.element);

                return getElementFromPoint(clientPoint.x, clientPoint.y, expectedElement)
                    .then(({ element, corrected }) => {
                        foundElement = element;

                        isTarget = !expectedElement || corrected || foundElement === this.element ||
                                   domUtils.containsElement(expectedElement, foundElement);

                        if (!isTarget && foundElement) {
                            // NOTE: perform an operation with searching in dom only if necessary
                            isTarget = arrayUtils.indexOf(domUtils.getParents(foundElement), this.element) > -1;
                        }

                        // NOTE: check is element in moving
                        return delay(25);
                    })
                    .then(() => {
                        var secondPosition        = positionUtils.getClientPosition(this.element);
                        var targetElementIsMoving = firstPosition.x !== secondPosition.x ||
                                                    firstPosition.y !== secondPosition.y;

                        return { element: foundElement, clientPoint, isTarget, targetElementIsMoving };
                    });
            });
    }

    ensureElement (timeout, checkInterval) {
        var element               = null;
        var isTarget              = false;
        var clientPoint           = null;
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
                    isTarget              = res.isTarget;
                    clientPoint           = res.clientPoint;
                    targetElementFound    = element && isTarget;
                    targetElementIsMoving = res.targetElementMoves;

                    return targetElementFound ? null : delay(checkInterval);
                });
        };

        this.emit(this.WAITING_FOR_ELEMENT_STARTED_EVENT, {});

        return whilst(condition, iterator)
            .then(() => {
                this.emit(this.WAITING_FOR_ELEMENT_FINISHED_EVENT, { element });

                if (!element)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return { element, clientPoint };
            });
    }
}
