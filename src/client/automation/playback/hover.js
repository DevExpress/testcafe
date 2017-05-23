import { positionUtils } from '../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';
import getMoveArguments from '../utils/get-move-arguments';
import screenPointToClient from '../utils/screen-point-to-client';
import getAutomationPoint from '../utils/get-automation-point';
import AUTOMATION_ERROR_TYPES from '../errors';


export default class HoverAutomation {
    constructor (element, hoverOptions) {
        this.element   = element;
        this.modifiers = hoverOptions.modifiers;

        this.offsetX = hoverOptions.offsetX;
        this.offsetY = hoverOptions.offsetY;
        this.speed   = hoverOptions.speed;
    }

    _move ({ element, offsetX, offsetY, speed }) {
        var moveOptions = new MoveOptions({
            offsetX,
            offsetY,
            speed,

            modifiers: this.modifiers
        }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation.run();
    }

    _checkTopElementVisibility () {
        var screenPoint     = getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var point           = screenPointToClient(this.element, screenPoint);
        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        return getElementFromPoint(point.x, point.y, expectedElement)
            .then(topElement => {
                if (!topElement)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);
            });
    }

    run () {
        var moveArguments = getMoveArguments(this.element, { x: this.offsetX, y: this.offsetY }, this.speed);

        return this._move(moveArguments)
            .then(() => this._checkTopElementVisibility());
    }
}

