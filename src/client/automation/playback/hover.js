import { positionUtils } from '../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';
import screenPointToClient from '../utils/screen-point-to-client';
import getAutomationPoint from '../utils/get-automation-point';
import AUTOMATION_ERROR_TYPES from '../errors';
import tryUntilTimeout from '../utils/try-until-timeout';

export default class HoverAutomation {
    constructor (element, hoverOptions) {
        this.element = element;
        this.options = hoverOptions;
    }

    _move () {
        var moveOptions    = new MoveOptions(this.options, false);
        var moveAutomation = new MoveAutomation(this.element, moveOptions);

        return moveAutomation.run();
    }

    _checkTopElementVisibility () {
        var screenPoint     = getAutomationPoint(this.element, this.options.offsetX, this.options.offsetY);
        var point           = screenPointToClient(this.element, screenPoint);
        var expectedElement = positionUtils.containsOffset(this.element, this.options.offsetX, this.options.offsetY) ?
                              this.element : null;

        return getElementFromPoint(point.x, point.y, expectedElement)
            .then(topElement => {
                if (!topElement)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);
            });
    }

    run (selectorTimeout, checkElementInterval) {
        return tryUntilTimeout(() => {
            return this._move()
                .then(() => this._checkTopElementVisibility());
        }, selectorTimeout, checkElementInterval);
    }
}

