import testCafeCore from '../../deps/testcafe-core';
import { utils } from '../../deps/hammerhead';
import SelectBaseAutomation from './base';
import * as selectUtils from './utils';

var textSelection = testCafeCore.textSelection;
var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;


export default class SelectTextAutomation extends SelectBaseAutomation {
    constructor (element, startPos, endPos, actionOptions) {
        super(element, utils.extend(actionOptions, { offsetX: 0, offsetY: 0 }));

        this.startPos = startPos;
        this.endPos   = endPos;
    }

    _calculateAbsoluteStartPoint () {
        var point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.startPos);

        return point || positionUtils.findCenter(this.element);
    }

    _calculateAbsoluteEndPoint () {
        var point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.endPos);

        if (point)
            return point;

        // NOTE: if selection ends on an invisible symbol, we should try to find the last visible selection position
        if (domUtils.isContentEditableElement(this.element))
            return selectUtils.getLastVisibleSelectionPosition(this.element, this.startPos, this.endPos);

        return positionUtils.findCenter(this.element);
    }

    _setSelection () {
        var isTextEditable    = domUtils.isTextEditableElement(this.element);
        var isContentEditable = domUtils.isContentEditableElement(this.element);

        if (!(isTextEditable || isContentEditable) || this.eventState.simulateDefaultBehavior === false)
            return;

        textSelection.select(this.element, this.startPos, this.endPos);
    }

    run (useStrictElementCheck) {
        return this
            ._ensureElement(useStrictElementCheck)
            .then(() => super.run());
    }
}
