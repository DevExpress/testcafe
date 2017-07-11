import { delay, positionUtils, domUtils } from '../deps/testcafe-core';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import whilst from '../utils/promise-whilst';
import { fromPoint as getElementFromPoint } from '../get-element';
import AUTOMATION_ERROR_TYPES from '../errors';
import AutomationSettings from '../settings';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';

export default class VisibleElementAutomation {
    constructor (element, offsetOptions) {
        this.element            = element;
        this.options            = offsetOptions;
        this.automationSettings = new AutomationSettings(offsetOptions.speed);
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
                var offsetX     = this.options.offsetX;
                var offsetY     = this.options.offsetY;
                var screenPoint = getAutomationPoint(this.element, offsetX, offsetY);

                var clientPoint     = screenPointToClient(this.element, screenPoint);
                var expectedElement = positionUtils.containsOffset(this.element, offsetX, offsetY) ? this.element : null;

                return getElementFromPoint(clientPoint.x, clientPoint.y, expectedElement)
                    .then(({ element, corrected }) => {
                        var isTarget = !expectedElement || corrected || element === this.element ||
                                       domUtils.containsElement(expectedElement, element);

                        return { element, clientPoint, isTarget };
                    });
            });
    }

    ensureElement (timeout, checkInterval) {
        var element            = null;
        var isTarget           = false;
        var clientPoint        = null;
        var timeoutExpired     = false;
        var targetElementFound = false;

        delay(timeout).then(() => {
            timeoutExpired = true;
        });

        var condition = () => !timeoutExpired && !targetElementFound;
        var iterator  = () => {
            return this
                ._findElement()
                .then(res => {
                    element            = res.element;
                    isTarget           = res.isTarget;
                    clientPoint        = res.clientPoint;
                    targetElementFound = element && isTarget;

                    return targetElementFound ? null : delay(checkInterval);
                });
        };

        return whilst(condition, iterator)
            .then(() => {
                if (!element)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return { element, clientPoint };
            });
    }
}
