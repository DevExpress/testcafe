import testCafeCore from '../../deps/testcafe-core';
import MoveAutomation from '../playback/move';
import MoveOptions from '../options/move';
import { getMoveAutomationOffsets } from '../../utils/mouse';

var positionUtils = testCafeCore.positionUtils;


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
        var moveOptions = new MoveOptions();

        moveOptions.offsetX   = offsetX;
        moveOptions.offsetY   = offsetY;
        moveOptions.modifiers = this.modifiers;

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation.run();
    }

    run () {
        var moveArguments = this._getMoveArguments();

        return this._move(moveArguments);
    }
}

