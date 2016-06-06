import {
    positionUtils
} from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import MoveAutomation from '../playback/move';
import { MoveOptions } from '../../../../test-run/commands/options';
import { getMoveAutomationOffsets } from '../../utils/mouse';
import * as mouseUtils from '../../utils/mouse';
import AUTOMATION_ERROR_TYPES from '../errors';


export default class HoverAutomation {
    constructor (element, hoverOptions) {
        this.element   = element;
        this.modifiers = hoverOptions.modifiers;

        this.offsetX = hoverOptions.offsetX;
        this.offsetY = hoverOptions.offsetY;
    }

    _getMoveArguments () {
        var clickOnElement    = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY);
        var moveActionOffsets = getMoveAutomationOffsets(this.element, this.offsetX, this.offsetY);

        return {
            element: clickOnElement ? this.element : document.documentElement,
            offsetX: moveActionOffsets.offsetX,
            offsetY: moveActionOffsets.offsetY
        };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions({
            offsetX,
            offsetY,

            modifiers: this.modifiers
        }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation.run();
    }

    _checkTopElementVisibility () {
        var screenPoint     = mouseUtils.getAutomationPoint(this.element, this.offsetX, this.offsetY);
        var point           = mouseUtils.convertToClient(this.element, screenPoint);
        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var topElement = getElementFromPoint(point.x, point.y, expectedElement);

        if (!topElement)
            throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);
    }

    run () {
        var moveArguments = this._getMoveArguments();

        return this._move(moveArguments)
            .then(() => this._checkTopElementVisibility());
    }
}

